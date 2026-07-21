import {
    NumberField,
    SelectField,
    TextField,
    TextareaField,
} from '@/components/app/form-fields'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WORKOUT_CATEGORIES } from '@/lib/constants'
import type { WorkoutWithExercises } from '@/lib/types'
import { workoutInputSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { useFieldArray, useForm } from 'react-hook-form'
import type { z } from 'zod'

type FormIn = z.input<typeof workoutInputSchema>
type FormOut = z.output<typeof workoutInputSchema>

function toDefaults(w?: WorkoutWithExercises): FormIn {
  if (w) {
    return {
      title: w.title,
      category: w.category,
      date: w.date.slice(0, 10),
      durationMin: w.durationMin,
      notes: w.notes ?? undefined,
      exercises: w.exercises.map((e) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps ?? undefined,
        timeSec: e.timeSec ?? undefined,
        weight: e.weight ?? undefined,
      })),
    }
  }
  return {
    title: '',
    category: 'strength',
    date: new Date().toISOString().slice(0, 10),
    durationMin: undefined as unknown as number,
    notes: undefined,
    exercises: [],
  }
}

function ExerciseRow({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<FormIn, unknown, FormOut>
  index: number
  onRemove: () => void
}) {
  const timeSec = form.watch(`exercises.${index}.timeSec`)
  const mode: 'reps' | 'time' = timeSec != null ? 'time' : 'reps'
  const setMode = (next: string) => {
    if (next === 'reps') form.setValue(`exercises.${index}.timeSec`, undefined)
    else form.setValue(`exercises.${index}.reps`, undefined)
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Exercise {index + 1}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      <FieldGroup>
        <TextField
          control={form.control}
          name={`exercises.${index}.name`}
          label="Name"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            control={form.control}
            name={`exercises.${index}.sets`}
            label="Sets"
          />
          <NumberField
            control={form.control}
            name={`exercises.${index}.weight`}
            label="Weight (kg)"
            step="0.5"
          />
        </div>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reps">Reps</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === 'reps' ? (
          <NumberField
            control={form.control}
            name={`exercises.${index}.reps`}
            label="Reps"
          />
        ) : (
          <NumberField
            control={form.control}
            name={`exercises.${index}.timeSec`}
            label="Seconds"
          />
        )}
      </FieldGroup>
    </div>
  )
}

export function WorkoutForm({
  workout,
  submitting,
  onSubmit,
}: {
  workout?: WorkoutWithExercises
  submitting?: boolean
  onSubmit: (values: FormOut) => void
}) {
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(workoutInputSchema),
    defaultValues: toDefaults(workout),
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <TextField
          control={form.control}
          name="title"
          label="Title"
          placeholder="Lower body power"
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            control={form.control}
            name="category"
            label="Category"
            options={WORKOUT_CATEGORIES}
          />
          <NumberField
            control={form.control}
            name="durationMin"
            label="Duration (min)"
          />
        </div>
        <TextField control={form.control} name="date" label="Date" />

        <FieldSet>
          <FieldLegend variant="label">Exercises</FieldLegend>
          <FieldGroup>
            {fields.map((f, i) => (
              <ExerciseRow
                key={f.id}
                form={form}
                index={i}
                onRemove={() => remove(i)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({
                  name: '',
                  sets: undefined as unknown as number,
                  reps: undefined,
                  timeSec: undefined,
                  weight: undefined,
                })
              }
            >
              <Plus className="size-4" /> Add exercise
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
          {submitting ? 'Saving…' : workout ? 'Save changes' : 'Create workout'}
        </Button>
      </FieldGroup>
    </form>
  )
}
