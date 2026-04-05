import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { Link, useNavigate } from 'react-router-dom'
import './AdminPage.css'

import { AdminSheet } from '../components/admin/AdminSheet'
import { LanguageToggle } from '../components/feedback/LanguageToggle'
import { getPointMarkerIcon } from '../components/map/pointMarkerIcon'
import { useAdminSession } from '../hooks/useAdminSession'
import { useLoginMutation } from '../hooks/useLoginMutation'
import { useMapData } from '../hooks/useMapData'
import { usePointMutations } from '../hooks/usePointMutations'
import { useI18n } from '../i18n/useI18n'
import { getErrorMessage } from '../services/error.service'
import { toastService } from '../services/toast.service'
import type { AdminDraft, MapPoint } from '../types/map'
import { DEFAULT_CENTER } from '../utils/location'
import { clamp, createId } from '../utils/point'

export function AdminPage() {
  const navigate = useNavigate()
  const { token, setToken } = useAdminSession()
  const { backendAvailable, loading, points, refresh } = useMapData()
  const loginMutation = useLoginMutation()
  const {
    createPointMutation,
    deletePointMutation,
    updatePointMutation,
  } = usePointMutations(token)
  const { copy, formatCategories } = useI18n()

  const [authError, setAuthError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<AdminDraft | null>(null)
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const adminListRef = useRef<HTMLDivElement | null>(null)

  const filteredPoints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return points
    return points.filter((point) => point.name.toLowerCase().includes(normalizedQuery))
  }, [points, query])

  const busy =
    loginMutation.isPending ||
    createPointMutation.isPending ||
    updatePointMutation.isPending ||
    deletePointMutation.isPending

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredPoints.length,
    getScrollElement: () => adminListRef.current,
    estimateSize: () => 96,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const sheetOpen = Boolean(draft) || (!token && backendAvailable)

  function closeSheet() {
    setDraft(null)
    setAuthError(null)
  }

  async function login() {
    try {
      const nextToken = await loginMutation.mutateAsync({ username, password })
      setToken(nextToken)
      setAuthError(null)
      await refresh()
    } catch (error) {
      const message = getErrorMessage(error, copy.auth.authError)
      setAuthError(message)
    }
  }

  function logout() {
    setToken(null)
    closeSheet()
    navigate('/', { replace: true })
  }

  function startCreate(coords?: { lat: number; lng: number }) {
    const target = coords ?? DEFAULT_CENTER
    setDraft({
      mode: 'create',
      lat: target.lat,
      lng: target.lng,
      name: '',
      categories: [],
      rating: 0,
      description: '',
      contact: '',
      keywords: [],
    })
  }

  function startEdit(point: MapPoint) {
    setDraft({
      mode: 'edit',
      id: point.id,
      lat: point.lat,
      lng: point.lng,
      name: point.name,
      categories: point.categories,
      rating: point.rating,
      description: point.description,
      contact: point.contact,
      keywords: point.keywords ?? [],
    })
  }

  async function saveDraft() {
    if (!draft || !token) return

    const trimmedName = draft.name.trim()
    if (!trimmedName) return

    try {
      if (draft.mode === 'create') {
        const now = Date.now()
        const point: MapPoint = {
          id: createId(),
          lat: draft.lat,
          lng: draft.lng,
          name: trimmedName,
          categories: draft.categories,
          rating: clamp(draft.rating, 0, 5),
          description: draft.description.trim(),
          contact: draft.contact.trim(),
          keywords: draft.keywords ?? [],
          createdAt: now,
          updatedAt: now,
        }

        await createPointMutation.mutateAsync(point)
        setDraft(null)
        return
      }

      if (!draft.id) return

      await updatePointMutation.mutateAsync({
        id: draft.id,
        patch: {
          lat: draft.lat,
          lng: draft.lng,
          name: trimmedName,
          categories: draft.categories,
          rating: clamp(draft.rating, 0, 5),
          description: draft.description.trim(),
          contact: draft.contact.trim(),
          keywords: draft.keywords ?? [],
        },
      })

      setDraft(null)
    } catch {
      void 0
    }
  }

  function openCreateFromMap() {
    if (!token) {
      toastService.info(copy.adminPage.signInToCreate)
      return
    }

    if (!pickedCoords) {
      toastService.info(copy.adminPage.chooseCoords)
      return
    }

    startCreate(pickedCoords)
  }

  async function removePoint(id: string) {
    try {
      await deletePointMutation.mutateAsync(id)
      setDraft(null)
    } catch {
      void 0
    }
  }

  async function setFromMyLocation() {
    if (!draft || !('geolocation' in navigator)) return

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        })
      })

      setDraft({
        ...draft,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      toastService.info(copy.adminPage.locationApplied)
    } catch {
      toastService.error(copy.adminPage.locationUnavailable)
    }
  }

  return (
    <div className="AdminLayout">
      <div className="AdminTop">
        <div>
          <div className="AdminTitle">{copy.adminPage.title}</div>
          <div className="AdminSubtitle">
            {!backendAvailable ? copy.adminPage.apiOffline : loading ? copy.adminPage.loading : copy.adminPage.pointsCount(points.length)}
          </div>
        </div>
        <div className="AdminActions">
          <LanguageToggle />
          <button className="Button" type="button" onClick={() => void refresh()} disabled={loading || busy}>
            {copy.common.refresh}
          </button>
          <Link className="Button" to="/">
            {copy.common.map}
          </Link>
          {token ? (
            <button className="Button ButtonDanger" type="button" onClick={logout}>
              {copy.common.logout}
            </button>
          ) : null}
        </div>
      </div>

      <div className="AdminSearch">
        <input
          className="Field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.common.searchByNamePlaceholder}
        />
        <button className="Button ButtonPrimary" type="button" onClick={() => startCreate()} disabled={!token || busy}>
          {copy.common.new}
        </button>
      </div>

      <section className="AdminMapCard" aria-label={copy.adminPage.mapSectionLabel}>
        <div className="AdminMapTop">
          <div className="AdminMapTitle">{copy.adminPage.mapTitle}</div>
          <div className="AdminMapCoords">
            {pickedCoords
              ? `Lat ${pickedCoords.lat.toFixed(6)} · Lng ${pickedCoords.lng.toFixed(6)}`
              : copy.adminPage.mapHint}
          </div>
        </div>

        <MapContainer center={DEFAULT_CENTER} zoom={15} className="AdminMap" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains={['a', 'b', 'c', 'd']}
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <AdminMapPicker onPick={setPickedCoords} />

          {points.map((point) => (
            <Marker
              key={point.id}
              icon={getPointMarkerIcon(point.categories, false)}
              position={[point.lat, point.lng]}
            />
          ))}

          {pickedCoords && (
            <Marker
              icon={getPointMarkerIcon(['otros'], true)}
              position={[pickedCoords.lat, pickedCoords.lng]}
              zIndexOffset={500}
            />
          )}
        </MapContainer>

        <div className="AdminMapActions">
          <button
            className="Button ButtonPrimary"
            type="button"
            onClick={openCreateFromMap}
            disabled={!token || !pickedCoords || busy}
          >
            {copy.adminPage.addPoint}
          </button>
        </div>
      </section>

      <section className="AdminListPanel">
        <div className="AdminListMeta">{copy.adminPage.pointsCount(filteredPoints.length)}</div>

        <div className="AdminList" ref={adminListRef} role="list" aria-busy={loading}>
          {filteredPoints.length > 0 ? (
            <div className="AdminListInner" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              {virtualRows.map((virtualRow) => {
                const point = filteredPoints[virtualRow.index]
                if (!point) return null

                return (
                  <div
                    className="AdminListRow"
                    data-index={virtualRow.index}
                    key={point.id}
                    ref={rowVirtualizer.measureElement}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <button className="Card" type="button" onClick={() => startEdit(point)}>
                      <div className="CardTitle">{point.name}</div>
                      <div className="CardMeta">
                        {point.categories.length ? formatCategories(point.categories) : copy.adminPage.noCategory}
                      </div>
                      <div className="CardMeta">
                        {point.rating > 0 ? copy.adminPage.rating(point.rating) : copy.adminPage.noRating}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : !loading ? (
            <div className="AdminListEmpty">
              <div className="EmptyStateTitle">
                {query.trim() ? copy.mapPage.emptyFilteredTitle : copy.mapPage.emptyNoPointsTitle}
              </div>
              <div className="EmptyStateText">
                {query.trim() ? copy.mapPage.emptyFilteredText : copy.mapPage.emptyNoPointsText}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <AdminSheet
        authError={authError}
        backendAvailable={backendAvailable}
        busy={busy}
        draft={draft}
        password={password}
        sheetOpen={sheetOpen}
        token={token}
        username={username}
        onClose={closeSheet}
        onDeletePoint={(id) => void removePoint(id)}
        onDraftChange={setDraft}
        onLogin={() => void login()}
        onPasswordChange={setPassword}
        onSave={() => void saveDraft()}
        onUseMyLocation={() => void setFromMyLocation()}
        onUsernameChange={setUsername}
      />
    </div>
  )
}

type AdminMapPickerProps = {
  onPick: (coords: { lat: number; lng: number }) => void
}

function AdminMapPicker({ onPick }: AdminMapPickerProps) {
  useMapEvents({
    click(event) {
      onPick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  return null
}