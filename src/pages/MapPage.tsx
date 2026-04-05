import { divIcon, point as leafletPoint } from 'leaflet'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from 'boneyard-js/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import './MapPage.css'

import { BottomNav } from '../components/map/BottomNav'
import { FeaturedPointCard } from '../components/map/FeaturedPointCard'
import { MapFocus } from '../components/map/MapFocus'
import { MapHero } from '../components/map/MapHero'
import { getPointMarkerIcon } from '../components/map/pointMarkerIcon'
import { getUserLocationIcon } from '../components/map/userLocationIcon'
import { CATEGORIES } from '../constants/categories'
import { useMapPins } from '../hooks/useMapPins'
import { usePointDetail } from '../hooks/usePointDetail'
import { useSavedPoints } from '../hooks/useSavedPoints'
import { useI18n } from '../i18n/useI18n'
import { getPoint } from '../services/points.service'
import { queryKeys } from '../services/queryKeys'
import { toastService } from '../services/toast.service'
import type { CategoryKey, MapPoint, MapPointPin, MapViewportBounds, PointSortOption } from '../types/map'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/location'

type MapViewportState = {
  bounds: MapViewportBounds
  center: { lat: number; lng: number }
  zoom: number
}

type MarkerGroup =
  | { kind: 'single'; point: MapPointPin }
  | {
      kind: 'cluster'
      id: string
      lat: number
      lng: number
      count: number
      pointIds: string[]
      bounds: [[number, number], [number, number]]
    }

function getClusterCellSize(zoom: number) {
  if (zoom >= 17) return 0
  if (zoom >= 16) return 0.002
  if (zoom >= 15) return 0.0035
  if (zoom >= 14) return 0.006
  if (zoom >= 13) return 0.009
  return 0.014
}

function buildMarkerGroups(points: MapPointPin[], zoom: number): MarkerGroup[] {
  const cellSize = getClusterCellSize(zoom)

  if (cellSize === 0 || points.length < 12) {
    return points.map((point) => ({ kind: 'single', point }))
  }

  const groups = new Map<string, MapPointPin[]>()

  for (const point of points) {
    const latKey = Math.floor(point.lat / cellSize)
    const lngKey = Math.floor(point.lng / cellSize)
    const key = `${latKey}:${lngKey}`
    const existing = groups.get(key)

    if (existing) {
      existing.push(point)
    } else {
      groups.set(key, [point])
    }
  }

  return Array.from(groups.entries()).map(([key, groupPoints]) => {
    if (groupPoints.length === 1) {
      return { kind: 'single', point: groupPoints[0] }
    }

    const lat = groupPoints.reduce((sum, point) => sum + point.lat, 0) / groupPoints.length
    const lng = groupPoints.reduce((sum, point) => sum + point.lng, 0) / groupPoints.length
    const minLat = Math.min(...groupPoints.map((point) => point.lat))
    const maxLat = Math.max(...groupPoints.map((point) => point.lat))
    const minLng = Math.min(...groupPoints.map((point) => point.lng))
    const maxLng = Math.max(...groupPoints.map((point) => point.lng))

    return {
      kind: 'cluster',
      id: `cluster-${key}-${groupPoints.length}`,
      lat,
      lng,
      count: groupPoints.length,
      pointIds: groupPoints.map((point) => point.id),
      bounds: [[minLat, minLng], [maxLat, maxLng]],
    }
  })
}

function getClusterIcon(count: number) {
  const size = count > 24 ? 54 : count > 8 ? 48 : 42

  return divIcon({
    className: 'MapClusterMarkerRoot',
    html: `<div class="MapClusterMarker">${count}</div>`,
    iconSize: leafletPoint(size, size),
    iconAnchor: leafletPoint(size / 2, size / 2),
  })
}

