import { getDb, schema } from '@/db'
import { authMiddleware } from '@/lib/auth-middleware'
import type { RoutineWithItems } from '@/lib/types'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, inArray } from 'drizzle-orm'

export const getRoutines = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<RoutineWithItems[]> => {
    const db = getDb()
    const rows = await db
      .select()
      .from(schema.routines)
      .where(eq(schema.routines.userId, context.user.id))
      .orderBy(asc(schema.routines.name))
    if (rows.length === 0) return []

    const items = await db
      .select()
      .from(schema.routineItems)
      .where(
        inArray(
          schema.routineItems.routineId,
          rows.map((r) => r.id),
        ),
      )
      .orderBy(asc(schema.routineItems.sortOrder))

    const byRoutine = new Map<string, typeof items>()
    for (const it of items) {
      const list = byRoutine.get(it.routineId) ?? []
      list.push(it)
      byRoutine.set(it.routineId, list)
    }
    return rows.map((r) => ({ ...r, items: byRoutine.get(r.id) ?? [] }))
  })

export const getRoutine = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }): Promise<RoutineWithItems | null> => {
    const db = getDb()
    const [routine] = await db
      .select()
      .from(schema.routines)
      .where(
        and(
          eq(schema.routines.id, id),
          eq(schema.routines.userId, context.user.id),
        ),
      )
      .limit(1)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!routine) return null

    const items = await db
      .select()
      .from(schema.routineItems)
      .where(eq(schema.routineItems.routineId, id))
      .orderBy(asc(schema.routineItems.sortOrder))
    return { ...routine, items }
  })
