import { GitHubIcon } from '@/components/icons/github-icon'
import { GoogleIcon } from '@/components/icons/google-icon'
import { GrooveIcon } from '@/components/icons/groove-icon'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              to="/"
              className="flex flex-col items-center space-y-2 font-medium"
            >
              <GrooveIcon className="size-12" />
              <span className="sr-only">Groove</span>
            </Link>
            <h1 className="text-xl font-semibold font-heading">
              Welcome to Groove
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <p className="text-center text-sm text-red-600">
              Sign-in failed. Please try again.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSocial('github')}
              disabled={pending !== null}
            >
              {pending === 'github' ? (
                <Loader className="size-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <GitHubIcon className="size-5" />
                  Continue with GitHub
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSocial('google')}
              disabled={pending !== null}
              className=""
            >
              {pending === 'google' ? (
                <Loader className="size-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <GoogleIcon className="size-5" />
                  Continue with Google
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