function toPreviewPoint(point: MapPointPin): MapPoint {
  return {
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    name: point.name,
    categories: point.categories,
    rating: point.rating,
    description: '',
    contact: '',
    keywords: [],
    createdAt: 0,
    updatedAt: 0,
  }
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

export function MapPage() {
  const queryClient = useQueryClient()
  const { savedIds, toggleSaved } = useSavedPoints()
  const { categoryLabel, copy } = useI18n()

  const [activeCategories, setActiveCategories] = useState<CategoryKey[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [sortOrder, setSortOrder] = useState<PointSortOption>('distance')
  const [locateRequested, setLocateRequested] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [viewport, setViewport] = useState<MapViewportState | null>(null)
  const mapViewportRef = useRef<HTMLElement | null>(null)

  const sortOptions: Array<{ value: PointSortOption; label: string }> = [
    { value: 'distance', label: copy.common.sortByDistance },
    { value: 'rating', label: copy.common.sortByRating },
    { value: 'recent', label: copy.common.sortByRecent },
  ]

  const { backendAvailable, loading, pins, total } = useMapPins({
    searchQuery,
    categories: activeCategories,
    sort: sortOrder,
    bounds: viewport?.bounds,
    origin: userLocation ?? viewport?.center ?? DEFAULT_CENTER,
  })

  const visiblePoints = pins
  const markerGroups = useMemo(
    () => buildMarkerGroups(visiblePoints, viewport?.zoom ?? DEFAULT_ZOOM),
    [visiblePoints, viewport?.zoom],
  )

  const effectiveSelectedPointId = useMemo(() => {
    if (selectedPointId && visiblePoints.some((point) => point.id === selectedPointId)) {
      return selectedPointId
    }

    return visiblePoints[0]?.id ?? null
  }, [selectedPointId, visiblePoints])

  const selectedPointPreview = useMemo(
    () =>
      effectiveSelectedPointId
        ? visiblePoints.find((point) => point.id === effectiveSelectedPointId) ?? null
        : null,
    [effectiveSelectedPointId, visiblePoints],
  )

  const { point: selectedPointDetail } = usePointDetail(effectiveSelectedPointId, backendAvailable)

  const selectedPoint = selectedPointDetail ?? (selectedPointPreview ? toPreviewPoint(selectedPointPreview) : null)
  const showDockSkeleton = loading && visiblePoints.length === 0

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

  function preloadPointDetails(pointIds: string[]) {
    for (const pointId of pointIds.slice(0, 4)) {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.pointDetail(pointId),
        queryFn: () => getPoint(pointId),
        staleTime: 5 * 60_000,
      })
    }
  }

  const activeCount = activeCategories.length
  const statusText = !backendAvailable ? copy.mapPage.apiOffline : loading ? copy.mapPage.loading : copy.mapPage.resultsCount(total)

  return (
    <div className="App AppShell AppShellMapOnly" data-route-surface="map">
      <section className="MapViewport" ref={mapViewportRef}>
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="Map" zoomControl={false}>
          <MapViewportWatcher onChange={setViewport} />
          <MapFocus point={selectedPoint} />
          <MapLocateButton requested={locateRequested} onLocated={() => setLocateRequested(false)} onLocationFound={setUserLocation} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains={['a', 'b', 'c', 'd']}
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={getUserLocationIcon()}
              zIndexOffset={100}
            />
          )}
          <MapMarkerLayer
            groups={markerGroups}
            selectedPointId={effectiveSelectedPointId}
            onSelectPoint={setSelectedPointId}
            onPreloadDetails={preloadPointDetails}
          />
        </MapContainer>

        <div className="MapWash" />

        <MapHero
          searchQuery={searchQuery}
          activeCount={activeCount}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setFiltersOpen((previous) => !previous)}
          onRequestLocate={() => setLocateRequested(true)}
        />
      </section>

      <section className="MapDock">
        <Skeleton name="map-dock-panel" loading={showDockSkeleton} color="#e8dcc8">
          <div className="MapDockTopBar">
            <div className="PanelStatus">{statusText}</div>
            <label className="MapSortField">
              <select
                className="SortSelect"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as PointSortOption)}
                aria-label={copy.common.sortLabel}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtersOpen && (
            <div className="Chips MapDockChips" aria-label={copy.mapHero.filters}>
              <button
                className={activeCategories.length === 0 ? 'Chip ChipActive' : 'Chip'}
                onClick={() => setActiveCategories([])}
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
          )}

          {selectedPoint || showDockSkeleton ? (
            <div className="MapDockCard">
              <FeaturedPointCard
                point={selectedPoint ?? FEATURED_SKELETON_POINT}
                saved={selectedPoint ? savedIds.includes(selectedPoint.id) : false}
                loading={showDockSkeleton}
                onToggleSaved={toggleSaved}
                onOpenDirections={openDirections}
              />
            </div>
          ) : (
            <div className="MapDockEmpty">
              <div className="EmptyStateTitle">{copy.mapPage.emptyFilteredTitle}</div>
              <div className="EmptyStateText">{copy.mapPage.emptyFilteredText}</div>
            </div>
          )}
        </Skeleton>
      </section>

      <BottomNav savedCount={savedIds.length} />
    </div>
  )
}

