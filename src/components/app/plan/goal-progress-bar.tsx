import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function GoalProgressBar({
  current,
  target,
  unit,
  complete,
}: {
  current: number
  target: number
  unit?: string
  complete?: boolean
}) {
  const value =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const done = complete ?? value >= 100

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs tabular-nums">
          {current}
          <span className="text-muted-foreground">/{target}</span>
          {unit ? (
            <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
          ) : null}
        </span>
        <span
          className={cn(
            'text-xs tabular-nums',
            done ? 'text-success' : 'text-muted-foreground',
          )}
        >
          {value}%
        </span>
      </div>
      <Progress value={value} />
    </div>
  )
}
