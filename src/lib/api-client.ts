import type {
    GoalInput,
    GoalUpdate,
    RoutineInput,
    RoutineUpdate,
    SessionInput,
    SessionUpdate,
    WorkoutInput,
    WorkoutUpdate,
} from '@/lib/validation'

type IdResult = { id: string }

async function request<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as {
        error?: string
        issues?: { message?: string }[]
      }
      if (data?.issues?.length) message = data.issues[0].message ?? message
      else if (data?.error) message = data.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const sessionsApi = {
  create: (d: SessionInput) => request<IdResult>('/api/sessions', 'POST', d),
  update: (id: string, d: SessionUpdate) =>
    request<IdResult>(`/api/sessions/${id}`, 'PATCH', d),
  remove: (id: string) => request<IdResult>(`/api/sessions/${id}`, 'DELETE'),
}
export const workoutsApi = {
  create: (d: WorkoutInput) => request<IdResult>('/api/workouts', 'POST', d),
  update: (id: string, d: WorkoutUpdate) =>
    request<IdResult>(`/api/workouts/${id}`, 'PATCH', d),
  remove: (id: string) => request<IdResult>(`/api/workouts/${id}`, 'DELETE'),
}
export const goalsApi = {
  create: (d: GoalInput) => request<IdResult>('/api/goals', 'POST', d),
  update: (id: string, d: GoalUpdate) =>
    request<IdResult>(`/api/goals/${id}`, 'PATCH', d),
  remove: (id: string) => request<IdResult>(`/api/goals/${id}`, 'DELETE'),
}
export const routinesApi = {
  create: (d: RoutineInput) => request<IdResult>('/api/routines', 'POST', d),
  update: (id: string, d: RoutineUpdate) =>
    request<IdResult>(`/api/routines/${id}`, 'PATCH', d),
  remove: (id: string) => request<IdResult>(`/api/routines/${id}`, 'DELETE'),
}
