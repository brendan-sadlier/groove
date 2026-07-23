import {
  DateField,
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from '@/components/app/form-fields'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { INTENSITIES } from '@/lib/constants'
import { computeShotTotals } from '@/lib/shots'
import type { SessionWithDrills } from '@/lib/types'
import { sessionInputSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { z } from 'zod'

type FormIn = z.input<typeof sessionInputSchema>
type FormOut = z.output<typeof sessionInputSchema>

function toDefaults(
  session?: SessionWithDrills,
  seedDrills?: string[],
): FormIn {
  if (session) {
    return {
      title: session.title,
      focus: session.focus,
      date: session.date.slice(0, 10),
      intensity: session.intensity,
      notes: session.notes ?? undefined,
      drills: session.drills.map((d) => ({
        name: d.name,
        shotsAttempted: d.shotsAttempted,
        shotsMade: d.shotsMade ?? undefined,
        notes: d.notes ?? undefined,
      })),
    }
  }
  return {
    title: '',
    focus: '',
    date: new Date().toISOString().slice(0, 10),
    intensity: 'moderate',
    notes: undefined,
    drills: (seedDrills ?? []).map((name) => ({
      name,
      shotsAttempted: undefined as unknown as number,
      shotsMade: undefined,
      notes: undefined,
    })),
  }
}

export function SessionForm({
  session,
  seedDrills,
  submitting,
  onSubmit,
}: {
  session?: SessionWithDrills
  seedDrills?: string[]
  submitting?: boolean
  onSubmit: (values: FormOut) => void
}) {
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(sessionInputSchema),
    defaultValues: toDefaults(session, seedDrills),
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'drills',
  })
  const watched = form.watch('drills') ?? []
  const totals = computeShotTotals(
    watched.map((d) => ({
      shotsAttempted: Number(d.shotsAttempted) || 0,
      shotsMade: d.shotsMade == null ? null : Number(d.shotsMade),
    })),
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <TextField
          control={form.control}
          name="title"
          label="Title"
          placeholder="e.g. Short Game Circuit"
        />
        <TextField
          control={form.control}
          name="focus"
          label="Focus"
          placeholder="e.g. Chipping"
        />
        <div className="grid grid-cols-2 gap-3">
          <DateField control={form.control} name="date" label="Date" />
          <SelectField
            control={form.control}
            name="intensity"
            label="Intensity"
            options={INTENSITIES}
          />
        </div>

        <FieldSet>
          <div className="flex items-center justify-between">
            <FieldLegend variant="label">Drills</FieldLegend>
            <span className="text-xs text-muted-foreground">
              {totals.attempted} attempted
              {totals.made != null ? ` · ${totals.made} made` : ''}
            </span>
          </div>
          <FieldGroup>
            {fields.map((f, i) => (
              <div key={f.id} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Drill {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <FieldGroup>
                  <TextField
                    control={form.control}
                    name={`drills.${i}.name`}
                    label="Name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      control={form.control}
                      name={`drills.${i}.shotsAttempted`}
                      label="Attempted"
                    />
                    <NumberField
                      control={form.control}
                      name={`drills.${i}.shotsMade`}
                      label="Made"
                    />
                  </div>
                </FieldGroup>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({
                  name: '',
                  shotsAttempted: undefined as unknown as number,
                  shotsMade: undefined,
                  notes: undefined,
                })
              }
            >
              <Plus className="size-4" /> Add drill
            </Button>
          </FieldGroup>
        </FieldSet>

        <TextareaField
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Optional"
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Saving…' : session ? 'Save changes' : 'Create session'}
        </Button>
      </FieldGroup>
    </form>
  )
}
