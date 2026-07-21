import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/require-user'
import { json, notFound, parseBody, toError } from '@/lib/server/http'
import { routineUpdateSchema } from '@/lib/validation'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'

async function ownsRoutine(userId: string, id: string): Promise<boolean> {
  const db = getDb()
  const [row] = await db
    .select({ id: schema.routines.id })
    .from(schema.routines)
    .where(and(eq(schema.routines.id, id), eq(schema.routines.userId, userId)))
    .limit(1)
  return !!row
}

export const Route = createFileRoute('/api/routines/$id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          const input = await parseBody(request, routineUpdateSchema)
          if (!(await ownsRoutine(user.id, params.id))) return notFound()

          const db = getDb()
          const patch: Partial<typeof schema.routines.$inferInsert> = {}
          if (input.name !== undefined) patch.name = input.name
          if (input.description !== undefined)
            patch.description = input.description

          const statements = []
          if (Object.keys(patch).length > 0) {
            statements.push(
              db
                .update(schema.routines)
                .set(patch)
                .where(eq(schema.routines.id, params.id)),
            )
          }
          if (input.items !== undefined) {
            statements.push(
              db
                .delete(schema.routineItems)
                .where(eq(schema.routineItems.routineId, params.id)),
              ...input.items.map((it, i) =>
                db.insert(schema.routineItems).values({
                  routineId: params.id,
                  label: it.label,
                  kind: it.kind,
                  sortOrder: i,
                }),
              ),
            )
          }
          if (statements.length > 0) {
            await db.batch(
              statements as [
                (typeof statements)[number],
                ...(typeof statements)[number][],
              ],
            )
          }

          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const user = await requireUser(request)
          if (!(await ownsRoutine(user.id, params.id))) return notFound()

          const db = getDb()
          await db.batch([
            db
              .delete(schema.routineItems)
              .where(eq(schema.routineItems.routineId, params.id)),
            db.delete(schema.routines).where(eq(schema.routines.id, params.id)),
          ])
          return json({ id: params.id })
        } catch (err) {
          return toError(err)
        }
      },
    },
  },
})
