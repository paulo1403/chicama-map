import { CircleCheck, Crosshair, NotebookPen, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
  const { copy, formatCategories, language } = useI18n()

  const [authError, setAuthError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<AdminDraft | null>(null)
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [page, setPage] = useState(1)

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

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredPoints.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedPoints = filteredPoints.slice(pageStart, pageStart + pageSize)
  const rangeStart = filteredPoints.length === 0 ? 0 : pageStart + 1
  const rangeEnd = Math.min(pageStart + pageSize, filteredPoints.length)
  const sheetOpen = Boolean(draft) || (!token && backendAvailable)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (!sheetOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sheetOpen])
  const adminUxCopy =
    language === 'en'
      ? {
          eyebrow: 'Faster point creation',
          title: 'A clearer workflow for adding places',
          subtitle: 'Sign in, pick the spot on the map, then complete only the key fields to publish it.',
          sessionReady: 'Admin session ready',
          sessionNeeded: 'Sign in required',
          noCoords: 'No map point selected yet',
          stepLogin: '1. Sign in',
          stepPick: '2. Pick on map',
          stepFill: '3. Complete details',
          stepLoginText: 'Use the admin panel to unlock create and edit actions.',
          stepPickText: 'Tap the map where the place should appear.',
          stepFillText: 'Add a name, categories, and a short helpful description.',
          createFromMap: 'Create from map',
          mapEyebrow: 'Pin the location',
          mapHelperReady: 'Tip: choose the exact entrance or storefront for better directions.',
          listEyebrow: 'Existing places',
          listTitle: 'Edit and refine your points',
          editHint: 'Tap to edit',
          previousPage: 'Previous',
          nextPage: 'Next',
          pageSummary: (current: number, total: number) => `Page ${current} of ${total}`,
          pageRange: (start: number, end: number, total: number) => `${start}-${end} of ${total} places`,
        }
      : {
          eyebrow: 'Carga de puntos más rápida',
          title: 'Un flujo más claro para agregar lugares',
          subtitle: 'Inicia sesión, marca el punto en el mapa y completa solo los campos clave para publicarlo.',
          sessionReady: 'Sesión admin activa',
          sessionNeeded: 'Necesitas iniciar sesión',
          noCoords: 'Aún no elegiste una ubicación en el mapa',
          stepLogin: '1. Inicia sesión',
          stepPick: '2. Marca en el mapa',
          stepFill: '3. Completa detalles',
          stepLoginText: 'Abre el panel admin para desbloquear crear y editar.',
          stepPickText: 'Toca el mapa en el lugar exacto donde debe aparecer.',
          stepFillText: 'Agrega nombre, categorías y una breve descripción útil.',
          createFromMap: 'Crear desde mapa',
          mapEyebrow: 'Ubica el punto',
          mapHelperReady: 'Tip: marca la entrada o fachada exacta para que la ruta sea más útil.',
          listEyebrow: 'Lugares existentes',
          listTitle: 'Edita y mejora tus puntos',
          editHint: 'Toca para editar',
          previousPage: 'Anterior',
          nextPage: 'Siguiente',
          pageSummary: (current: number, total: number) => `Página ${current} de ${total}`,
          pageRange: (start: number, end: number, total: number) => `${start}-${end} de ${total} lugares`,
        }

  const activeCoords = draft
    ? { lat: draft.lat, lng: draft.lng }
    : pickedCoords

  const selectedCoordsLabel = activeCoords
    ? `Lat ${activeCoords.lat.toFixed(5)} · Lng ${activeCoords.lng.toFixed(5)}`
    : adminUxCopy.noCoords

  const activeMarkerCategories = draft?.categories.length ? draft.categories : ['otros']

  const guideSteps = [
    {
      icon: CircleCheck,
      title: adminUxCopy.stepLogin,
      text: token ? adminUxCopy.sessionReady : adminUxCopy.stepLoginText,
      done: Boolean(token),
    },
    {
      icon: Crosshair,
      title: adminUxCopy.stepPick,
      text: activeCoords ? selectedCoordsLabel : adminUxCopy.stepPickText,
      done: Boolean(activeCoords),
    },
    {
      icon: NotebookPen,
      title: adminUxCopy.stepFill,
      text: draft?.name.trim() ? draft.name.trim() : adminUxCopy.stepFillText,
      done: Boolean(draft?.name.trim()),
    },
  ]

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

  function handlePickCoords(coords: { lat: number; lng: number }) {
    setPickedCoords(coords)
    setDraft((current) => (current ? { ...current, lat: coords.lat, lng: coords.lng } : current))
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
    <div className={sheetOpen ? 'AdminLayout AdminLayoutSheetOpen' : 'AdminLayout'}>
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

      <section className="AdminHeroCard" aria-label={adminUxCopy.title}>
        <div className="AdminHeroIntro">
          <div className="AdminEyebrow">{adminUxCopy.eyebrow}</div>
          <div className="AdminHeroHeadingRow">
            <div className="AdminHeroHeading">{adminUxCopy.title}</div>
            <span className={token ? 'AdminStatusPill is-ready' : 'AdminStatusPill'}>
              {token ? adminUxCopy.sessionReady : adminUxCopy.sessionNeeded}
            </span>
          </div>
          <p className="AdminHeroText">{adminUxCopy.subtitle}</p>
        </div>

        <div className="AdminStepGrid">
          {guideSteps.map((step) => {
            const Icon = step.icon

            return (
              <div className={step.done ? 'AdminStepCard is-done' : 'AdminStepCard'} key={step.title}>
                <span className="AdminStepIcon">
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="AdminStepTitle">{step.title}</div>
                  <div className="AdminStepText">{step.text}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="AdminSearch">
        <label className="AdminSearchField">
          <Search aria-hidden="true" className="AdminSearchIcon" size={16} strokeWidth={2.2} />
          <input
            className="Field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.common.searchByNamePlaceholder}
          />
        </label>

        <div className="AdminSearchActions">
          <button className="Button" type="button" onClick={() => startCreate()} disabled={!token || busy}>
            {copy.common.new}
          </button>
          <button
            className="Button ButtonPrimary"
            type="button"
            onClick={openCreateFromMap}
            disabled={!token || !pickedCoords || busy}
          >
            {adminUxCopy.createFromMap}
          </button>
        </div>
      </div>

      <div className="AdminWorkspaceGrid">
      <section className="AdminMapCard" aria-label={copy.adminPage.mapSectionLabel}>
        <div className="AdminMapTop">
          <div>
            <div className="AdminSectionEyebrow">{adminUxCopy.mapEyebrow}</div>
            <div className="AdminMapTitle">{copy.adminPage.mapTitle}</div>
          </div>
          <div className={activeCoords ? 'AdminMapCoords AdminMapCoordsActive' : 'AdminMapCoords'}>
            {selectedCoordsLabel}
          </div>
        </div>

        <div className="AdminMapHelper">
          {token ? adminUxCopy.mapHelperReady : copy.adminPage.signInToCreate}
        </div>

        <MapContainer center={DEFAULT_CENTER} zoom={15} className="AdminMap" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains={['a', 'b', 'c', 'd']}
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <AdminMapPicker onPick={handlePickCoords} />

          {points.map((point) => (
            <Marker
              key={point.id}
              icon={getPointMarkerIcon(point.categories, false)}
              position={[point.lat, point.lng]}
            />
          ))}

          {activeCoords && (
            <Marker
              icon={getPointMarkerIcon(activeMarkerCategories, true)}
              position={[activeCoords.lat, activeCoords.lng]}
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
        <div className="AdminListPanelTop">
          <div>
            <div className="AdminSectionEyebrow">{adminUxCopy.listEyebrow}</div>
            <div className="AdminSectionTitle">{adminUxCopy.listTitle}</div>
          </div>
          <div className="AdminListMeta">{copy.adminPage.pointsCount(filteredPoints.length)}</div>
        </div>

        <div className="AdminList" role="list" aria-busy={loading}>
          {filteredPoints.length > 0 ? (
            paginatedPoints.map((point) => (
              <div className="AdminListRow" key={point.id}>
                <button className="Card AdminPointCard" type="button" onClick={() => startEdit(point)}>
                  <div className="AdminPointCardTop">
                    <div>
                      <div className="CardTitle">{point.name}</div>
                      <div className="CardMeta">
                        {point.categories.length ? formatCategories(point.categories) : copy.adminPage.noCategory}
                      </div>
                    </div>
                    <span className="CardHint">{adminUxCopy.editHint}</span>
                  </div>

                  <div className="AdminMetaPills">
                    <span className="AdminMetaPill">
                      {point.rating > 0 ? copy.adminPage.rating(point.rating) : copy.adminPage.noRating}
                    </span>
                    <span className="AdminMetaPill">Lat {point.lat.toFixed(4)} · Lng {point.lng.toFixed(4)}</span>
                  </div>
                </button>
              </div>
            ))
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

        {filteredPoints.length > 0 ? (
          <div className="AdminPagination" aria-label="Paginación de puntos">
            <div className="AdminPaginationMeta">
              <strong>{adminUxCopy.pageSummary(currentPage, totalPages)}</strong>
              <span>{adminUxCopy.pageRange(rangeStart, rangeEnd, filteredPoints.length)}</span>
            </div>

            <div className="AdminPaginationActions">
              <button
                className="Button"
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                {adminUxCopy.previousPage}
              </button>
              <button
                className="Button"
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
              >
                {adminUxCopy.nextPage}
              </button>
            </div>
          </div>
        ) : null}
      </section>
      </div>

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