type MapViewportWatcherProps = {
  onChange: (viewport: MapViewportState) => void
}

function MapViewportWatcher({ onChange }: MapViewportWatcherProps) {
  const emitViewport = useCallback(
    (map: ReturnType<typeof useMap>) => {
      const bounds = map.getBounds()
      const center = map.getCenter()

      onChange({
        bounds: {
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        },
        center: { lat: center.lat, lng: center.lng },
        zoom: map.getZoom(),
      })
    },
    [onChange],
  )

  const map = useMapEvents({
    moveend: () => emitViewport(map),
    zoomend: () => emitViewport(map),
  })

  useEffect(() => {
    emitViewport(map)
  }, [emitViewport, map])

  return null
}

type MapMarkerLayerProps = {
  groups: MarkerGroup[]
  selectedPointId: string | null
  onSelectPoint: (pointId: string) => void
  onPreloadDetails: (pointIds: string[]) => void
}

function MapMarkerLayer({ groups, selectedPointId, onSelectPoint, onPreloadDetails }: MapMarkerLayerProps) {
  const map = useMap()

  return (
    <>
      {groups.map((group) => {
        if (group.kind === 'single') {
          return (
            <Marker
              key={group.point.id}
              icon={getPointMarkerIcon(group.point.categories, group.point.id === selectedPointId)}
              position={[group.point.lat, group.point.lng]}
              zIndexOffset={group.point.id === selectedPointId ? 400 : 0}
              eventHandlers={{
                mouseover: () => onPreloadDetails([group.point.id]),
                click: () => {
                  onPreloadDetails([group.point.id])
                  onSelectPoint(group.point.id)
                },
              }}
            />
          )
        }

        return (
          <Marker
            key={group.id}
            icon={getClusterIcon(group.count)}
            position={[group.lat, group.lng]}
            zIndexOffset={200}
            eventHandlers={{
              mouseover: () => onPreloadDetails(group.pointIds),
              click: () => {
                onPreloadDetails(group.pointIds)

                const samePoint =
                  group.bounds[0][0] === group.bounds[1][0] && group.bounds[0][1] === group.bounds[1][1]

                if (samePoint) {
                  map.setView([group.lat, group.lng], Math.min(map.getZoom() + 2, 18))
                  return
                }

                map.fitBounds(group.bounds, {
                  padding: [32, 32],
                  maxZoom: Math.min(map.getZoom() + 2, 18),
                })
              },
            }}
          />
        )
      })}
    </>
  )
}

type MapLocateButtonProps = {
  requested: boolean
  onLocated: () => void
  onLocationFound: (location: { lat: number; lng: number }) => void
}

function MapLocateButton({ requested, onLocated, onLocationFound }: MapLocateButtonProps) {
  const map = useMap()
  const { copy } = useI18n()

  useEffect(() => {
    if (!requested) return

    if (!('geolocation' in navigator)) {
      toastService.error(copy.mapPage.locationUnavailable)
      onLocated()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map.setView([latitude, longitude], 16)
        onLocationFound({ lat: latitude, lng: longitude })
        onLocated()
      },
      (error) => {
        console.error('Geolocation error:', error)
        toastService.error(copy.mapPage.locationUnavailable)
        onLocated()
      },
    )
  }, [copy.mapPage.locationUnavailable, map, onLocated, onLocationFound, requested])

  return null
}