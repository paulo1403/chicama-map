import { createContext, useContext } from 'react'

import type { CategoryKey } from '../types/map'
import type { Language } from './types'

export type TranslationSet = {
  common: {
    close: string
    refresh: string
    map: string
    list: string
    save: string
    saved: string
    delete: string
    logout: string
    searchByNamePlaceholder: string
    new: string
    sortLabel: string
    sortByDistance: string
    sortByRating: string
    sortByRecent: string
  }
  language: {
    label: string
  }
  mapHero: {
    greeting: string
    question: string
    searchLabel: string
    searchPlaceholder: string
    locateLabel: string
    filters: string
    filtersWithCount: (count: number) => string
  }
  mapPage: {
    apiOffline: string
    loading: string
    resultsCount: (count: number) => string
    all: string
    savedOnly: string
    openingRoute: (name: string) => string
    emptyOfflineTitle: string
    emptyOfflineText: string
    emptyFilteredTitle: string
    emptyFilteredText: string
    emptyNoPointsTitle: string
    emptyNoPointsText: string
    locationUnavailable: string
    noSavedYet: string
  }
  featured: {
    localSpot: string
    fromCenter: string
    goNow: string
  }
  places: {
    noCategory: string
    new: string
    saved: string
  }
  directoryPage: {
    listTitle: string
    listSubtitle: string
    savedTitle: string
    savedSubtitle: string
    previewTitle: string
    clearFilters: string
    savedEmptyTitle: string
    savedEmptyText: string
  }
  bottomNav: {
    ariaLabel: string
    map: string
    list: string
    saved: string
  }
  adminPage: {
    title: string
    apiOffline: string
    loading: string
    pointsCount: (count: number) => string
    signInToCreate: string
    chooseCoords: string
    locationApplied: string
    locationUnavailable: string
    mapSectionLabel: string
    mapTitle: string
    mapHint: string
    addPoint: string
    noCategory: string
    rating: (value: number) => string
    noRating: string
  }
  adminSheet: {
    access: string
    newPoint: string
    editPoint: string
    username: string
    password: string
    login: string
    name: string
    latitude: string
    longitude: string
    useMyLocation: string
    ratingLabel: string
    noRating: string
    categories: string
    contact: string
    keywords: string
    keywordsPlaceholder: string
    keywordsHelp: string
    description: string
  }
  auth: {
    authError: string
    invalidSession: string
    loginSuccess: string
    loginError: string
  }
  points: {
    created: string
    createError: string
    updated: string
    updateError: string
    deleted: string
    deleteError: string
  }
}

export type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  copy: TranslationSet
  categoryLabel: (category: CategoryKey) => string
  formatCategories: (categories: CategoryKey[]) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}
