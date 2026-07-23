import { BottomNav } from '@/components/app/bottom-nav'
import { CreateMenu } from '@/components/app/create-menu'
import { TopBar } from '@/components/app/top-bar'
import { signOut } from '@/lib/auth-client'
import { getSession } from '@/lib/auth-functions'
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'

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
    router.navigate({
      to: '/login',
    })
  }

  const [creating, setCreating] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <TopBar user={user} handleSignOut={handleSignOut} />
      <main className="flex-1 px-4 pt-4 pb-28">
        <Outlet />
      </main>
      <BottomNav onCreate={() => setCreating(true)} />
      <CreateMenu open={creating} onOpenChange={setCreating} />
    </div>
  )
}
