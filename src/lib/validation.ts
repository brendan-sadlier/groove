import { z } from 'zod'
import {
    GOAL_METRICS,
    GOAL_PERIODS,
    INTENSITIES,
    ROUTINE_ITEM_KINDS,
    WORKOUT_CATEGORIES,
} from './constants'

export const intensitySchema = z.enum(INTENSITIES)
export const workoutCategorySchema = z.enum(WORKOUT_CATEGORIES)
export const goalMetricSchema = z.enum(GOAL_METRICS)
export const goalPeriodSchema = z.enum(GOAL_PERIODS)
export const routineItemKindSchema = z.enum(ROUTINE_ITEM_KINDS)

// Small shared primitives                                            */

const nonEmpty = z.string().trim().min(1)
const optionalNote = z.string().trim().max(2000).optional()
// Accepts "2026-07-21" or a full ISO datetime. Tighten to z.iso.datetime()
// or z.iso.date() once you standardise the date format app-wide.
const dateString = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' })

// Practice: sessions + drills

export const drillInputSchema = z
  .object({
    name: nonEmpty,
    shotsAttempted: z.number().int().positive(),
    shotsMade: z.number().int().nonnegative().optional(),
    notes: optionalNote,
  })
  .refine((d) => d.shotsMade == null || d.shotsMade <= d.shotsAttempted, {
    message: 'Shots made cannot exceed shots attempted',
    path: ['shotsMade'],
  })

export const sessionInputSchema = z.object({
  title: nonEmpty,
  focus: nonEmpty,
  date: dateString,
  intensity: intensitySchema,
  notes: optionalNote,
  // total_shots_* are recomputed from drills on the server (Section 2 decision),
  // so they are intentionally NOT accepted from the client.
  drills: z.array(drillInputSchema).default([]),
})

export const sessionUpdateSchema = sessionInputSchema.partial()

// Train: workouts + exercises

export const exerciseInputSchema = z
  .object({
    name: nonEmpty,
    sets: z.number().int().positive(),
    reps: z.number().int().positive().optional(),
    timeSec: z.number().int().positive().optional(),
    weight: z.number().nonnegative().optional(),
  })
  .refine((e) => !!e.reps !== !!e.timeSec, {
    message: 'Provide either reps or timeSec, not both',
    path: ['reps'],
  })

export const workoutInputSchema = z.object({
  title: nonEmpty,
  category: workoutCategorySchema,
  date: dateString,
  durationMin: z.number().int().positive(),
  notes: optionalNote,
  exercises: z.array(exerciseInputSchema).default([]),
})

export const workoutUpdateSchema = workoutInputSchema.partial()

// Plan: routines + items
export const routineItemInputSchema = z.object({
  label: nonEmpty,
  kind: routineItemKindSchema,
})

export const routineInputSchema = z.object({
  name: nonEmpty,
  description: z.string().trim().default(''),
  items: z.array(routineItemInputSchema).default([]),
})

export const routineUpdateSchema = routineInputSchema.partial()

// Goals

export const goalInputSchema = z.object({
  title: nonEmpty,
  metric: goalMetricSchema,
  target: z.number().int().positive(),
  period: goalPeriodSchema,
})

export const goalUpdateSchema = goalInputSchema.partial()

// Inferred types — import these in the DB layer and forms

export type DrillInput = z.infer<typeof drillInputSchema>
export type SessionInput = z.infer<typeof sessionInputSchema>
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>

export type ExerciseInput = z.infer<typeof exerciseInputSchema>
export type WorkoutInput = z.infer<typeof workoutInputSchema>
export type WorkoutUpdate = z.infer<typeof workoutUpdateSchema>

export type RoutineItemInput = z.infer<typeof routineItemInputSchema>
export type RoutineInput = z.infer<typeof routineInputSchema>
export type RoutineUpdate = z.infer<typeof routineUpdateSchema>

export type GoalInput = z.infer<typeof goalInputSchema>
export type GoalUpdate = z.infer<typeof goalUpdateSchema>
