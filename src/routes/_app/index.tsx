import { ActivityRow } from '@/components/app/activity-row'
import { EmptyState } from '@/components/app/empty-state'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { GoalProgressBar } from '@/components/app/plan/goal-progress-bar'
import { ActivityIllustration } from '@/components/illustrations/activity'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { activityQuery, goalsQuery } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  ListChecks,
  Target,
} from 'lucide-react'

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

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function HomePage() {
  const { data: feed } = useSuspenseQuery(activityQuery(10))
  const { data: goals } = useSuspenseQuery(goalsQuery())
  const { user } = Route.useRouteContext()

  const recent = feed.slice(0, 4)

  const navigate = useNavigate()

  const practiceCount = feed.filter((e) => e.kind === 'practice').length
  const gymCount = feed.filter((e) => e.kind === 'gym').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle="Ready to train today?"
      />
      <section aria-labelledby="week-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="week-heading" className="text-sm font-medium font-heading">
            This week
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Practice"
            value={String(practiceCount)}
            icon={Target}
            accent="primary"
          />
          <StatCard
            label="Workouts"
            value={String(gymCount)}
            icon={Dumbbell}
            accent="chart-2"
          />
        </div>
      </section>
      {/* Quick start */}
      <section aria-labelledby="quick-heading" className="flex flex-col gap-3">
        <h2 id="quick-heading" className="text-sm font-medium font-heading">
          Log activity
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-auto flex-col items-start gap-2 rounded-xl p-4"
            onClick={() => navigate({ to: '/practice' })}
          >
            <Target className="size-5" aria-hidden />
            <span className="flex flex-col items-start">
              <span className="text-sm font-medium">Log Practice</span>
              <span className="text-xs font-normal opacity-80">
                Record a session
              </span>
            </span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto flex-col items-start gap-2 rounded-xl p-4 text-primary dark:text-secondary-foreground"
            onClick={() => navigate({ to: '/train' })}
          >
            <Dumbbell className="size-5" aria-hidden />
            <span className="flex flex-col items-start">
              <span className="text-sm font-medium">Log Workout</span>
              <span className="text-xs font-normal text-primary/80 dark:text-muted-foreground">
                Record your sets & reps
              </span>
            </span>
          </Button>
        </div>
        <Button
          variant="outline"
          className="h-11 justify-between rounded-xl px-4"
          onClick={() => navigate({ to: '/plan', search: { tab: 'routines' } })}
        >
          <span className="flex items-center gap-2">
            <ListChecks className="size-4 text-muted-foreground" aria-hidden />
            Start with a routine
          </span>
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
        </Button>
      </section>

      {goals.length > 0 && (
        <section
          aria-labelledby="goals-heading"
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <h2 id="goals-heading" className="text-sm font-medium font-heading">
              Goals
            </h2>
            <Button
              onClick={() => navigate({ to: '/plan/goals' })}
              variant="link"
              className="text-xs font-medium text-primary"
            >
              See all
            </Button>
          </div>
          <Card size="sm">
            <CardContent className="flex flex-col gap-4">
              {goals.slice(0, 3).map((g) => {
                return (
                  <div key={g.id} className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="size-3.5 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="text-sm font-medium">{g.title}</span>
                      <span className="ml-auto text-[10px] tracking-wide text-muted-foreground uppercase">
                        {g.period}
                      </span>
                    </div>
                    <GoalProgressBar current={g.current} target={g.target} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>
      )}

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-sm font-medium font-heading">
            Recent activity
          </h2>
          {/* <Button
            variant="link"
            type="button"
            // onClick={() => ('history')} // TODO: add history page
            className="text-xs font-medium text-primary"
          >
            See all
          </Button> */}
        </div>
        <div className="flex flex-col gap-2">
          {feed.length === 0 ? (
            <EmptyState
              illustration={<ActivityIllustration className="size-24" />}
              title="No Activity Yet"
              description="Log your first practice or workout to get started."
            />
          ) : (
            <>
              {recent.map((entry) => (
                <ActivityRow
                  key={entry.id}
                  entry={entry}
                  onClick={() =>
                    navigate({
                      to:
                        entry.kind === 'practice'
                          ? '/practice/$sessionId'
                          : '/train/$workoutId',
                      params:
                        entry.kind === 'practice'
                          ? { sessionId: entry.id }
                          : { workoutId: entry.id },
                    })
                  }
                />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Target
  accent?: 'primary' | 'chart-2' | 'chart-3'
}) {
  const accentClass =
    accent === 'primary'
      ? 'bg-primary/12 text-primary'
      : accent === 'chart-2'
        ? 'bg-chart-2/15 text-chart-2'
        : 'bg-chart-3/15 text-chart-3'

  return (
    <Card size="sm" className="justify-between">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              accentClass,
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
