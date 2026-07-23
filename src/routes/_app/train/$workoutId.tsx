import { ConfirmDelete } from '@/components/app/confirm-delete'
import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { PageHeader } from '@/components/app/page-header'
import { WorkoutForm } from '@/components/app/train/workout-form'
import { LostIllustration } from '@/components/illustrations/lost'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateLong, formatDuration } from '@/lib/date'
import { useDeleteWorkout, useUpdateWorkout } from '@/lib/mutations'
import { workoutQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CalendarDays, Clock, Pencil, Trash2 } from 'lucide-react'
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
      <div className="flex flex-col gap-5">
        <PageHeader title="Workout" />
        <EmptyState
          illustration={<LostIllustration className="size-48" />}
          title="Workout Not Found"
          description="This workout may have been deleted."
        />
      </div>
    )
  }

  const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0) || 0

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={workout.title}
        showBack
        subtitle={`${workout.category.charAt(0).toUpperCase() + workout.category.slice(1)} Training`}
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <CalendarDays className="size-3" aria-hidden />
          {formatDateLong(workout.date)}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock className="size-3" aria-hidden />
          {formatDuration(workout.durationMin)}
        </Badge>
        <Badge variant="secondary">{totalSets} total sets</Badge>
      </div>

      {workout.notes && (
        <Card size="sm">
          <CardContent>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Notes
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty">
              {workout.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Exercises</h2>
          <span className="text-xs text-muted-foreground">
            {workout.exercises.length} movements
          </span>
        </div>
        {workout.exercises.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No exercises recorded.
          </p>
        ) : (
          <Card size="sm">
            <CardContent className="flex flex-col">
              <div className="mb-1 grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border pb-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                <span>Exercise</span>
                <span className="w-14 text-right">Sets×Reps</span>
                <span className="w-12 text-right">Load</span>
              </div>
              {workout.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <span className="truncate text-sm font-medium">
                    {ex.name}
                  </span>
                  <span className="w-14 text-right font-mono text-sm tabular-nums">
                    {`${ex.sets}`}×
                    {`${ex.reps != null ? ex.reps : `${ex.timeSec}s`}`}
                  </span>
                  <span className="w-12 text-right font-mono text-sm text-muted-foreground tabular-nums">
                    {ex.weight ? `${ex.weight}` : '—'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 w-full"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" aria-hidden />
          Edit
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
            <Button variant="destructive" className="flex-1 w-full">
              <Trash2 className="size-4" />
              Delete
            </Button>
          }
        />
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
    </div>
  )
}
