import { Link } from '@tanstack/react-router'
import { Dumbbell, Home, ListChecks, Target } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/practice', label: 'Practice', icon: Target, exact: false },
  { to: '/train', label: 'Train', icon: Dumbbell, exact: false },
  { to: '/plan', label: 'Plan', icon: ListChecks, exact: false },
] as const

export function BottomNav() {
  return (
    <nav className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex h-16 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors data-[status=active]:text-foreground"
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
