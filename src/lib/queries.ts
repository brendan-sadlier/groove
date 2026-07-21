import { getActivity } from '@/lib/server/activity'
import { getGoals } from '@/lib/server/goals'
import { getRoutine, getRoutines } from '@/lib/server/routines'
import { getSession, getSessions } from '@/lib/server/sessions'
import { getWorkout, getWorkouts } from '@/lib/server/workouts'
import { queryOptions } from '@tanstack/react-query'

export const sessionsQuery = () =>
  queryOptions({ queryKey: ['sessions'], queryFn: () => getSessions() })

export const sessionQuery = (id: string) =>
  queryOptions({
    queryKey: ['sessions', id],
    queryFn: () => getSession({ data: id }),
  })

export const workoutsQuery = () =>
  queryOptions({ queryKey: ['workouts'], queryFn: () => getWorkouts() })

export const workoutQuery = (id: string) =>
  queryOptions({
    queryKey: ['workouts', id],
    queryFn: () => getWorkout({ data: id }),
  })

export const routinesQuery = () =>
  queryOptions({ queryKey: ['routines'], queryFn: () => getRoutines() })

export const routineQuery = (id: string) =>
  queryOptions({
    queryKey: ['routines', id],
    queryFn: () => getRoutine({ data: id }),
  })

export const goalsQuery = () =>
  queryOptions({ queryKey: ['goals'], queryFn: () => getGoals() })

export const activityQuery = (limit = 50) =>
  queryOptions({
    queryKey: ['activity', limit],
    queryFn: () => getActivity({ data: { limit } }),
  })
