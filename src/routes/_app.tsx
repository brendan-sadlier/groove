import { BottomNav } from '@/components/app/bottom-nav'
import { signOut } from '@/lib/auth-client'
import { getSession } from '@/lib/auth-functions'
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: session.user }
  },
  component: AppLayout,
})

function AppLayout() {
  const { user } = Route.useRouteContext()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm text-muted-foreground">
          Signed in as {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium underline"
        >
          Sign out
        </button>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
