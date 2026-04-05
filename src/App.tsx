import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AdminPage = lazy(async () => {
  const module = await import('./pages/AdminPage')
  return { default: module.AdminPage }
})

const MapPage = lazy(async () => {
  const module = await import('./pages/MapPage')
  return { default: module.MapPage }
})

const PlacesPage = lazy(async () => {
  const module = await import('./pages/PlacesPage')
  return { default: module.PlacesPage }
})

function RouteFallback() {
  return <div className="RouteLoadingFallback" aria-hidden="true" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/list" element={<PlacesPage mode="all" />} />
          <Route path="/saved" element={<PlacesPage mode="saved" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
