import type { z } from 'zod'

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
}

export function notFound(): Response {
  return json({ error: 'Not found' }, { status: 404 })
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    )
  }
  return result.data
}

export function toError(err: unknown): Response {
  if (err instanceof Response) return err
  console.error(err)
  return json({ error: 'Internal server error' }, { status: 500 })
}
