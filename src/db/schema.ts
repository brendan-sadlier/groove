import {
    GOAL_METRICS,
    GOAL_PERIODS,
    INTENSITIES,
    ROUTINE_ITEM_KINDS,
    WORKOUT_CATEGORIES,
} from '@/lib/constants'
import {
    index,
    integer,
    real,
    sqliteTable,
    text,
} from 'drizzle-orm/sqlite-core'

export * from './auth-schema'

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
const createdAt = () =>
  integer('created_at')
    .notNull()
    .$defaultFn(() => Date.now())
const updatedAt = () =>
  integer('updated_at')
    .notNull()
    .$defaultFn(() => Date.now())

export const sessions = sqliteTable(
  'sessions',
  {
    id: id(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    focus: text('focus').notNull(),
    date: text('date').notNull(),
    totalShotsAttempted: integer('total_shots_attempted').notNull().default(0),
    totalShotsMade: integer('total_shots_made'),
    intensity: text('intensity', { enum: INTENSITIES }).notNull(),
    notes: text('notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('sessions_user_date').on(t.userId, t.date)],
)

export const drills = sqliteTable(
  'drills',
  {
    id: id(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    shotsAttempted: integer('shots_attempted').notNull(),
    shotsMade: integer('shots_made'),
    notes: text('notes'),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [index('drills_session').on(t.sessionId)],
)

export const workouts = sqliteTable(
  'workouts',
  {
    id: id(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    category: text('category', { enum: WORKOUT_CATEGORIES }).notNull(),
    date: text('date').notNull(),
    durationMin: integer('duration_min').notNull(),
    notes: text('notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('workouts_user_date').on(t.userId, t.date)],
)

export const exercises = sqliteTable(
  'exercises',
  {
    id: id(),
    workoutId: text('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    sets: integer('sets').notNull(),
    reps: integer('reps'), // reps XOR time_sec — enforced in Zod (Phase 3)
    timeSec: integer('time_sec'),
    weight: real('weight'),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [index('exercises_workout').on(t.workoutId)],
)

export const routines = sqliteTable('routines', {
  id: id(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
})

export const routineItems = sqliteTable(
  'routine_items',
  {
    id: id(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    kind: text('kind', { enum: ROUTINE_ITEM_KINDS }).notNull(),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [index('routine_items_routine').on(t.routineId)],
)

export const goals = sqliteTable('goals', {
  id: id(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  metric: text('metric', { enum: GOAL_METRICS }).notNull(),
  target: integer('target').notNull(),
  period: text('period', { enum: GOAL_PERIODS }).notNull(),
  createdAt: createdAt(),
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Drill = typeof drills.$inferSelect
export type NewDrill = typeof drills.$inferInsert
export type Workout = typeof workouts.$inferSelect
export type NewWorkout = typeof workouts.$inferInsert
export type Exercise = typeof exercises.$inferSelect
export type NewExercise = typeof exercises.$inferInsert
export type Routine = typeof routines.$inferSelect
export type NewRoutine = typeof routines.$inferInsert
export type RoutineItem = typeof routineItems.$inferSelect
export type NewRoutineItem = typeof routineItems.$inferInsert
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
