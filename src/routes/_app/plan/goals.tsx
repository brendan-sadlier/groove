// src/routes/_app/plan/goals.tsx
import { ConfirmDelete } from '@/components/app/confirm-delete'
import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { GoalForm } from '@/components/app/plan/goal-form'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from '@/lib/mutations'
import { goalsQuery } from '@/lib/queries'
import type { GoalWithProgress } from '@/lib/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/plan/goals')({
  loader: ({ context }) => context.queryClient.ensureQueryData(goalsQuery()),
  pendingComponent: () => (
    <>
      <PageHeader title="Goals" />
      <ListSkeleton />
    </>
  ),
  component: GoalsPage,
})

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

function GoalsPage() {
  const { data: goals } = useSuspenseQuery(goalsQuery())
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<GoalWithProgress | null>(null)
  const create = useCreateGoal()
  const del = useDeleteGoal()

  return (
    <>
      <PageHeader
        title="Goals"
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a weekly or monthly target to stay on track."
          action={<Button onClick={() => setCreating(true)}>Add a goal</Button>}
        />
      ) : (
        <ul className="space-y-3 p-4">
          {goals.map((g) => {
            const pct =
              g.target > 0
                ? Math.min(100, Math.round((g.current / g.target) * 100))
                : 0
            return (
              <li key={g.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{g.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {g.period} · {g.metric}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(g)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmDelete
                      title="Delete goal?"
                      onConfirm={() => del.mutate(g.id)}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Progress value={pct} />
                  <p className="text-right text-xs text-muted-foreground">
                    {g.current} / {g.target}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <FormDrawer open={creating} onOpenChange={setCreating} title="New goal">
        <GoalForm
          submitting={create.isPending}
          onSubmit={(v) =>
            create.mutate(v, { onSuccess: () => setCreating(false) })
          }
        />
      </FormDrawer>
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
    </>
  )
}
