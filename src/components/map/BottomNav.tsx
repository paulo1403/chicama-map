import { Heart, List, Map } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useI18n } from '../../i18n/useI18n'
import './BottomNav.css'

type BottomNavProps = {
  savedCount: number
}

export function BottomNav({ savedCount }: BottomNavProps) {
  const { copy } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()

  const isMap = location.pathname === '/'
  const isList = location.pathname.startsWith('/list')
  const isSaved = location.pathname.startsWith('/saved')

  return (
    <nav className="BottomNav" aria-label={copy.bottomNav.ariaLabel}>
      <button
        aria-pressed={isMap}
        className={isMap ? 'BottomNavItem BottomNavItemActive' : 'BottomNavItem'}
        data-nav-target="map"
        onClick={() => navigate('/')}
        type="button"
      >
        <Map aria-hidden="true" className={isMap ? 'BottomNavIcon' : 'BottomNavIcon BottomNavIconMuted'} strokeWidth={1.9} />
        <span>{copy.bottomNav.map}</span>
      </button>
      <button
        aria-pressed={isList}
        className={isList ? 'BottomNavItem BottomNavItemActive' : 'BottomNavItem'}
        data-nav-target="list"
        onClick={() => navigate('/list')}
        type="button"
      >
        <List aria-hidden="true" className={isList ? 'BottomNavIcon' : 'BottomNavIcon BottomNavIconMuted'} strokeWidth={1.9} />
        <span>{copy.bottomNav.list}</span>
      </button>
      <button
        aria-pressed={isSaved}
        className={isSaved ? 'BottomNavItem BottomNavItemActive' : 'BottomNavItem'}
        data-nav-target="saved"
        onClick={() => navigate('/saved')}
        type="button"
      >
        <Heart aria-hidden="true" className={isSaved ? 'BottomNavIcon' : 'BottomNavIcon BottomNavIconMuted'} strokeWidth={1.9} />
        <span className="BottomNavLabelRow">
          <span>{copy.bottomNav.saved}</span>
          {savedCount > 0 ? <span className="BottomNavBadge">{savedCount}</span> : null}
        </span>
      </button>
    </nav>
  )
}