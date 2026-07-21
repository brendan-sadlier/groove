import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, parseBody, toError } from '@/lib/server/http'
import { routineInputSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/routines')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, routineInputSchema)
          const db = getDb()
          const id = crypto.randomUUID()

          await db.batch([
            db.insert(schema.routines).values({
              id,
              userId: user.id,
              name: input.name,
              description: input.description,
            }),
            ...input.items.map((it, i) =>
              db.insert(schema.routineItems).values({
                routineId: id,
                label: it.label,
                kind: it.kind,
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
