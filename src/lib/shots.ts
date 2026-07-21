export function computeShotTotals(
  drills: { shotsAttempted: number; shotsMade?: number | null }[],
): { attempted: number; made: number | null } {
  const attempted = drills.reduce((s, d) => s + (d.shotsAttempted || 0), 0)
  const anyMade = drills.some((d) => d.shotsMade != null)
  const made = anyMade
    ? drills.reduce((s, d) => s + (d.shotsMade ?? 0), 0)
    : null
  return { attempted, made }
}
