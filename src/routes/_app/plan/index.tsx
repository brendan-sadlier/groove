import { FormDrawer } from '@/components/app/form-drawer'
import { ListSkeleton } from '@/components/app/list-skeleton'
import { PageHeader } from '@/components/app/page-header'
import { GoalForm } from '@/components/app/plan/goal-form'
import { GoalsPanel } from '@/components/app/plan/goals-panel'
import { RoutineForm } from '@/components/app/plan/routine-form'
import { RoutinesPanel } from '@/components/app/plan/routines-panel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateGoal, useCreateRoutine } from '@/lib/mutations'
import { goalsQuery, routinesQuery } from '@/lib/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

type PlanTab = 'routines' | 'goals'

export const Route = createFileRoute('/_app/plan/')({
  // Tab lives in the URL so refresh / back-forward preserve it.
  validateSearch: (search: Record<string, unknown>): { tab: PlanTab } => ({
    tab: search.tab === 'goals' ? 'goals' : 'routines',
  }),
  // Both are cheap and already cached per-user — load together so switching is instant.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(routinesQuery()),
      context.queryClient.ensureQueryData(goalsQuery()),
    ])
  },
  pendingComponent: () => (
    <>
      <PageHeader title="Plan" />
      <ListSkeleton />
    </>
  ),
  component: PlanPage,
})

function getSubtitle(
  tab: PlanTab,
  routinesCount: number,
  goalsCount: number,
  goalsCompletedCount: number,
) {
  if (tab === 'routines') {
    return `${routinesCount} routine${routinesCount === 1 ? '' : 's'}`
  } else {
    return `${goalsCompletedCount} of ${goalsCount} on track`
  }
}

function PlanPage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [creating, setCreating] = useState(false)

  const createRoutine = useCreateRoutine()
  const createGoal = useCreateGoal()

  const setTab = (next: string) => {
    navigate({ search: { tab: next as PlanTab }, replace: true })
  }

  const { data: routines } = useSuspenseQuery(routinesQuery())
  const { data: goals } = useSuspenseQuery(goalsQuery())

  const routinesCount = routines.length
  const goalsCount = goals.length
  const goalsCompletedCount = goals.filter((g) => g.current >= g.target).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Plan"
        subtitle={getSubtitle(
          tab,
          routinesCount,
          goalsCount,
          goalsCompletedCount,
        )}
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden />
            New
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        <TabsContent value="routines" className="mt-0">
          <RoutinesPanel onCreate={() => setCreating(true)} />
        </TabsContent>
        <TabsContent value="goals" className="mt-0">
          <GoalsPanel onCreate={() => setCreating(true)} />
        </TabsContent>
      </Tabs>
      <FormDrawer
        open={creating}
        onOpenChange={setCreating}
        title={tab === 'goals' ? 'New goal' : 'New routine'}
      >
        {tab === 'goals' ? (
          <GoalForm
            submitting={createGoal.isPending}
            onSubmit={(v) =>
              createGoal.mutate(v, { onSuccess: () => setCreating(false) })
            }
          />
        ) : (
          <RoutineForm
            submitting={createRoutine.isPending}
            onSubmit={(v) =>
              createRoutine.mutate(v, { onSuccess: () => setCreating(false) })
            }
          />
        )}
      </FormDrawer>
    </div>
  )
}
