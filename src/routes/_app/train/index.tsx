import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { WorkoutForm } from '@/components/app/train/workout-form'
import { TrainingIllustration } from '@/components/illustrations/training'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration, relativeDay } from '@/lib/date'
import { useCreateWorkout } from '@/lib/mutations'
import { workoutsQuery } from '@/lib/queries'
import type { WorkoutWithExercises } from '@/lib/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Clock, Dumbbell, Layers, Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/train/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(workoutsQuery()),
  pendingComponent: () => (
    <>
      <PageHeader title="Train" />
      <ListSkeleton />
    </>
  ),
  component: TrainPage,
})

function TrainPage() {
  const { data: workouts } = useSuspenseQuery(workoutsQuery())
  const [open, setOpen] = useState(false)
  const create = useCreateWorkout()
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Train"
        subtitle={`${workouts.length} workout${workouts.length === 1 ? '' : 's'}`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {workouts.length === 0 ? (
        <EmptyState
          illustration={<TrainingIllustration className="h-42 w-42" />}
          title="No Workouts Yet"
          description="Add your first workout to track exercises, sets, and loads."
          action={<Button onClick={() => setOpen(true)}>Log a Workout</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}

      <FormDrawer open={open} onOpenChange={setOpen} title="New workout">
        <WorkoutForm
          submitting={create.isPending}
          onSubmit={(v) =>
            create.mutate(v, { onSuccess: () => setOpen(false) })
          }
        />
      </FormDrawer>
    </div>
  )
}

function WorkoutCard({ workout }: { workout: WorkoutWithExercises }) {
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0) || 0
  return (
    <Link
      to="/train/$workoutId"
      params={{ workoutId: workout.id }}
      className="w-full text-left transition-transform active:scale-[0.99]"
    >
      <Card size="sm" className="ring-foreground/10 hover:ring-foreground/20">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
                <Dumbbell className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{workout.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {workout.category.charAt(0).toUpperCase() +
                    workout.category.slice(1)}{' '}
                  · {relativeDay(workout.date)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Layers className="size-3" aria-hidden />
              {workout.exercises.length} exercise
              {workout.exercises.length === 1 ? '' : 's'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {totalSets} sets
            </Badge>
            <Badge variant="outline" className="ml-auto gap-1">
              <Clock className="size-3" aria-hidden />
              {formatDuration(workout.durationMin)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
