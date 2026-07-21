import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, parseBody, toError } from '@/lib/server/http'
import { computeShotTotals } from '@/lib/server/sessions'
import { sessionInputSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/sessions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, sessionInputSchema)
          const db = getDb()
          const id = crypto.randomUUID()
          const now = Date.now()
          const totals = computeShotTotals(input.drills)

          await db.batch([
            db.insert(schema.sessions).values({
              id,
              userId: user.id,
              title: input.title,
              focus: input.focus,
              date: input.date,
              intensity: input.intensity,
              notes: input.notes ?? null,
              totalShotsAttempted: totals.attempted,
              totalShotsMade: totals.made,
              createdAt: now,
              updatedAt: now,
            }),
            ...input.drills.map((d, i) =>
              db.insert(schema.drills).values({
                sessionId: id,
                name: d.name,
                shotsAttempted: d.shotsAttempted,
                shotsMade: d.shotsMade ?? null,
                notes: d.notes ?? null,
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
