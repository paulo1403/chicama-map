import { Locate, Search } from 'lucide-react'

import { LanguageToggle } from '../feedback/LanguageToggle'
import { useI18n } from '../../i18n/useI18n'
import './MapHero.css'

type MapHeroProps = {
  searchQuery: string
  activeCount: number
  onSearchChange: (value: string) => void
  onToggleFilters: () => void
  onRequestLocate: () => void
}

export function MapHero({ searchQuery, activeCount, onSearchChange, onToggleFilters, onRequestLocate }: MapHeroProps) {
  const { copy } = useI18n()

  return (
    <div className="HeroOverlay">
      <div className="TopBar TopBarAurora">
        <div className="BrandHero" role="banner">
          <div className="BrandGreeting">{copy.mapHero.greeting}</div>
          <div className="BrandQuestion">{copy.mapHero.question}</div>
        </div>

        <LanguageToggle />
      </div>

      <div className="SearchDock">
        <label className="SearchField" aria-label={copy.mapHero.searchLabel}>
          <Search aria-hidden="true" className="SearchIcon" strokeWidth={2} />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={copy.mapHero.searchPlaceholder}
            type="search"
          />
        </label>

        <button className="LocateButton" onClick={onRequestLocate} type="button" aria-label={copy.mapHero.locateLabel}>
          <Locate aria-hidden="true" strokeWidth={2} />
        </button>

        <button className="FilterButton" onClick={onToggleFilters} type="button">
          {activeCount > 0 ? copy.mapHero.filtersWithCount(activeCount) : copy.mapHero.filters}
        </button>
      </div>
    </div>
  )
}