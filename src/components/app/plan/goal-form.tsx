import {
    NumberField,
    SelectField,
    TextField,
} from '@/components/app/form-fields'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { GOAL_METRICS, GOAL_PERIODS } from '@/lib/constants'
import type { GoalWithProgress } from '@/lib/types'
import { goalInputSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

type FormIn = z.input<typeof goalInputSchema>
type FormOut = z.output<typeof goalInputSchema>

export function GoalForm({
  goal,
  submitting,
  onSubmit,
}: {
  goal?: GoalWithProgress
  submitting?: boolean
  onSubmit: (values: FormOut) => void
}) {
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(goalInputSchema),
    defaultValues: goal
      ? {
          title: goal.title,
          metric: goal.metric,
          target: goal.target,
          period: goal.period,
        }
      : {
          title: '',
          metric: 'sessions',
          target: undefined as unknown as number,
          period: 'weekly',
        },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <TextField
          control={form.control}
          name="title"
          label="Title"
          placeholder="3 sessions a week"
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            control={form.control}
            name="metric"
            label="Metric"
            options={GOAL_METRICS}
          />
          <SelectField
            control={form.control}
            name="period"
            label="Period"
            options={GOAL_PERIODS}
          />
        </div>
        <NumberField
          control={form.control}
          name="target"
          label="Target"
          placeholder="3"
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
        </Button>
      </FieldGroup>
    </form>
  )
}
