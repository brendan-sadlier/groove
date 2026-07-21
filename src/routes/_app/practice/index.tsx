import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { SessionForm } from '@/components/app/practice/session-form'
import { Button } from '@/components/ui/button'
import { useCreateSession } from '@/lib/mutations'
import { sessionsQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Target } from 'lucide-react'
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
    <>
      <PageHeader
        title="Practice"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {sessions.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No sessions yet"
          description="Log your first practice session to start tracking shots."
          action={<Button onClick={() => setOpen(true)}>Log a session</Button>}
        />
      ) : (
        <ul className="divide-y">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                to="/practice/$sessionId"
                params={{ sessionId: s.id }}
                className="flex items-center justify-between px-4 py-3 active:bg-muted"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.focus} · {new Date(s.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {s.totalShotsMade != null
                    ? `${s.totalShotsMade}/${s.totalShotsAttempted}`
                    : s.totalShotsAttempted}
                </span>
              </Link>
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
    </>
  )
}
