import { EmptyState } from '@/components/app/empty-state'
import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { RoutineForm } from '@/components/app/plan/routine-form'
import { Button } from '@/components/ui/button'
import { useCreateRoutine } from '@/lib/mutations'
import { routinesQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, ListChecks, Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/plan/routines/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(routinesQuery()),
  pendingComponent: () => (
    <>
      <PageHeader title="Routines" />
      <ListSkeleton />
    </>
  ),
  component: RoutinesPage,
})

function RoutinesPage() {
  const { data: routines } = useSuspenseQuery(routinesQuery())
  const [open, setOpen] = useState(false)
  const create = useCreateRoutine()

  return (
    <>
      <PageHeader
        title="Routines"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {routines.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No routines yet"
          description="Create a reusable warmup or practice routine."
          action={<Button onClick={() => setOpen(true)}>Add a routine</Button>}
        />
      ) : (
        <ul className="divide-y">
          {routines.map((r) => (
            <li key={r.id}>
              <Link
                to="/plan/routines/$id"
                params={{ id: r.id }}
                className="flex items-center justify-between px-4 py-3 active:bg-muted"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.items.length} item{r.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <FormDrawer open={open} onOpenChange={setOpen} title="New routine">
        <RoutineForm
          submitting={create.isPending}
          onSubmit={(v) =>
            create.mutate(v, { onSuccess: () => setOpen(false) })
          }
        />
      </FormDrawer>
    </>
  )
}
