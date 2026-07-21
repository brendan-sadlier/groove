export const INTENSITIES = ['low', 'moderate', 'high'] as const
export type Intensity = (typeof INTENSITIES)[number]

export const WORKOUT_CATEGORIES = [
  'mobility',
  'strength',
  'power',
  'speed',
  'stability',
  'recovery',
] as const
export type WorkoutCategory = (typeof WORKOUT_CATEGORIES)[number]

export const GOAL_METRICS = ['sessions', 'workouts', 'minutes'] as const
export type GoalMetric = (typeof GOAL_METRICS)[number]

export const GOAL_PERIODS = ['weekly', 'monthly'] as const
export type GoalPeriod = (typeof GOAL_PERIODS)[number]

export const ROUTINE_ITEM_KINDS = ['practice', 'gym'] as const
export type RoutineItemKind = (typeof ROUTINE_ITEM_KINDS)[number]
