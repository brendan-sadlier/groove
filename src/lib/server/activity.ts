import { getDb, schema } from '@/db'
import { authMiddleware } from '@/lib/auth-middleware'
import type { ActivityEntry } from '@/lib/types'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

// Derived unified feed (Section 2): union sessions + workouts, newest first.
export const getActivity = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((input: { limit?: number } = {}) => ({ limit: input.limit ?? 50 }))
  .handler(async ({ data, context }): Promise<ActivityEntry[]> => {
    const db = getDb()
    const userId = context.user.id

    const [sessions, workouts] = await Promise.all([
      db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId)),
      db
        .select()
        .from(schema.workouts)
        .where(eq(schema.workouts.userId, userId)),
    ])

    const entries: ActivityEntry[] = [
      ...sessions.map((s): ActivityEntry => ({
        kind: 'practice',
        id: s.id,
        date: s.date,
        createdAt: s.createdAt,
        title: s.title,
        focus: s.focus,
        totalShotsAttempted: s.totalShotsAttempted,
        totalShotsMade: s.totalShotsMade,
      })),
      ...workouts.map((w): ActivityEntry => ({
        kind: 'gym',
        id: w.id,
        date: w.date,
        createdAt: w.createdAt,
        title: w.title,
        category: w.category,
        durationMin: w.durationMin,
      })),
    ]

    entries.sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt,
    )
    return entries.slice(0, data.limit)
  })
