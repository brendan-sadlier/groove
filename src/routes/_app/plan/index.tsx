import { PageHeader } from '@/components/app/page-header'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, ListChecks, Target } from 'lucide-react'

export const Route = createFileRoute('/_app/plan/')({ component: PlanPage })

function PlanPage() {
  return (
    <>
      <PageHeader title="Plan" />
      <ul className="divide-y">
        <li>
          <Link
            to="/plan/goals"
            className="flex items-center justify-between px-4 py-4 active:bg-muted"
          >
            <span className="flex items-center gap-3">
              <Target className="size-5" /> Goals
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
        <li>
          <Link
            to="/plan/routines"
            className="flex items-center justify-between px-4 py-4 active:bg-muted"
          >
            <span className="flex items-center gap-3">
              <ListChecks className="size-5" /> Routines
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
      </ul>
    </>
  )
}
