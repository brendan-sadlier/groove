import { FormDrawer } from '@/components/app/form-drawer'
import { GoalForm } from '@/components/app/plan/goal-form'
import { RoutineForm } from '@/components/app/plan/routine-form'
import { SessionForm } from '@/components/app/practice/session-form'
import { WorkoutForm } from '@/components/app/train/workout-form'
import {
    useCreateGoal,
    useCreateRoutine,
    useCreateSession,
    useCreateWorkout,
} from '@/lib/mutations'
import { useRouter } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Dumbbell, ListChecks, Target, Trophy } from 'lucide-react'
import { useState } from 'react'

type EntryType = 'session' | 'workout' | 'routine' | 'goal'

const options: {
  type: EntryType
  label: string
  description: string
  icon: LucideIcon
}[] = [
  {
    type: 'session',
    label: 'Practice session',
    description: 'Log drills and shots',
    icon: Target,
  },
  {
    type: 'workout',
    label: 'Workout',
    description: 'Log exercises and duration',
    icon: Dumbbell,
  },
  {
    type: 'routine',
    label: 'Routine',
    description: 'A reusable warmup or practice plan',
    icon: ListChecks,
  },
  {
    type: 'goal',
    label: 'Goal',
    description: 'A weekly or monthly target',
    icon: Trophy,
  },
]

const titles: Record<EntryType, string> = {
  session: 'New session',
  workout: 'New workout',
  routine: 'New routine',
  goal: 'New goal',
}

export function CreateMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [type, setType] = useState<EntryType | null>(null)

  const createSession = useCreateSession()
  const createWorkout = useCreateWorkout()
  const createRoutine = useCreateRoutine()
  const createGoal = useCreateGoal()

  // Reset to the picker whenever the drawer opens (not on close, so the
  // content doesn't flip mid-animation).
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) setType(null)
  }

  const done = (to: () => void) => () => {
    onOpenChange(false)
    to()
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={type ? titles[type] : 'Create'}
      description={type ? undefined : 'What would you like to add?'}
      onBack={type ? () => setType(null) : undefined}
    >
      {type === null ? (
        <div className="grid gap-2 pb-2">
          {options.map(({ type: t, label, description, icon: Icon }) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex items-center gap-3 rounded-lg border p-3 text-left active:bg-muted"
            >
              <span className="rounded-full bg-muted p-2">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {type === 'session' ? (
        <SessionForm
          submitting={createSession.isPending}
          onSubmit={(v) =>
            createSession.mutate(v, {
              onSuccess: done(() => router.navigate({ to: '/practice' })),
            })
          }
        />
      ) : null}

      {type === 'workout' ? (
        <WorkoutForm
          submitting={createWorkout.isPending}
          onSubmit={(v) =>
            createWorkout.mutate(v, {
              onSuccess: done(() => router.navigate({ to: '/train' })),
            })
          }
        />
      ) : null}

      {type === 'routine' ? (
        <RoutineForm
          submitting={createRoutine.isPending}
          onSubmit={(v) =>
            createRoutine.mutate(v, {
              onSuccess: done(() =>
                router.navigate({ to: '/plan', search: { tab: 'routines' } }),
              ),
            })
          }
        />
      ) : null}

      {type === 'goal' ? (
        <GoalForm
          submitting={createGoal.isPending}
          onSubmit={(v) =>
            createGoal.mutate(v, {
              onSuccess: done(() =>
                router.navigate({ to: '/plan', search: { tab: 'goals' } }),
              ),
            })
          }
        />
      ) : null}
    </FormDrawer>
  )
}
