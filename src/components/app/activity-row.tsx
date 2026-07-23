import { formatDuration, relativeDay } from '@/lib/date'
import type { ActivityEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronRight, Clock, Dumbbell, Target } from 'lucide-react'

export function ActivityRow({
  entry,
  onClick,
}: {
  entry: ActivityEntry
  onClick?: () => void
  compact?: boolean
}) {
  const isPractice = entry.kind === 'practice'
  const Icon = isPractice ? Target : Dumbbell

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl bg-card px-3 py-2.5 text-left ring-1 ring-foreground/10 transition-colors hover:bg-accent/40"
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          isPractice
            ? 'bg-primary/12 text-primary'
            : 'bg-chart-2/15 text-chart-2',
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{entry.title}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {isPractice ? entry.focus : entry.category}
          </span>
          <span aria-hidden>•</span>
          <span className="shrink-0">{relativeDay(entry.date)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        <span className="font-mono tabular-nums">
          {isPractice
            ? `${entry.totalShotsMade}/${entry.totalShotsAttempted}`
            : `${formatDuration(entry.durationMin)}`}
        </span>
        <ChevronRight
          className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </button>
  )
}
