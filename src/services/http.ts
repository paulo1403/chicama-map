const API_BASE =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE as string | undefined) || 'http://localhost:3000'

type RequestOptions = RequestInit & {
  token?: string
}

export async function requestJson<T>(path: string, init?: RequestOptions): Promise<T> {
  const headers = new Headers(init?.headers)

  if (!(init?.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  if (init?.token) {
    headers.set('authorization', `Bearer ${init.token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error((error as { error?: string }).error || `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

export { API_BASE }