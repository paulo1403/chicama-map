import { useMemo } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { health } from '../services/auth.service'
import { listPointsPage } from '../services/points.service'
import { queryKeys } from '../services/queryKeys'
import type { CategoryKey, PointSortOption } from '../types/map'
import { useDebouncedValue } from './useDebouncedValue'

type UsePointsDirectoryOptions = {
  searchQuery: string
  categories: CategoryKey[]
  limit?: number
  ids?: string[]
  sort: PointSortOption
  origin?: { lat: number; lng: number }
}

export function usePointsDirectory({
  searchQuery,
  categories,
  limit = 20,
  ids,
  sort,
  origin,
}: UsePointsDirectoryOptions) {
  const queryClient = useQueryClient()
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 300)
  const normalizedCategories = useMemo(() => [...categories].sort(), [categories])
  const normalizedIds = useMemo(() => (ids ? [...ids].sort() : undefined), [ids])

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: health,
  })

  const backendAvailable = healthQuery.data === true
  const hasSavedIds = normalizedIds === undefined || normalizedIds.length > 0

  const pointsQuery = useInfiniteQuery({
    queryKey: queryKeys.pointsList({
      q: debouncedSearchQuery,
      categories: normalizedCategories,
      limit,
      ids: normalizedIds,
      sort,
      originLat: origin?.lat,
      originLng: origin?.lng,
    }),
    queryFn: ({ pageParam }) =>
      listPointsPage({
        q: debouncedSearchQuery,
        categories: normalizedCategories,
        page: pageParam,
        limit,
        ids: normalizedIds,
        sort,
        originLat: origin?.lat,
        originLng: origin?.lng,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: backendAvailable && hasSavedIds,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })

  const pages = pointsQuery.data?.pages ?? []
  const points = pages.flatMap((page) => page.items)
  const lastPage = pages[pages.length - 1]

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      queryClient.invalidateQueries({ queryKey: queryKeys.points }),
    ])
  }

  return {
    backendAvailable,
    loading: healthQuery.isPending || (backendAvailable && hasSavedIds && pointsQuery.isPending),
    isFetching: pointsQuery.isFetching,
    isFetchingNextPage: pointsQuery.isFetchingNextPage,
    fetchNextPage: pointsQuery.fetchNextPage,
    points: backendAvailable && hasSavedIds ? points : [],
    total: backendAvailable && hasSavedIds ? lastPage?.total ?? 0 : 0,
    loadedCount: backendAvailable && hasSavedIds ? points.length : 0,
    limit: lastPage?.limit ?? limit,
    totalPages: lastPage?.totalPages ?? 1,
    hasMore: lastPage?.hasMore ?? false,
    debouncedSearchQuery,
    refresh,
  }
}
