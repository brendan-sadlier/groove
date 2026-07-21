import { getDb, schema } from '@/db'
import { authMiddleware } from '@/lib/auth-middleware'
import type { SessionWithDrills } from '@/lib/types'
import type { DrillInput } from '@/lib/validation'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'

export function computeShotTotals(
  drills: Pick<DrillInput, 'shotsAttempted' | 'shotsMade'>[],
): { attempted: number; made: number | null } {
  const attempted = drills.reduce((s, d) => s + d.shotsAttempted, 0)
  const anyMade = drills.some((d) => d.shotsMade != null)
  const made = anyMade
    ? drills.reduce((s, d) => s + (d.shotsMade ?? 0), 0)
    : null
  return { attempted, made }
}

export const getSessions = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SessionWithDrills[]> => {
    const db = getDb()
    const rows = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, context.user.id))
      .orderBy(desc(schema.sessions.date), desc(schema.sessions.createdAt))
    if (rows.length === 0) return []

    const drills = await db
      .select()
      .from(schema.drills)
      .where(
        inArray(
          schema.drills.sessionId,
          rows.map((r) => r.id),
        ),
      )
      .orderBy(asc(schema.drills.sortOrder))

    const bySession = new Map<string, typeof drills>()
    for (const d of drills) {
      const list = bySession.get(d.sessionId) ?? []
      list.push(d)
      bySession.set(d.sessionId, list)
    }
    return rows.map((s) => ({ ...s, drills: bySession.get(s.id) ?? [] }))
  })

export const getSession = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }): Promise<SessionWithDrills | null> => {
    const db = getDb()
    const [session] = await db
      .select()
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.id, id),
          eq(schema.sessions.userId, context.user.id),
        ),
      )
      .limit(1)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!session) return null

    const drills = await db
      .select()
      .from(schema.drills)
      .where(eq(schema.drills.sessionId, id))
      .orderBy(asc(schema.drills.sortOrder))
    return { ...session, drills }
  })
