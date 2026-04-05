import { useQuery } from '@tanstack/react-query'

import { getPoint } from '../services/points.service'
import { queryKeys } from '../services/queryKeys'

export function usePointDetail(pointId: string | null, enabled = true) {
  const pointQuery = useQuery({
    queryKey: queryKeys.pointDetail(pointId ?? 'none'),
    queryFn: () => getPoint(pointId ?? ''),
    enabled: enabled && Boolean(pointId),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  })

  return {
    point: pointQuery.data ?? null,
    loading: pointQuery.isPending,
    isFetching: pointQuery.isFetching,
  }
}
