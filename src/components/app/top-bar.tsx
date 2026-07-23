import { useRouter } from '@tanstack/react-router';
import { GrooveIcon } from '../icons/groove-icon';
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
          <GrooveIcon className="size-8" />
          <span className="relative text-xl font-bold font-heading tracking-tight leading-tight">
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
