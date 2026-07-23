import { useRouter } from '@tanstack/react-router';
import { LandPlot } from 'lucide-react';
import { UserAvatar } from './user-avatar';

export function TopBar({
  user,
  handleSignOut,
}: {
  user: { name: string; email: string }
  handleSignOut: () => void
}) {
  const { navigate } = useRouter()
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-2 px-4">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2"
          aria-label="Groove home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LandPlot className="size-4.5" aria-hidden />
          </span>
          <span className="relative top-px text-xl font-bold font-heading tracking-tight leading-tight">
            Groove
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <UserAvatar user={user} handleSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  )
}
