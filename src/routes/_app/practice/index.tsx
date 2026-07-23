import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { SessionForm } from '@/components/app/practice/session-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Session } from '@/db/schema'
import { GolferIllustration } from '@/illustrations/golfer'
import { relativeDay } from '@/lib/date'
import { useCreateSession } from '@/lib/mutations'
import { sessionsQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Flag, Flame, Plus, Target } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/practice/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery()),
  pendingComponent: () => (
    <>
      <PageHeader title="Practice" />
      <ListSkeleton />
    </>
  ),
  component: PracticePage,
})

function PracticePage() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery())
  const [open, setOpen] = useState(false)
  const create = useCreateSession()
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Practice"
        subtitle={`${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {sessions.length === 0 ? (
        <EmptyState
          illustration={<GolferIllustration className="h-42 w-42" />}
          title="No Sessions Yet"
          description="Log your first practice session to start tracking shots."
          action={
            <Button size="lg" onClick={() => setOpen(true)}>
              Log a Session
            </Button>
          }
        />
      ) : (
        <ul className="divide-y">
          {sessions.map((s) => (
            <li key={s.id}>
              <SessionCard session={s} />
            </li>
          ))}
        </ul>
      )}
      <FormDrawer open={open} onOpenChange={setOpen} title="New session">
        <SessionForm
          submitting={create.isPending}
          onSubmit={(values) =>
            create.mutate(values, { onSuccess: () => setOpen(false) })
          }
        />
      </FormDrawer>
    </div>
  )
}

function SessionCard({ session }: { session: Session }) {
  return (
    <Link
      to="/practice/$sessionId"
      params={{ sessionId: session.id }}
      className="w-full text-left transition-transform active:scale-[0.99]"
    >
      <Card size="sm" className="ring-foreground/10 hover:ring-foreground/20">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Target className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{session.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.focus} · {relativeDay(session.date)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Flag className="size-3" />
              {session.totalShotsMade != null
                ? `${session.totalShotsMade}/${session.totalShotsAttempted}`
                : session.totalShotsAttempted}
            </Badge>
            <Badge
              variant={
                session.intensity === 'high'
                  ? 'destructive'
                  : session.intensity === 'moderate'
                    ? 'warning'
                    : 'success'
              }
              className="ml-auto text-[10px] font-medium tracking-wide uppercase"
            >
              <Flame />
              {session.intensity}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
