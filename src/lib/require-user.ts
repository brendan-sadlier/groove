import { auth } from './auth'

/**
 * Use inside API-route handlers (server.handlers). Throws a 401 Response
 * when there's no session; otherwise returns the authenticated user.
 *
 *   POST: async ({ request }) => {
 *     const user = await requireUser(request)
 *     // ...scope every query by user.id
 *   }
 */
export async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return session.user
}
