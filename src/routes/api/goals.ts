import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, parseBody, toError } from '@/lib/server/http'
import { goalInputSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/goals')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, goalInputSchema)
          const db = getDb()
          const id = crypto.randomUUID()

          await db.insert(schema.goals).values({
            id,
            userId: user.id,
            title: input.title,
            metric: input.metric,
            target: input.target,
            period: input.period,
            createdAt: Date.now(),
          })

          return json({ id }, { status: 201 })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
