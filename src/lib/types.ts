import type {
    Drill,
    Exercise,
    Goal,
    Routine,
    RoutineItem,
    Session,
    Workout,
} from '@/db/schema'

export type SessionWithDrills = Session & { drills: Drill[] }
export type WorkoutWithExercises = Workout & { exercises: Exercise[] }
export type RoutineWithItems = Routine & { items: RoutineItem[] }
export type GoalWithProgress = Goal & { current: number }

export type ActivityEntry =
  | {
      kind: 'practice'
      id: string
      date: string
      createdAt: number
      title: string
      focus: string
      totalShotsAttempted: number
      totalShotsMade: number | null
    }
  | {
      kind: 'gym'
      id: string
      date: string
      createdAt: number
      title: string
      category: Workout['category']
      durationMin: number
    }
