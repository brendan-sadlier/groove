import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  illustration?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia>
            {illustration ? (
              illustration
            ) : Icon ? (
              <Icon className="size-8 text-muted-foreground" />
            ) : null}
          </EmptyMedia>
          <EmptyTitle className="font-heading font-semibold text-2xl">
            {title}
          </EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent>
          {/* <Button>Connect Data Source</Button> */}
          {action}
        </EmptyContent>
      </Empty>
    </div>
  )
}
