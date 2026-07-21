import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, notFound, parseBody, toError } from '@/lib/server/http'
import { computeShotTotals } from '@/lib/server/sessions'
import { sessionUpdateSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

async function ownsSession(userId: string, id: string): Promise<boolean> {
  const db = getDb()
  const [row] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(and(eq(schema.sessions.id, id), eq(schema.sessions.userId, userId)))
    .limit(1)
  return !!row
}

export const Route = createFileRoute('/api/sessions/$id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, sessionUpdateSchema)
          if (!(await ownsSession(user.id, params.id))) return notFound()

          const db = getDb()
          const patch: Partial<typeof schema.sessions.$inferInsert> = {
            updatedAt: Date.now(),
          }
          if (input.title !== undefined) patch.title = input.title
          if (input.focus !== undefined) patch.focus = input.focus
          if (input.date !== undefined) patch.date = input.date
          if (input.intensity !== undefined) patch.intensity = input.intensity
          if (input.notes !== undefined) patch.notes = input.notes ?? null

          if (input.drills !== undefined) {
            const totals = computeShotTotals(input.drills)
            patch.totalShotsAttempted = totals.attempted
            patch.totalShotsMade = totals.made
            // Replace children atomically.
            await db.batch([
              db
                .update(schema.sessions)
                .set(patch)
                .where(eq(schema.sessions.id, params.id)),
              db
                .delete(schema.drills)
                .where(eq(schema.drills.sessionId, params.id)),
              ...input.drills.map((d, i) =>
                db.insert(schema.drills).values({
                  sessionId: params.id,
                  name: d.name,
                  shotsAttempted: d.shotsAttempted,
                  shotsMade: d.shotsMade ?? null,
                  notes: d.notes ?? null,
                  sortOrder: i,
                }),
              ),
            ])
          } else {
            await db
              .update(schema.sessions)
              .set(patch)
              .where(eq(schema.sessions.id, params.id))
          }

          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          if (!(await ownsSession(user.id, params.id))) return notFound()

          const db = getDb()
          await db.batch([
            db
              .delete(schema.drills)
              .where(eq(schema.drills.sessionId, params.id)),
            db.delete(schema.sessions).where(eq(schema.sessions.id, params.id)),
          ])
          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
