import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { getCategoryLabel } from '../constants/categories'
import { formatCategories as formatCategoriesByLanguage } from '../utils/point'
import { LANGUAGE_STORAGE_KEY, readStoredString, writeStoredString } from '../utils/storage'
import type { Language } from './types'
import { I18nContext, type I18nContextValue, type TranslationSet } from './useI18n'

const translations: Record<Language, TranslationSet> = {
  es: {
    common: {
      close: 'Cerrar',
      refresh: 'Actualizar',
      map: 'Mapa',
      list: 'Lista',
      save: 'Guardar',
      saved: 'Guardado',
      delete: 'Eliminar',
      logout: 'Salir',
      searchByNamePlaceholder: 'Buscar por nombre...',
      new: 'Nuevo',
      sortLabel: 'Ordenar por',
      sortByDistance: 'Distancia',
      sortByRating: 'Mejor puntuados',
      sortByRecent: 'Más recientes',
    },
    language: {
      label: 'Seleccionar idioma',
    },
    mapHero: {
      greeting: 'Hola,',
      question: '¿A dónde vas?',
      searchLabel: 'Buscar puntos',
      searchPlaceholder: 'Buscar aquí',
      locateLabel: 'Localizar mi posición',
      filters: 'Filtros',
      filtersWithCount: (count) => `Filtros (${count})`,
    },
    mapPage: {
      apiOffline: 'API desconectada',
      loading: 'Cargando lugares...',
      resultsCount: (count) => `${count} hallazgo${count === 1 ? '' : 's'}`,
      all: 'Todos',
      savedOnly: 'Guardados',
      openingRoute: (name) => `Abriendo ruta hacia ${name}`,
      emptyOfflineTitle: 'Activa el backend para ver lugares.',
      emptyOfflineText: 'El mapa base funciona, pero la lista se llenará cuando la API esté disponible.',
      emptyFilteredTitle: 'No hay resultados para ese filtro.',
      emptyFilteredText: 'Prueba con otra búsqueda o limpia los filtros activos.',
      emptyNoPointsTitle: 'Aún no hay lugares cargados.',
      emptyNoPointsText: 'Puedes agregar puntos desde el panel admin para empezar a poblar el mapa.',
      locationUnavailable: 'No fue posible obtener tu ubicación',
      noSavedYet: 'Aún no tienes lugares guardados.',
    },
    featured: {
      localSpot: 'Lugar local',
      fromCenter: 'Centro',
      goNow: 'Ir ahora',
    },
    places: {
      noCategory: 'Sin categoría',
      new: 'Nuevo',
      saved: 'Guardado',
    },
    directoryPage: {
      listTitle: 'Directorio Chicama',
      listSubtitle: 'Una vista limpia para explorar lugares, comparar opciones y revisar clics por ruta.',
      savedTitle: 'Tus guardados',
      savedSubtitle: 'Reúne aquí los puntos que quieres visitar, recomendar o revisar después.',
      previewTitle: 'Vista destacada',
      clearFilters: 'Limpiar filtros',
      savedEmptyTitle: 'Aún no guardas lugares.',
      savedEmptyText: 'Pulsa guardar en cualquier punto para construir tu propia lista.',
    },
    bottomNav: {
      ariaLabel: 'Navegación principal',
      map: 'Mapa',
      list: 'Lista',
      saved: 'Guardados',
    },
    adminPage: {
      title: 'Panel Admin',
      apiOffline: 'API desconectada',
      loading: 'Cargando...',
      pointsCount: (count) => `${count} punto(s)`,
      signInToCreate: 'Inicia sesión como admin para crear zonas de interés',
      chooseCoords: 'Haz clic en el mapa para elegir coordenadas',
      locationApplied: 'Ubicación aplicada al formulario',
      locationUnavailable: 'No fue posible obtener tu ubicación',
      mapSectionLabel: 'Mapa para crear zona de interés',
      mapTitle: 'Nueva zona desde mapa',
      mapHint: 'Toca/clic en el mapa para elegir coordenadas',
      addPoint: 'Agregar zona de interés',
      noCategory: 'Sin categoría',
      rating: (value) => `Puntaje: ${value.toFixed(1)}`,
      noRating: 'Sin puntaje',
    },
    adminSheet: {
      access: 'Acceso administrador',
      newPoint: 'Nuevo punto',
      editPoint: 'Editar punto',
      username: 'Usuario',
      password: 'Contraseña',
      login: 'Entrar',
      name: 'Nombre',
      latitude: 'Latitud',
      longitude: 'Longitud',
      useMyLocation: 'Usar mi ubicación',
      ratingLabel: 'Puntaje (0–5)',
      noRating: 'Sin puntaje',
      categories: 'Tipo(s)',
      contact: 'Contacto',
      keywords: 'Palabras de interés',
      keywordsPlaceholder: 'Ej: papel higiénico, agua, snacks, bloqueador',
      keywordsHelp: 'El buscador también encontrará este lugar por estas palabras.',
      description: 'Descripción',
    },
    auth: {
      authError: 'Error de autenticación',
      invalidSession: 'Sesión inválida',
      loginSuccess: 'Sesión iniciada',
      loginError: 'No se pudo iniciar sesión',
    },
    points: {
      created: 'Punto creado correctamente',
      createError: 'No se pudo crear el punto',
      updated: 'Punto actualizado correctamente',
      updateError: 'No se pudo actualizar el punto',
      deleted: 'Punto eliminado correctamente',
      deleteError: 'No se pudo eliminar el punto',
    },
  },
  en: {
    common: {
      close: 'Close',
      refresh: 'Refresh',
      map: 'Map',
      list: 'List',
      save: 'Save',
      saved: 'Saved',
      delete: 'Delete',
      logout: 'Log out',
      searchByNamePlaceholder: 'Search by name...',
      new: 'New',
      sortLabel: 'Sort by',
      sortByDistance: 'Distance',
      sortByRating: 'Top rated',
      sortByRecent: 'Most recent',
    },
    language: {
      label: 'Select language',
    },
    mapHero: {
      greeting: 'Hello,',
      question: 'Where to?',
      searchLabel: 'Search places',
      searchPlaceholder: 'Search here',
      locateLabel: 'Find my location',
      filters: 'Filters',
      filtersWithCount: (count) => `Filters (${count})`,
    },
    mapPage: {
      apiOffline: 'API offline',
      loading: 'Loading places...',
      resultsCount: (count) => `${count} result${count === 1 ? '' : 's'}`,
      all: 'All',
      savedOnly: 'Saved',
      openingRoute: (name) => `Opening route to ${name}`,
      emptyOfflineTitle: 'Start the backend to view places.',
      emptyOfflineText: 'The base map already works, and the list will fill in when the API is available.',
      emptyFilteredTitle: 'No results for that filter.',
      emptyFilteredText: 'Try another search or clear the active filters.',
      emptyNoPointsTitle: 'There are no places yet.',
      emptyNoPointsText: 'You can add points from the admin panel to start populating the map.',
      locationUnavailable: 'Could not get your location',
      noSavedYet: 'You have no saved places yet.',
    },
    featured: {
      localSpot: 'Local spot',
      fromCenter: 'From center',
      goNow: 'Go now',
    },
    places: {
      noCategory: 'No category',
      new: 'New',
      saved: 'Saved',
    },
    directoryPage: {
      listTitle: 'Chicama directory',
      listSubtitle: 'A cleaner browse view for exploring places, comparing options, and tracking clicks by route.',
      savedTitle: 'Saved places',
      savedSubtitle: 'Keep your favorite or must-visit spots together in one calm view.',
      previewTitle: 'Spotlight',
      clearFilters: 'Clear filters',
      savedEmptyTitle: 'You have no saved places yet.',
      savedEmptyText: 'Tap save on any place to start building your personal list.',
    },
    bottomNav: {
      ariaLabel: 'Main navigation',
      map: 'Map',
      list: 'List',
      saved: 'Saved',
    },
    adminPage: {
      title: 'Admin panel',
      apiOffline: 'API offline',
      loading: 'Loading...',
      pointsCount: (count) => `${count} point${count === 1 ? '' : 's'}`,
      signInToCreate: 'Sign in as admin to create points of interest',
      chooseCoords: 'Click on the map to choose coordinates',
      locationApplied: 'Location applied to the form',
      locationUnavailable: 'Could not get your location',
      mapSectionLabel: 'Map to create a point of interest',
      mapTitle: 'New point from map',
      mapHint: 'Tap/click the map to choose coordinates',
      addPoint: 'Add point of interest',
      noCategory: 'No category',
      rating: (value) => `Rating: ${value.toFixed(1)}`,
      noRating: 'No rating',
    },
    adminSheet: {
      access: 'Admin access',
      newPoint: 'New point',
      editPoint: 'Edit point',
      username: 'Username',
      password: 'Password',
      login: 'Sign in',
      name: 'Name',
      latitude: 'Latitude',
      longitude: 'Longitude',
      useMyLocation: 'Use my location',
      ratingLabel: 'Rating (0–5)',
      noRating: 'No rating',
      categories: 'Categories',
      contact: 'Contact',
      keywords: 'Keywords',
      keywordsPlaceholder: 'E.g. water, snacks, sunscreen, wax',
      keywordsHelp: 'Search will also find this place using these words.',
      description: 'Description',
    },
    auth: {
      authError: 'Authentication error',
      invalidSession: 'Invalid session',
      loginSuccess: 'Signed in',
      loginError: 'Could not sign in',
    },
    points: {
      created: 'Point created successfully',
      createError: 'Could not create the point',
      updated: 'Point updated successfully',
      updateError: 'Could not update the point',
      deleted: 'Point deleted successfully',
      deleteError: 'Could not delete the point',
    },
  },
}

function getInitialLanguage(): Language {
  const stored = readStoredString(LANGUAGE_STORAGE_KEY)
  if (stored === 'es' || stored === 'en') return stored

  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) {
    return 'en'
  }

  return 'es'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
    writeStoredString(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => setLanguageState(nextLanguage),
      copy: translations[language],
      categoryLabel: (category) => getCategoryLabel(category, language),
      formatCategories: (categories) => formatCategoriesByLanguage(categories, language),
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

