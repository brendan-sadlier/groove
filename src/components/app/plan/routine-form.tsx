import {
    SelectField,
    TextField,
    TextareaField,
} from '@/components/app/form-fields'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { ROUTINE_ITEM_KINDS } from '@/lib/constants'
import type { RoutineWithItems } from '@/lib/types'
import { routineInputSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { z } from 'zod'

type FormIn = z.input<typeof routineInputSchema>
type FormOut = z.output<typeof routineInputSchema>

function toDefaults(r?: RoutineWithItems): FormIn {
  if (r) {
    return {
      name: r.name,
      description: r.description,
      items: r.items.map((it) => ({ label: it.label, kind: it.kind })),
    }
  }
  return { name: '', description: '', items: [] }
}

export function RoutineForm({
  routine,
  submitting,
  onSubmit,
}: {
  routine?: RoutineWithItems
  submitting?: boolean
  onSubmit: (values: FormOut) => void
}) {
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(routineInputSchema),
    defaultValues: toDefaults(routine),
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <TextField
          control={form.control}
          name="name"
          label="Name"
          placeholder="Pre-round warmup"
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Optional"
        />

        <FieldSet>
          <FieldLegend variant="label">Items</FieldLegend>
          <FieldGroup>
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="flex items-end gap-2 rounded-lg border p-3"
              >
                <div className="flex-1">
                  <TextField
                    control={form.control}
                    name={`items.${i}.label`}
                    label="Label"
                  />
                </div>
                <div className="w-28">
                  <SelectField
                    control={form.control}
                    name={`items.${i}.kind`}
                    label="Kind"
                    options={ROUTINE_ITEM_KINDS}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ label: '', kind: 'practice' })}
            >
              <Plus className="size-4" /> Add item
            </Button>
          </FieldGroup>
        </FieldSet>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Saving…' : routine ? 'Save changes' : 'Create routine'}
        </Button>
      </FieldGroup>
    </form>
  )
}
