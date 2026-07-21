import { getDb, schema } from '@/db'
import type { Goal } from '@/db/schema'
import { authMiddleware } from '@/lib/auth-middleware'
import { startOfMonth, startOfWeek } from '@/lib/date'
import type { GoalWithProgress } from '@/lib/types'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'

function inWindow(dateStr: string, startMs: number): boolean {
  const t = Date.parse(dateStr)
  return !Number.isNaN(t) && t >= startMs
}

/** Derived Goal.current — never stored (Section 2). */
export function computeGoalCurrent(
  goal: Pick<Goal, 'metric' | 'period'>,
  sessions: { date: string }[],
  workouts: { date: string; durationMin: number }[],
): number {
  const start = (
    goal.period === 'weekly' ? startOfWeek() : startOfMonth()
  ).getTime()
  switch (goal.metric) {
    case 'sessions':
      return sessions.filter((s) => inWindow(s.date, start)).length
    case 'workouts':
      return workouts.filter((w) => inWindow(w.date, start)).length
    case 'minutes':
      return workouts
        .filter((w) => inWindow(w.date, start))
        .reduce((sum, w) => sum + w.durationMin, 0)
    default:
      return 0
  }
}

export const getGoals = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<GoalWithProgress[]> => {
    const db = getDb()
    const userId = context.user.id

    // Fetch once, compute every goal's window in JS — avoids SQL string-date
    // comparison pitfalls and keeps to one round trip per table.
    const [goals, sessionDates, workoutRows] = await Promise.all([
      db
        .select()
        .from(schema.goals)
        .where(eq(schema.goals.userId, userId))
        .orderBy(desc(schema.goals.createdAt)),
      db
        .select({ date: schema.sessions.date })
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId)),
      db
        .select({
          date: schema.workouts.date,
          durationMin: schema.workouts.durationMin,
        })
        .from(schema.workouts)
        .where(eq(schema.workouts.userId, userId)),
    ])

    return goals.map((goal) => ({
      ...goal,
      current: computeGoalCurrent(goal, sessionDates, workoutRows),
    }))
  })
