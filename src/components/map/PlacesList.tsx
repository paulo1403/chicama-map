import { useVirtualizer } from '@tanstack/react-virtual'
import { Skeleton } from 'boneyard-js/react'
import { useEffect, type RefObject } from 'react'

import { useI18n } from '../../i18n/useI18n'
import type { MapPoint } from '../../types/map'
import { DEFAULT_CENTER, distanceInKm, formatDistanceLabel } from '../../utils/location'
import { getPointTone } from '../../utils/point'
import { PointMedia } from './PointMedia'
import './PlacesList.css'

type PlacesListProps = {
  points: MapPoint[]
  selectedPointId: string | null
  savedIds: string[]
  loading: boolean
  emptyTitle: string
  emptyText: string
  onSelectPoint: (pointId: string) => void
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export function PlacesList({
  points,
  selectedPointId,
  savedIds,
  loading,
  emptyTitle,
  emptyText,
  onSelectPoint,
  scrollContainerRef,
}: PlacesListProps) {
  'use no memo'
  const { copy, formatCategories } = useI18n()
  const showSkeleton = loading && points.length === 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: points.length,
    getScrollElement: () => scrollContainerRef?.current ?? null,
    estimateSize: () => 92,
    overscan: 8,
  })

  useEffect(() => {
    if (points.length > 0) {
      rowVirtualizer.measure()
    }
  }, [points.length, rowVirtualizer])

  const virtualItems = rowVirtualizer.getVirtualItems()
  const shouldUseStaticList = points.length > 0 && virtualItems.length === 0

  return (
    <Skeleton name="places-directory-list" loading={showSkeleton} color="#e8dcc8">
      <div className="ResultsList" role="list" aria-busy={loading}>
        {showSkeleton ? (
          <div className="ResultsListSkeleton">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="PlaceCard PlaceCardGhost" key={`skeleton-${index}`}>
                <div className="PlaceThumb PlaceThumbGhost" />
                <div className="PlaceContent">
                  <div className="PlaceTopLine">
                    <span className="PlaceGhostBlock PlaceGhostTitle" />
                    <span className="PlaceGhostBlock PlaceGhostDistance" />
                  </div>
                  <div className="PlaceMeta">
                    <span className="PlaceGhostBlock PlaceGhostMeta" />
                    <span className="PlaceGhostBlock PlaceGhostMeta PlaceGhostMetaShort" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : points.length > 0 ? (
          shouldUseStaticList ? (
            <div className="ResultsListStack">
              {points.map((point) => {
                const saved = savedIds.includes(point.id)
                const selected = selectedPointId === point.id

                return (
                  <button
                    className={selected ? 'PlaceCard PlaceCardSelected' : 'PlaceCard'}
                    key={point.id}
                    onClick={() => onSelectPoint(point.id)}
                    type="button"
                  >
                    <div className={`PlaceThumb PlaceThumb--${getPointTone(point)}`}>
                      <PointMedia point={point} className="PlaceThumbPlaceholder" />
                    </div>

                    <div className="PlaceContent">
                      <div className="PlaceTopLine">
                        <div className="PlaceTitle">{point.name}</div>
                        <div className="PlaceDistance">
                          {formatDistanceLabel(distanceInKm(point, DEFAULT_CENTER))}
                        </div>
                      </div>

                      <div className="PlaceMeta">
                        <span>
                          {point.categories.length > 0
                            ? formatCategories(point.categories)
                            : copy.places.noCategory}
                        </span>
                        {point.rating > 0 ? (
                          <span>★ {point.rating.toFixed(1)}</span>
                        ) : (
                          <span>{copy.places.new}</span>
                        )}
                        {saved ? <span>{copy.places.saved}</span> : null}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div
              className="ResultsListVirtualSpace"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualItem) => {
                const point = points[virtualItem.index]
                if (!point) return null

                const saved = savedIds.includes(point.id)
                const selected = selectedPointId === point.id

                return (
                  <div
                    className="ResultsListRow"
                    data-index={virtualItem.index}
                    key={point.id}
                    ref={rowVirtualizer.measureElement}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <button
                      className={selected ? 'PlaceCard PlaceCardSelected' : 'PlaceCard'}
                      onClick={() => onSelectPoint(point.id)}
                      type="button"
                    >
                      <div className={`PlaceThumb PlaceThumb--${getPointTone(point)}`}>
                        <PointMedia point={point} className="PlaceThumbPlaceholder" />
                      </div>

                      <div className="PlaceContent">
                        <div className="PlaceTopLine">
                          <div className="PlaceTitle">{point.name}</div>
                          <div className="PlaceDistance">
                            {formatDistanceLabel(distanceInKm(point, DEFAULT_CENTER))}
                          </div>
                        </div>

                        <div className="PlaceMeta">
                          <span>
                            {point.categories.length > 0
                              ? formatCategories(point.categories)
                              : copy.places.noCategory}
                          </span>
                          {point.rating > 0 ? (
                            <span>★ {point.rating.toFixed(1)}</span>
                          ) : (
                            <span>{copy.places.new}</span>
                          )}
                          {saved ? <span>{copy.places.saved}</span> : null}
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        ) : null}

        {!loading && points.length === 0 && (
          <div className="EmptyState">
            <div className="EmptyStateTitle">{emptyTitle}</div>
            <div className="EmptyStateText">{emptyText}</div>
          </div>
        )}
      </div>
    </Skeleton>
  )
}