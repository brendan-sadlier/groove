import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, notFound, parseBody, toError } from '@/lib/server/http'
import { goalUpdateSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

async function ownsGoal(userId: string, id: string): Promise<boolean> {
  const db = getDb()
  const [row] = await db
    .select({ id: schema.goals.id })
    .from(schema.goals)
    .where(and(eq(schema.goals.id, id), eq(schema.goals.userId, userId)))
    .limit(1)
  return !!row
}

export const Route = createFileRoute('/api/goals/$id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, goalUpdateSchema)
          if (!(await ownsGoal(user.id, params.id))) return notFound()

          const patch: Partial<typeof schema.goals.$inferInsert> = {}
          if (input.title !== undefined) patch.title = input.title
          if (input.metric !== undefined) patch.metric = input.metric
          if (input.target !== undefined) patch.target = input.target
          if (input.period !== undefined) patch.period = input.period

          if (Object.keys(patch).length > 0) {
            await getDb()
              .update(schema.goals)
              .set(patch)
              .where(eq(schema.goals.id, params.id))
          }
          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          if (!(await ownsGoal(user.id, params.id))) return notFound()

          await getDb()
            .delete(schema.goals)
            .where(eq(schema.goals.id, params.id))
          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
