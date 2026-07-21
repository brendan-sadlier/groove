import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, notFound, parseBody, toError } from '@/lib/server/http'
import { workoutUpdateSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

async function ownsWorkout(userId: string, id: string): Promise<boolean> {
  const db = getDb()
  const [row] = await db
    .select({ id: schema.workouts.id })
    .from(schema.workouts)
    .where(and(eq(schema.workouts.id, id), eq(schema.workouts.userId, userId)))
    .limit(1)
  return !!row
}

export const Route = createFileRoute('/api/workouts/$id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, workoutUpdateSchema)
          if (!(await ownsWorkout(user.id, params.id))) return notFound()

          const db = getDb()
          const patch: Partial<typeof schema.workouts.$inferInsert> = {
            updatedAt: Date.now(),
          }
          if (input.title !== undefined) patch.title = input.title
          if (input.category !== undefined) patch.category = input.category
          if (input.date !== undefined) patch.date = input.date
          if (input.durationMin !== undefined)
            patch.durationMin = input.durationMin
          if (input.notes !== undefined) patch.notes = input.notes ?? null

          if (input.exercises !== undefined) {
            await db.batch([
              db
                .update(schema.workouts)
                .set(patch)
                .where(eq(schema.workouts.id, params.id)),
              db
                .delete(schema.exercises)
                .where(eq(schema.exercises.workoutId, params.id)),
              ...input.exercises.map((e, i) =>
                db.insert(schema.exercises).values({
                  workoutId: params.id,
                  name: e.name,
                  sets: e.sets,
                  reps: e.reps ?? null,
                  timeSec: e.timeSec ?? null,
                  weight: e.weight ?? null,
                  sortOrder: i,
                }),
              ),
            ])
          } else {
            await db
              .update(schema.workouts)
              .set(patch)
              .where(eq(schema.workouts.id, params.id))
          }

          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          if (!(await ownsWorkout(user.id, params.id))) return notFound()

          const db = getDb()
          await db.batch([
            db
              .delete(schema.exercises)
              .where(eq(schema.exercises.workoutId, params.id)),
            db.delete(schema.workouts).where(eq(schema.workouts.id, params.id)),
          ])
          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
