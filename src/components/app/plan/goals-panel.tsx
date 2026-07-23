// src/components/plan/goals-panel.tsx
import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { TargetIllustration } from '@/components/illustrations/target'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDeleteGoal, useUpdateGoal } from '@/lib/mutations'
import { goalsQuery } from '@/lib/queries'
import type { GoalWithProgress } from '@/lib/types'
import { pct } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDelete } from '../confirm-delete'
import { GoalForm } from './goal-form'
import { GoalProgressBar } from './goal-progress-bar'

function EditGoal({
  goal,
  onDone,
}: {
  goal: GoalWithProgress
  onDone: () => void
}) {
  const update = useUpdateGoal(goal.id)
  return (
    <GoalForm
      goal={goal}
      submitting={update.isPending}
      onSubmit={(v) => update.mutate(v, { onSuccess: onDone })}
    />
  )
}

export function GoalsPanel({ onCreate }: { onCreate: () => void }) {
  const { data: goals } = useSuspenseQuery(goalsQuery())
  const [editing, setEditing] = useState<GoalWithProgress | null>(null)

  if (goals.length === 0) {
    return (
      <EmptyState
        illustration={<TargetIllustration className="size-48" />}
        title="No Goals Yet"
        description="Set a weekly or monthly target to stay on track."
        action={<Button onClick={onCreate}>Create a Goal</Button>}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((g) => {
        return <GoalRow key={g.id} goal={g} setEditing={setEditing} />
      })}

      <FormDrawer
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null)
        }}
        title="Edit goal"
      >
        {editing ? (
          <EditGoal goal={editing} onDone={() => setEditing(null)} />
        ) : null}
      </FormDrawer>
    </div>
  )
}

interface GoalRowProps {
  goal: GoalWithProgress
  setEditing: (goal: GoalWithProgress | null) => void
}

function GoalRow({ goal, setEditing }: GoalRowProps) {
  const del = useDeleteGoal()
  const done = pct(goal.current, goal.target) >= 100

  return (
    <Card size="sm" className="ring-foreground/10">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{goal.title}</p>
              {done && (
                <CheckCircle2 className="size-4 text-success" aria-hidden />
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge variant="secondary" className="capitalize">
                {goal.period}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {goal.metric}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditing(goal)}>
            <Pencil className="size-4" />
          </Button>
          <ConfirmDelete
            title="Delete goal?"
            onConfirm={() => del.mutate(goal.id)}
            trigger={
              <Button variant="ghost" size="icon">
                <Trash2 className="size-4" />
              </Button>
            }
          />
        </div>
        <GoalProgressBar
          current={goal.current}
          target={goal.target}
          unit={goal.metric}
        />
      </CardContent>
    </Card>
  )
}
