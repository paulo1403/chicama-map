import { useEffect, useState } from 'react'

import { readStoredArray, SAVED_POINTS_STORAGE_KEY, writeStoredArray } from '../utils/storage'

export function useSavedPoints() {
  const [savedIds, setSavedIds] = useState<string[]>(() => readStoredArray(SAVED_POINTS_STORAGE_KEY))

  useEffect(() => {
    writeStoredArray(SAVED_POINTS_STORAGE_KEY, savedIds)
  }, [savedIds])

  function toggleSaved(pointId: string) {
    setSavedIds((previous) =>
      previous.includes(pointId)
        ? previous.filter((savedId) => savedId !== pointId)
        : [...previous, pointId],
    )
  }

  return {
    savedIds,
    toggleSaved,
  }
}