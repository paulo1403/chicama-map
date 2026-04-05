export const SAVED_POINTS_STORAGE_KEY = 'chicama_saved_points_v1'
export const AUTH_TOKEN_STORAGE_KEY = 'chicama_token_v1'
export const LANGUAGE_STORAGE_KEY = 'chicama_language_v1'

export function readStoredString(key: string) {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

export function writeStoredString(key: string, value: string | null) {
  if (typeof window === 'undefined') return
  if (value === null) {
    window.localStorage.removeItem(key)
    return
  }
  window.localStorage.setItem(key, value)
}

export function readStoredArray(key: string) {
  if (typeof window === 'undefined') return [] as string[]
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function writeStoredArray(key: string, value: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}