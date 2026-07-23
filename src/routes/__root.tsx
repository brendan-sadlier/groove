import { RegisterSW } from '@/components/app/register-sw'
import { Toaster } from '@/components/ui/sonner'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import type { QueryClient } from '@tanstack/react-query'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1',
        },
        { title: 'Groove' },
        {
          name: 'description',
          content: 'Structured golf practice, workouts, routines, and goals.',
        },
        { name: 'application-name', content: 'Groove' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Groove' },
        {
          name: 'theme-color',
          content: '#ffffff',
          media: '(prefers-color-scheme: light)',
        },
        {
          name: 'theme-color',
          content: '#0a0a0a',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/logo192.png' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/logo192.png',
          sizes: '192x192',
        },
      ],
    }),
    shellComponent: RootDocument,
  },
)

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <RegisterSW />
        <Toaster position="top-center" />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
