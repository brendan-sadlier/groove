import {
  goalsApi,
  routinesApi,
  sessionsApi,
  workoutsApi,
} from '@/lib/api-client'
import { computeShotTotals } from '@/lib/shots'
import type {
  GoalWithProgress,
  RoutineWithItems,
  SessionWithDrills,
  WorkoutWithExercises,
} from '@/lib/types'
import type {
  GoalInput,
  GoalUpdate,
  RoutineInput,
  RoutineUpdate,
  SessionInput,
  SessionUpdate,
  WorkoutInput,
  WorkoutUpdate,
} from '@/lib/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

const msg = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback

function optimisticSession(input: SessionInput): SessionWithDrills {
  const now = Date.now()
  const id = `temp-${now}`
  const totals = computeShotTotals(input.drills)
  return {
    id,
    userId: '',
    title: input.title,
    focus: input.focus,
    date: input.date,
    intensity: input.intensity,
    notes: input.notes ?? null,
    totalShotsAttempted: totals.attempted,
    totalShotsMade: totals.made,
    createdAt: now,
    updatedAt: now,
    drills: input.drills.map((d, i) => ({
      id: `${id}-${i}`,
      sessionId: id,
      name: d.name,
      shotsAttempted: d.shotsAttempted,
      shotsMade: d.shotsMade ?? null,
      notes: d.notes ?? null,
      sortOrder: i,
    })),
  }
}

function optimisticWorkout(input: WorkoutInput): WorkoutWithExercises {
  const now = Date.now()
  const id = `temp-${now}`
  return {
    id,
    userId: '',
    title: input.title,
    category: input.category,
    date: input.date,
    durationMin: input.durationMin,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
    exercises: input.exercises.map((e, i) => ({
      id: `${id}-${i}`,
      workoutId: id,
      name: e.name,
      sets: e.sets,
      reps: e.reps ?? null,
      timeSec: e.timeSec ?? null,
      weight: e.weight ?? null,
      sortOrder: i,
    })),
  }
}

function optimisticRoutine(input: RoutineInput): RoutineWithItems {
  const id = `temp-${Date.now()}`
  return {
    id,
    userId: '',
    name: input.name,
    description: input.description,
    items: input.items.map((it, i) => ({
      id: `${id}-${i}`,
      routineId: id,
      label: it.label,
      kind: it.kind,
      sortOrder: i,
    })),
  }
}

export function useCreateSession() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: SessionInput) => sessionsApi.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['sessions'] })
      const prev = qc.getQueryData<SessionWithDrills[]>(['sessions'])
      qc.setQueryData<SessionWithDrills[]>(['sessions'], (old = []) => [
        optimisticSession(input),
        ...old,
      ])
      return { prev }
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['sessions'], ctx.prev)
      toast.error(msg(e, 'Failed to save session'))
    },
    onSuccess: () => toast.success('Session saved'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}

export function useUpdateSession(id: string) {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: SessionUpdate) => sessionsApi.update(id, input),
    onError: (e) => toast.error(msg(e, 'Failed to update session')),
    onSuccess: () => toast.success('Session updated'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['sessions', id] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['sessions'] })
      const prev = qc.getQueryData<SessionWithDrills[]>(['sessions'])
      qc.setQueryData<SessionWithDrills[]>(['sessions'], (old = []) =>
        old.filter((s) => s.id !== id),
      )
      return { prev }
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['sessions'], ctx.prev)
      toast.error(msg(e, 'Failed to delete session'))
    },
    onSuccess: () => toast.success('Session deleted'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}

export function useCreateWorkout() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: WorkoutInput) => workoutsApi.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['workouts'] })
      const prev = qc.getQueryData<WorkoutWithExercises[]>(['workouts'])
      qc.setQueryData<WorkoutWithExercises[]>(['workouts'], (old = []) => [
        optimisticWorkout(input),
        ...old,
      ])
      return { prev }
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['workouts'], ctx.prev)
      toast.error(msg(e, 'Failed to save workout'))
    },
    onSuccess: () => toast.success('Workout saved'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}

export function useUpdateWorkout(id: string) {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: WorkoutUpdate) => workoutsApi.update(id, input),
    onError: (e) => toast.error(msg(e, 'Failed to update workout')),
    onSuccess: () => toast.success('Workout updated'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['workouts', id] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}
export function useDeleteWorkout() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (id: string) => workoutsApi.remove(id),
    onSuccess: () => toast.success('Workout deleted'),
    onError: (e) => toast.error(msg(e, 'Failed to delete workout')),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['activity'] })
      router.invalidate()
    },
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: GoalInput) => goalsApi.create(input),
    onError: (e) => toast.error(msg(e, 'Failed to save goal')),
    onSuccess: () => toast.success('Goal saved'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      router.invalidate()
    },
  })
}
export function useUpdateGoal(id: string) {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: GoalUpdate) => goalsApi.update(id, input),
    onError: (e) => toast.error(msg(e, 'Failed to update goal')),
    onSuccess: () => toast.success('Goal updated'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      router.invalidate()
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['goals'] })
      const prev = qc.getQueryData<GoalWithProgress[]>(['goals'])
      qc.setQueryData<GoalWithProgress[]>(['goals'], (old = []) =>
        old.filter((g) => g.id !== id),
      )
      return { prev }
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['goals'], ctx.prev)
      toast.error(msg(e, 'Failed to delete goal'))
    },
    onSuccess: () => toast.success('Goal deleted'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      router.invalidate()
    },
  })
}

export function useCreateRoutine() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: RoutineInput) => routinesApi.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['routines'] })
      const prev = qc.getQueryData<RoutineWithItems[]>(['routines'])
      qc.setQueryData<RoutineWithItems[]>(['routines'], (old = []) => [
        optimisticRoutine(input),
        ...old,
      ])
      return { prev }
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['routines'], ctx.prev)
      toast.error(msg(e, 'Failed to save routine'))
    },
    onSuccess: () => toast.success('Routine saved'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      router.invalidate()
    },
  })
}

export function useUpdateRoutine(id: string) {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: RoutineUpdate) => routinesApi.update(id, input),
    onError: (e) => toast.error(msg(e, 'Failed to update routine')),
    onSuccess: () => toast.success('Routine updated'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      qc.invalidateQueries({ queryKey: ['routines', id] })
      router.invalidate()
    },
  })
}
export function useDeleteRoutine() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (id: string) => routinesApi.remove(id),
    onSuccess: () => toast.success('Routine deleted'),
    onError: (e) => toast.error(msg(e, 'Failed to delete routine')),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      router.invalidate()
    },
  })
}
