// src/routes/_app/plan/routines/$id.tsx
import { ConfirmDelete } from '@/components/app/confirm-delete'
import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { PageHeader } from '@/components/app/page-header'
import { RoutineForm } from '@/components/app/plan/routine-form'
import { SessionForm } from '@/components/app/practice/session-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LostIllustration } from '@/illustrations/lost'
import {
  useCreateSession,
  useDeleteRoutine,
  useUpdateRoutine,
} from '@/lib/mutations'
import { routineQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Pencil, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/plan/routines/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(routineQuery(params.id)),
  component: RoutineDetail,
})

function RoutineDetail() {
  const { id } = Route.useParams()
  const router = useRouter()
  const { data: routine } = useSuspenseQuery(routineQuery(id))
  const [editing, setEditing] = useState(false)
  const [starting, setStarting] = useState(false)
  const update = useUpdateRoutine(id)
  const del = useDeleteRoutine()
  const createSession = useCreateSession()

  if (!routine) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Not found" showBack />
        <EmptyState
          illustration={<LostIllustration className="size-48" />}
          title="Routines Yet"
          description="Set a weekly or monthly target to stay on track."
          action={
            <Button
              onClick={() =>
                router.navigate({ to: '/plan', search: { tab: 'routines' } })
              }
            >
              Go Back
            </Button>
          }
        />
      </div>
    )
  }

  const practiceItems = routine.items
    .filter((it) => it.kind === 'practice')
    .map((it) => it.label)

  return (
    <>
      <PageHeader
        title={routine.name}
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
              title="Delete routine?"
              onConfirm={() =>
                del.mutate(id, {
                  onSuccess: () =>
                    router.navigate({
                      to: '/plan',
                      search: { tab: 'routines' },
                    }),
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
        {routine.description ? (
          <p className="text-sm text-muted-foreground">{routine.description}</p>
        ) : null}
        <ul className="divide-y rounded-lg border">
          {routine.items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <span>{it.label}</span>
              <Badge variant="secondary" className="capitalize">
                {it.kind}
              </Badge>
            </li>
          ))}
        </ul>
        {practiceItems.length > 0 ? (
          <Button className="w-full" onClick={() => setStarting(true)}>
            <Play className="size-4" /> Start practice session
          </Button>
        ) : null}
      </div>

      <FormDrawer open={editing} onOpenChange={setEditing} title="Edit routine">
        <RoutineForm
          routine={routine}
          submitting={update.isPending}
          onSubmit={(v) =>
            update.mutate(v, { onSuccess: () => setEditing(false) })
          }
        />
      </FormDrawer>

      <FormDrawer
        open={starting}
        onOpenChange={setStarting}
        title="Start session"
        description={`Pre-filled from "${routine.name}"`}
      >
        <SessionForm
          seedDrills={practiceItems}
          submitting={createSession.isPending}
          onSubmit={(v) =>
            createSession.mutate(v, {
              onSuccess: () => {
                setStarting(false)
                router.navigate({ to: '/practice' })
              },
            })
          }
        />
      </FormDrawer>
    </>
  )
}
