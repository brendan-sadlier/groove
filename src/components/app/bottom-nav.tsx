import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Dumbbell, Home, ListChecks, Plus, Target } from 'lucide-react'

type Tab = {
  to: string
  label: string
  icon: LucideIcon
  exact: boolean
  search?: Record<string, string>
}

const leftTabs: Tab[] = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/practice', label: 'Practice', icon: Target, exact: false },
]

const rightTabs: Tab[] = [
  { to: '/train', label: 'Train', icon: Dumbbell, exact: false },
  {
    to: '/plan',
    label: 'Plan',
    icon: ListChecks,
    exact: false,
    search: { tab: 'routines' },
  },
]

function NavTab({ to, label, icon: Icon, exact, search }: Tab) {
  return (
    <li>
      <Link
        to={to}
        search={search}
        activeOptions={{ exact, includeSearch: false }}
        className="flex h-16 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors data-[status=active]:text-foreground"
      >
        <Icon className="size-5" />
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </li>
  )
}

export function BottomNav({ onCreate }: { onCreate: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-md pb-safe">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {leftTabs.map((t) => (
          <NavTab key={t.to} {...t} />
        ))}
        <li className="flex items-center justify-center">
          <button
            type="button"
            onClick={onCreate}
            aria-label="Create new entry"
            className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </button>
        </li>
        {rightTabs.map((t) => (
          <NavTab key={t.to} {...t} />
        ))}
      </ul>
    </nav>
  )
}
