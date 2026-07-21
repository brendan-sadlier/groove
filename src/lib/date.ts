export function startOfWeek(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const diff = (d.getDay() + 6) % 7 // days since Monday
  d.setDate(d.getDate() - diff)
  return d
}

/** 1st of the current month, 00:00:00. */
export function startOfMonth(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  return d
}
