import { EmptyState } from '@/components/app/empty-state'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { Progress } from '@/components/ui/progress'
import { activityQuery, goalsQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, Dumbbell, Target } from 'lucide-react'

export const Route = createFileRoute('/_app/')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(activityQuery(10)),
      context.queryClient.ensureQueryData(goalsQuery()),
    ])
  },
  pendingComponent: () => (
    <>
      <PageHeader title="Home" />
      <ListSkeleton />
    </>
  ),
  component: HomePage,
})

function HomePage() {
  const { data: feed } = useSuspenseQuery(activityQuery(10))
  const { data: goals } = useSuspenseQuery(goalsQuery())

  const practiceCount = feed.filter((e) => e.kind === 'practice').length
  const gymCount = feed.filter((e) => e.kind === 'gym').length

  return (
    <>
      <PageHeader title="Home" />
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="size-4" />
              <span className="text-xs">Recent sessions</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{practiceCount}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="size-4" />
              <span className="text-xs">Recent workouts</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{gymCount}</p>
          </div>
        </div>

        {goals.length > 0 ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Goals</h2>
              <Link
                to="/plan/goals"
                className="text-xs text-muted-foreground underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map((g) => {
                const pct =
                  g.target > 0
                    ? Math.min(100, Math.round((g.current / g.target) * 100))
                    : 0
                return (
                  <div key={g.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{g.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {g.current}/{g.target}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-2" />
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-sm font-medium">Recent activity</h2>
          {feed.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Log your first session or workout to see it here."
            />
          ) : (
            <ul className="divide-y rounded-lg border">
              {feed.map((e) => (
                <li
                  key={`${e.kind}-${e.id}`}
                  className="flex items-center justify-between px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.kind === 'practice'
                        ? `Practice · ${e.focus}`
                        : `Gym · ${e.category} · ${e.durationMin}m`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
