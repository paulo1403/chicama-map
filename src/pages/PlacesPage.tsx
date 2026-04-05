import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BottomNav } from '../components/map/BottomNav'
import { FeaturedPointCard } from '../components/map/FeaturedPointCard'
import { PlacesList } from '../components/map/PlacesList'
import { CATEGORIES } from '../constants/categories'
import { usePointsDirectory } from '../hooks/usePointsDirectory'
import { useSavedPoints } from '../hooks/useSavedPoints'
import { useI18n } from '../i18n/useI18n'
import { toastService } from '../services/toast.service'
import type { CategoryKey, MapPoint, PointSortOption } from '../types/map'
import { DEFAULT_CENTER } from '../utils/location'
import './PlacesPage.css'

type PlacesPageProps = {
  mode: 'all' | 'saved'
}

const FEATURED_SKELETON_POINT: MapPoint = {
  id: 'featured-skeleton',
  lat: DEFAULT_CENTER.lat,
  lng: DEFAULT_CENTER.lng,
  name: 'Chicama',
  categories: [],
  rating: 0,
  description: '',
  contact: '',
  keywords: [],
  createdAt: 0,
  updatedAt: 0,
}

export function PlacesPage({ mode }: PlacesPageProps) {
  const savedView = mode === 'saved'
  const { savedIds, toggleSaved } = useSavedPoints()
  const { categoryLabel, copy } = useI18n()

  const [activeCategories, setActiveCategories] = useState<CategoryKey[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<PointSortOption>('distance')
  const resultsScrollRef = useRef<HTMLDivElement | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const { backendAvailable, loading, isFetchingNextPage, fetchNextPage, points, total, loadedCount, hasMore } = usePointsDirectory({
    searchQuery,
    categories: activeCategories,
    limit: 20,
    ids: savedView ? savedIds : undefined,
    sort: sortOrder,
    origin: DEFAULT_CENTER,
  })

  const visiblePoints = points
  const showPreviewSkeleton = loading && visiblePoints.length === 0

  useEffect(() => {
    resultsScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [savedView, searchQuery, activeCategories, sortOrder])

  useEffect(() => {
    const root = resultsScrollRef.current
    const target = loadMoreRef.current

    if (!root || !target || !backendAvailable || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      {
        root,
        rootMargin: '420px 0px',
        threshold: 0,
      },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [backendAvailable, fetchNextPage, hasMore, isFetchingNextPage, visiblePoints.length])

  useEffect(() => {
    const container = resultsScrollRef.current

    if (!container || !backendAvailable || !hasMore || loading || isFetchingNextPage) {
      return
    }

    if (container.scrollHeight <= container.clientHeight * 1.35) {
      void fetchNextPage()
    }
  }, [backendAvailable, fetchNextPage, hasMore, isFetchingNextPage, loading, visiblePoints.length])

  const effectiveSelectedPointId = useMemo(() => {
    if (selectedPointId && visiblePoints.some((point) => point.id === selectedPointId)) {
      return selectedPointId
    }

    return visiblePoints[0]?.id ?? null
  }, [selectedPointId, visiblePoints])

  const selectedPoint = useMemo(
    () =>
      effectiveSelectedPointId
        ? visiblePoints.find((point) => point.id === effectiveSelectedPointId) ?? null
        : null,
    [effectiveSelectedPointId, visiblePoints],
  )

  function toggleCategory(key: CategoryKey) {
    setActiveCategories((previous) => {
      if (previous.includes(key)) return previous.filter((category) => category !== key)
      return [...previous, key]
    })
  }

  function openDirections(point: MapPoint) {
    toastService.info(copy.mapPage.openingRoute(point.name))
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const hasActiveFilters = searchQuery.trim().length > 0 || activeCategories.length > 0
  const sortOptions: Array<{ value: PointSortOption; label: string }> = [
    { value: 'distance', label: copy.common.sortByDistance },
    { value: 'rating', label: copy.common.sortByRating },
    { value: 'recent', label: copy.common.sortByRecent },
  ]

  const emptyState = useMemo(() => {
    if (!backendAvailable) {
      return {
        title: copy.mapPage.emptyOfflineTitle,
        text: copy.mapPage.emptyOfflineText,
      }
    }

    if (savedView && savedIds.length === 0) {
      return {
        title: copy.directoryPage.savedEmptyTitle,
        text: copy.directoryPage.savedEmptyText,
      }
    }

    if (hasActiveFilters) {
      return {
        title: copy.mapPage.emptyFilteredTitle,
        text: copy.mapPage.emptyFilteredText,
      }
    }

    if (savedView) {
      return {
        title: copy.directoryPage.savedEmptyTitle,
        text: copy.directoryPage.savedEmptyText,
      }
    }

    return {
      title: copy.mapPage.emptyNoPointsTitle,
      text: copy.mapPage.emptyNoPointsText,
    }
  }, [backendAvailable, copy, hasActiveFilters, savedIds.length, savedView])

  return (
    <div className="PlacesPageSurface" data-route-surface={savedView ? 'saved' : 'list'}>
      <div className="PlacesPageFrame">
        <div className="PlacesPageInner">
          <section className="PlacesControlCard">
            <div className="PlacesSearchRow">
              <label className="PlacesSearchField" aria-label={copy.mapHero.searchLabel}>
                <Search aria-hidden="true" className="PlacesSearchIcon" strokeWidth={2} />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                  }}
                  placeholder={copy.mapHero.searchPlaceholder}
                  type="search"
                />
              </label>
            </div>

            <div className="Chips PlacesChips" aria-label={copy.mapHero.filters}>
              <button
                className={activeCategories.length === 0 ? 'Chip ChipActive' : 'Chip'}
                onClick={() => {
                  setActiveCategories([])
                }}
                type="button"
              >
                {copy.mapPage.all}
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  className={activeCategories.includes(category.key) ? 'Chip ChipActive' : 'Chip'}
                  onClick={() => toggleCategory(category.key)}
                  type="button"
                >
                  {categoryLabel(category.key)}
                </button>
              ))}
            </div>
          </section>

          <div className="PlacesContentLayout">
            <section className="PlacesResultsPanel">
              <div className="PlacesResultsHeader">
                <div className="PanelStatus">
                  {!backendAvailable
                    ? copy.mapPage.apiOffline
                    : loading
                      ? copy.mapPage.loading
                      : copy.mapPage.resultsCount(total)}
                </div>

                <div className="PlacesResultsMeta">
                  <label className="PlacesSortField">
                    <select
                      className="SortSelect"
                      value={sortOrder}
                      onChange={(event) => {
                        setSortOrder(event.target.value as PointSortOption)
                      }}
                      aria-label={copy.common.sortLabel}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {loadedCount > 0 && total > loadedCount ? (
                    <span className="PlacesResultsTag">{loadedCount} / {total}</span>
                  ) : savedView ? (
                    <span className="PlacesResultsTag">{copy.bottomNav.saved} · {total}</span>
                  ) : activeCategories.length > 0 ? (
                    <span className="PlacesResultsTag">{copy.mapHero.filtersWithCount(activeCategories.length)}</span>
                  ) : null}
                </div>
              </div>

              <div className="PlacesResultsScroll" ref={resultsScrollRef}>
                <PlacesList
                  points={visiblePoints}
                  selectedPointId={effectiveSelectedPointId}
                  savedIds={savedIds}
                  loading={loading}
                  emptyTitle={emptyState.title}
                  emptyText={emptyState.text}
                  onSelectPoint={setSelectedPointId}
                  scrollContainerRef={resultsScrollRef}
                />

                {backendAvailable && hasMore ? <div className="PlacesInfiniteTrigger" ref={loadMoreRef} aria-hidden="true" /> : null}
                {isFetchingNextPage ? <div className="PlacesLoadMoreStatus">{copy.mapPage.loading}</div> : null}
                {!hasMore && visiblePoints.length > 0 ? <div className="PlacesLoadMoreStatus">{copy.mapPage.resultsCount(total)}</div> : null}
              </div>
            </section>

            <aside className="PlacesSidebar">
              <div className="PlacesSidebarCard">
                <div className="PlacesSidebarLabel">{copy.directoryPage.previewTitle}</div>
                {selectedPoint || showPreviewSkeleton ? (
                  <FeaturedPointCard
                    point={selectedPoint ?? FEATURED_SKELETON_POINT}
                    saved={selectedPoint ? savedIds.includes(selectedPoint.id) : false}
                    loading={showPreviewSkeleton}
                    onToggleSaved={toggleSaved}
                    onOpenDirections={openDirections}
                  />
                ) : (
                  <div className="EmptyState">
                    <div className="EmptyStateTitle">{emptyState.title}</div>
                    <div className="EmptyStateText">{emptyState.text}</div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <BottomNav savedCount={savedIds.length} />
      </div>
    </div>
  )
}
