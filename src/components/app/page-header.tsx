import type { ReactNode } from 'react'

export function PageHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/80 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
      <h1 className="text-lg font-semibold">{title}</h1>
      {action}
    </header>
  )
}
