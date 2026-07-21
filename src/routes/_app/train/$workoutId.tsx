import { ConfirmDelete } from '@/components/app/confirm-delete'
import { FormDrawer } from '@/components/app/form-drawer'
import { PageHeader } from '@/components/app/page-header'
import { WorkoutForm } from '@/components/app/train/workout-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeleteWorkout, useUpdateWorkout } from '@/lib/mutations'
import { workoutQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/train/$workoutId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(workoutQuery(params.workoutId)),
  component: WorkoutDetail,
})

function WorkoutDetail() {
  const { workoutId } = Route.useParams()
  const router = useRouter()
  const { data: workout } = useSuspenseQuery(workoutQuery(workoutId))
  const [editing, setEditing] = useState(false)
  const update = useUpdateWorkout(workoutId)
  const del = useDeleteWorkout()

  if (!workout) {
    return (
      <>
        <PageHeader title="Not found" />
        <p className="p-6 text-sm text-muted-foreground">
          This workout doesn't exist.
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={workout.title}
        action={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
            </Button>
            <ConfirmDelete
              title="Delete workout?"
              description="This removes the workout and its exercises."
              onConfirm={() =>
                del.mutate(workoutId, {
                  onSuccess: () => router.navigate({ to: '/train' }),
                })
              }
              trigger={
                <Button variant="ghost" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              }
            />
          </div>
        }
      />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="capitalize">
            {workout.category}
          </Badge>
          <span>
            {new Date(workout.date).toLocaleDateString()} ·{' '}
            {workout.durationMin} min
          </span>
        </div>
        <ul className="divide-y rounded-lg border">
          {workout.exercises.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <span>{e.name}</span>
              <span className="text-sm text-muted-foreground">
                {e.sets}×{e.reps != null ? e.reps : `${e.timeSec}s`}
                {e.weight != null ? ` · ${e.weight}kg` : ''}
              </span>
            </li>
          ))}
        </ul>
        {workout.notes ? (
          <div className="rounded-lg border p-4 text-sm">
            <p className="mb-1 font-medium">Notes</p>
            <p className="text-muted-foreground">{workout.notes}</p>
          </div>
        ) : null}
      </div>

      <FormDrawer open={editing} onOpenChange={setEditing} title="Edit workout">
        <WorkoutForm
          workout={workout}
          submitting={update.isPending}
          onSubmit={(v) =>
            update.mutate(v, { onSuccess: () => setEditing(false) })
          }
        />
      </FormDrawer>
    </>
  )
}
