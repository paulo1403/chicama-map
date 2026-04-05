import { API_BASE, requestJson } from './http'

export async function health() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    return response.ok
  } catch {
    return false
  }
}

export async function login(username: string, password: string) {
  const response = await requestJson<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  return response.token
}