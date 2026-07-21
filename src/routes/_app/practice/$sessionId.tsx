// src/routes/_app/practice/$sessionId.tsx
import { ConfirmDelete } from '@/components/app/confirm-delete'
import { FormDrawer } from '@/components/app/form-drawer'
import { PageHeader } from '@/components/app/page-header'
import { SessionForm } from '@/components/app/practice/session-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeleteSession, useUpdateSession } from '@/lib/mutations'
import { sessionQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/practice/$sessionId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(sessionQuery(params.sessionId)),
  component: SessionDetail,
})

function SessionDetail() {
  const { sessionId } = Route.useParams()
  const router = useRouter()
  const { data: session } = useSuspenseQuery(sessionQuery(sessionId))
  const [editing, setEditing] = useState(false)
  const update = useUpdateSession(sessionId)
  const del = useDeleteSession()

  if (!session) {
    return (
      <>
        <PageHeader title="Not found" />
        <p className="p-6 text-sm text-muted-foreground">
          This session doesn't exist.
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={session.title}
        action={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
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
                <Button variant="ghost" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              }
            />
          </div>
        }
      />
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="capitalize">
            {session.intensity}
          </Badge>
          <span>{session.focus}</span>
          <span>·</span>
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Shots</p>
          <p className="text-2xl font-semibold">
            {session.totalShotsMade != null
              ? `${session.totalShotsMade} / ${session.totalShotsAttempted}`
              : session.totalShotsAttempted}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Drills</p>
          {session.drills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drills recorded.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {session.drills.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <span>{d.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {d.shotsMade != null
                      ? `${d.shotsMade}/${d.shotsAttempted}`
                      : d.shotsAttempted}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {session.notes ? (
          <div className="rounded-lg border p-4 text-sm">
            <p className="mb-1 font-medium">Notes</p>
            <p className="text-muted-foreground">{session.notes}</p>
          </div>
        ) : null}
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
    </>
  )
}
