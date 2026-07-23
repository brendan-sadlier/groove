import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'

export function PageHeader({
  title,
  subtitle,
  action,
  showBack = false,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  showBack?: boolean
}) {
  const back = () => {
    history.back()
  }
  return (
    <div className="flex items-start justify-between gap-3 pb-1">
      <div
        className={`flex min-w-0 ${subtitle ? 'items-start' : 'items-center'} gap-1.5`}
      >
        {showBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={back}
            aria-label="Go back"
            className={`-ml-1.5 ${subtitle ? 'mt-0.5' : 'mt-0'} shrink-0 text-muted-foreground`}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold font-heading tracking-tight text-balance leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
