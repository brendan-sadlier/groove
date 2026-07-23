import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer'

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  onBack,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-2">
            {onBack ? (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 size-8"
                onClick={onBack}
                aria-label="Back"
              >
                <ChevronLeft className="size-4" />
              </Button>
            ) : null}
            <DrawerTitle>{title}</DrawerTitle>
          </div>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
