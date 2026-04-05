import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { health } from '../services/auth.service'
import { listMapPointPins } from '../services/points.service'
import { queryKeys } from '../services/queryKeys'
import type { CategoryKey, MapViewportBounds, PointSortOption } from '../types/map'
import { useDebouncedValue } from './useDebouncedValue'

type UseMapPinsOptions = {
  searchQuery: string
  categories: CategoryKey[]
  sort: PointSortOption
  bounds?: MapViewportBounds | null
  origin?: { lat: number; lng: number } | null
}

export function useMapPins({ searchQuery, categories, sort, bounds, origin }: UseMapPinsOptions) {
  const queryClient = useQueryClient()
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 300)
  const normalizedCategories = useMemo(() => [...categories].sort(), [categories])
  const normalizedBounds = useMemo(() => {
    if (!bounds) return null

    const round = (value: number) => Number(value.toFixed(3))

    return {
      minLat: round(bounds.minLat),
      maxLat: round(bounds.maxLat),
      minLng: round(bounds.minLng),
      maxLng: round(bounds.maxLng),
    }
  }, [bounds])
  const debouncedBounds = useDebouncedValue(normalizedBounds, 250)

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: health,
  })

  const backendAvailable = healthQuery.data === true

  const pinsQuery = useQuery({
    queryKey: queryKeys.pointsMap({
      q: debouncedSearchQuery,
      categories: normalizedCategories,
      sort,
      originLat: origin?.lat,
      originLng: origin?.lng,
      minLat: debouncedBounds?.minLat,
      maxLat: debouncedBounds?.maxLat,
      minLng: debouncedBounds?.minLng,
      maxLng: debouncedBounds?.maxLng,
    }),
    queryFn: () =>
      listMapPointPins({
        q: debouncedSearchQuery,
        categories: normalizedCategories,
        sort,
        originLat: origin?.lat,
        originLng: origin?.lng,
        minLat: debouncedBounds?.minLat,
        maxLat: debouncedBounds?.maxLat,
        minLng: debouncedBounds?.minLng,
        maxLng: debouncedBounds?.maxLng,
      }),
    enabled: backendAvailable,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (previousData) => previousData,
  })

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      queryClient.invalidateQueries({ queryKey: queryKeys.points }),
    ])
  }

  return {
    backendAvailable,
    loading: healthQuery.isPending || (backendAvailable && pinsQuery.isPending),
    isFetching: pinsQuery.isFetching,
    pins: backendAvailable ? pinsQuery.data?.items ?? [] : [],
    total: backendAvailable ? pinsQuery.data?.total ?? 0 : 0,
    debouncedSearchQuery,
    refresh,
  }
}
