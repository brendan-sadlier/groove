import { signIn } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect, error } = Route.useSearch()
  const [pending, setPending] = useState<'github' | 'google' | null>(null)

  const handleSocial = async (provider: 'github' | 'google') => {
    setPending(provider)
    await signIn.social({
      provider,
      callbackURL: redirect ?? '/',
      errorCallbackURL: '/login',
    })
    // On success the browser redirects away; if we're still here, re-enable.
    setPending(null)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Groove</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600">
            Sign-in failed. Please try again.
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleSocial('github')}
            disabled={pending !== null}
            className="w-full rounded-md border py-2.5 text-base font-medium disabled:opacity-50"
          >
            {pending === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
          </button>

          <button
            onClick={() => handleSocial('google')}
            disabled={pending !== null}
            className="w-full rounded-md border py-2.5 text-base font-medium disabled:opacity-50"
          >
            {pending === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
