import { getDb, schema } from '@/db'
import { authMiddleware } from '@/lib/auth-middleware'
import type { WorkoutWithExercises } from '@/lib/types'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'

export const getWorkouts = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<WorkoutWithExercises[]> => {
    const db = getDb()
    const rows = await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.userId, context.user.id))
      .orderBy(desc(schema.workouts.date), desc(schema.workouts.createdAt))
    if (rows.length === 0) return []

    const exercises = await db
      .select()
      .from(schema.exercises)
      .where(
        inArray(
          schema.exercises.workoutId,
          rows.map((r) => r.id),
        ),
      )
      .orderBy(asc(schema.exercises.sortOrder))

    const byWorkout = new Map<string, typeof exercises>()
    for (const e of exercises) {
      const list = byWorkout.get(e.workoutId) ?? []
      list.push(e)
      byWorkout.set(e.workoutId, list)
    }
    return rows.map((w) => ({ ...w, exercises: byWorkout.get(w.id) ?? [] }))
  })

export const getWorkout = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(
    async ({ data: id, context }): Promise<WorkoutWithExercises | null> => {
      const db = getDb()
      const [workout] = await db
        .select()
        .from(schema.workouts)
        .where(
          and(
            eq(schema.workouts.id, id),
            eq(schema.workouts.userId, context.user.id),
          ),
        )
        .limit(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!workout) return null

      const exercises = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.workoutId, id))
        .orderBy(asc(schema.exercises.sortOrder))
      return { ...workout, exercises }
    },
  )
