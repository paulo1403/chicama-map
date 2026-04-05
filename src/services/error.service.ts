function getDefaultFallback() {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) {
    return 'An unexpected error occurred'
  }

  return 'Ha ocurrido un error inesperado'
}

export function getErrorMessage(error: unknown, fallback = getDefaultFallback()) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}
