import { useState } from 'react'

import { AUTH_TOKEN_STORAGE_KEY, readStoredString, writeStoredString } from '../utils/storage'

export function useAdminSession() {
  const [token, setTokenState] = useState<string | null>(() => readStoredString(AUTH_TOKEN_STORAGE_KEY))

  function setToken(nextToken: string | null) {
    setTokenState(nextToken)
    writeStoredString(AUTH_TOKEN_STORAGE_KEY, nextToken)
  }

  return {
    token,
    setToken,
  }
}