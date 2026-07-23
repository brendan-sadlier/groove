import { EmptyState } from '@/components/app/empty-state'
import { RoutineIllustration } from '@/components/illustrations/routine'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useDeleteRoutine } from '@/lib/mutations'
import { routinesQuery } from '@/lib/queries'
import type { RoutineWithItems } from '@/lib/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Dumbbell, Target } from 'lucide-react'

export function RoutinesPanel({ onCreate }: { onCreate: () => void }) {
  const { data: routines } = useSuspenseQuery(routinesQuery())

  if (routines.length === 0) {
    return (
      <EmptyState
        illustration={<RoutineIllustration className="size-48" />}
        title="No Routines Yet"
        description="Create a reusable routine to stay on track."
        action={<Button onClick={onCreate}>Create a Routine</Button>}
      />
    )
  }

  return (
    <ul className="divide-y">
      {routines.map((r) => (
        <li key={r.id}>
          <Link to="/plan/routines/$id" params={{ id: r.id }}>
            <RoutineCard routine={r} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function RoutineCard({ routine }: { routine: RoutineWithItems }) {
  const del = useDeleteRoutine()
  return (
    <Card size="sm" className="ring-foreground/10">
      <CardContent className="flex flex-col gap-3">
        <div className="flex align-items items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{routine.name}</p>
            </div>
            {routine.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {routine.description}
              </p>
            )}
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <Separator />
        <div className="flex flex-col gap-1.5">
          {routine.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              {item.kind === 'practice' ? (
                <Target className="size-3.5 text-primary" aria-hidden />
              ) : (
                <Dumbbell className="size-3.5 text-chart-2" aria-hidden />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
