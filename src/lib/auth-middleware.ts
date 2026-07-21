import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

/**
 * Attach to any createServerFn that reads/writes private data:
 *   createServerFn().middleware([authMiddleware]).handler(({ context }) => {
 *     context.user.id  // guaranteed present
 *   })
 */
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw new Error('Unauthorized')
    return next({ context: { user: session.user, session: session.session } })
  },
)
