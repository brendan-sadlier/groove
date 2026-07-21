import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { WorkoutForm } from '@/components/app/train/workout-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCreateWorkout } from '@/lib/mutations'
import { workoutsQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Dumbbell, Link, Plus } from 'lucide-react'
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
    <>
      <PageHeader
        title="Train"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          description="Add a golf-specific workout to build your training log."
          action={<Button onClick={() => setOpen(true)}>Log a workout</Button>}
        />
      ) : (
        <ul className="divide-y">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link
                to="/train/$workoutId"
                params={{ workoutId: w.id }}
                className="flex items-center justify-between px-4 py-3 active:bg-muted"
              >
                <div>
                  <p className="font-medium">{w.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(w.date).toLocaleDateString()} · {w.durationMin}{' '}
                    min
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {w.category}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <FormDrawer open={open} onOpenChange={setOpen} title="New workout">
        <WorkoutForm
          submitting={create.isPending}
          onSubmit={(v) =>
            create.mutate(v, { onSuccess: () => setOpen(false) })
          }
        />
      </FormDrawer>
    </>
  )
}
