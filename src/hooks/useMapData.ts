import { useQuery, useQueryClient } from '@tanstack/react-query'

import { health } from '../services/auth.service'
import { listPoints } from '../services/points.service'
import { queryKeys } from '../services/queryKeys'

export function useMapData() {
  const queryClient = useQueryClient()

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: health,
  })

  const backendAvailable = healthQuery.data === true

  const pointsQuery = useQuery({
    queryKey: queryKeys.points,
    queryFn: listPoints,
    enabled: backendAvailable,
  })

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      queryClient.invalidateQueries({ queryKey: queryKeys.points }),
    ])
  }

  return {
    backendAvailable,
    healthQuery,
    pointsQuery,
    points: backendAvailable ? pointsQuery.data ?? [] : [],
    loading: healthQuery.isPending || (backendAvailable && pointsQuery.isPending),
    refresh,
  }
}