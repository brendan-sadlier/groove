// src/routes/_app/practice/$sessionId.tsx
import { ConfirmDelete } from '@/components/app/confirm-delete'
import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { PageHeader } from '@/components/app/page-header'
import { SessionForm } from '@/components/app/practice/session-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LostIllustration } from '@/illustrations/lost'
import type { Intensity } from '@/lib/constants'
import { formatDateLong } from '@/lib/date'
import { useDeleteSession, useUpdateSession } from '@/lib/mutations'
import { sessionQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CalendarDays, Flag, Flame, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/practice/$sessionId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(sessionQuery(params.sessionId)),
  component: SessionDetail,
})

const intensityLabel: Record<Intensity, string> = {
  low: 'Low Intensity',
  moderate: 'Moderate',
  high: 'High Intensity',
}

function SessionDetail() {
  const { sessionId } = Route.useParams()
  const router = useRouter()
  const { data: session } = useSuspenseQuery(sessionQuery(sessionId))
  const [editing, setEditing] = useState(false)
  const update = useUpdateSession(sessionId)
  const del = useDeleteSession()

  if (!session) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Session" showBack />
        <EmptyState
          illustration={<LostIllustration className="size-48" />}
          title="Session Not Found"
          description="This session may have been deleted."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader showBack title={session.title} subtitle={session.focus} />
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <CalendarDays className="size-3" aria-hidden />
          {formatDateLong(session.date)}
        </Badge>
        <Badge
          variant={
            session.intensity === 'high'
              ? 'destructive'
              : session.intensity === 'moderate'
                ? 'warning'
                : 'success'
          }
          className="gap-1"
        >
          <Flame className="size-3" aria-hidden />
          {intensityLabel[session.intensity]}
        </Badge>
      </div>

      {session.notes && (
        <Card size="sm">
          <CardContent>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Notes
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty">
              {session.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Drills</h2>
          <span className="text-xs text-muted-foreground text-center align-middle">
            {session.drills.length} ·{' '}
            {session.totalShotsMade != null ? (
              <>
                <Flag className="size-3 inline-block" aria-hidden />
                {`${session.totalShotsMade}/${session.totalShotsAttempted}`}
              </>
            ) : (
              <>
                <Flag className="size-3 inline-block" aria-hidden />
                {session.totalShotsAttempted}
              </>
            )}
          </span>
        </div>
        {session.drills.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No drills recorded for this session.
          </p>
        ) : (
          <Card size="sm">
            <CardContent className="flex flex-col divide-y divide-border">
              {session.drills.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-start content-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{d.name}</p>
                    {d.notes && (
                      <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                        {d.notes}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm tabular-nums">
                      {d.shotsMade != null
                        ? `${d.shotsMade}/${d.shotsAttempted}`
                        : d.shotsAttempted}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 w-full"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
        <ConfirmDelete
          title="Delete session?"
          description="This removes the session and its drills."
          onConfirm={() =>
            del.mutate(sessionId, {
              onSuccess: () => router.navigate({ to: '/practice' }),
            })
          }
          trigger={
            <Button variant="destructive" className="flex-1 w-full">
              <Trash2 className="size-4" />
              Delete
            </Button>
          }
        />
      </div>

      <FormDrawer open={editing} onOpenChange={setEditing} title="Edit session">
        <SessionForm
          session={session}
          submitting={update.isPending}
          onSubmit={(values) =>
            update.mutate(values, { onSuccess: () => setEditing(false) })
          }
        />
      </FormDrawer>
    </div>
  )
}
