import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, parseBody, toError } from '@/lib/server/http'
import { workoutInputSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/workouts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, workoutInputSchema)
          const db = getDb()
          const id = crypto.randomUUID()
          const now = Date.now()

          await db.batch([
            db.insert(schema.workouts).values({
              id,
              userId: user.id,
              title: input.title,
              category: input.category,
              date: input.date,
              durationMin: input.durationMin,
              notes: input.notes ?? null,
              createdAt: now,
              updatedAt: now,
            }),
            ...input.exercises.map((e, i) =>
              db.insert(schema.exercises).values({
                workoutId: id,
                name: e.name,
                sets: e.sets,
                reps: e.reps ?? null,
                timeSec: e.timeSec ?? null,
                weight: e.weight ?? null,
                sortOrder: i,
              }),
            ),
          ])

          return json({ id }, { status: 201 })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
