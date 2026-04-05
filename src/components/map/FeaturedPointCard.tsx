import { Skeleton } from 'boneyard-js/react'

import { useI18n } from '../../i18n/useI18n'
import { DEFAULT_CENTER, distanceInKm, formatDistanceLabel } from '../../utils/location'
import { getPointTone } from '../../utils/point'
import type { MapPoint } from '../../types/map'
import { PointMedia } from './PointMedia'
import './FeaturedPointCard.css'

type FeaturedPointCardProps = {
  point: MapPoint
  saved: boolean
  loading?: boolean
  onToggleSaved: (pointId: string) => void
  onOpenDirections: (point: MapPoint) => void
}

export function FeaturedPointCard({
  point,
  saved,
  loading = false,
  onToggleSaved,
  onOpenDirections,
}: FeaturedPointCardProps) {
  const { copy, formatCategories } = useI18n()

  return (
    <Skeleton name="featured-point-card" loading={loading} color="#e8dcc8">
      <article className={loading ? 'FeatureCard FeatureCardLoading' : 'FeatureCard'} aria-busy={loading}>
        <div className={`FeatureMedia FeatureMedia--${getPointTone(point)}`}>
          <PointMedia point={point} className="FeaturePlaceholder" />
        </div>

        <div className="FeatureBody">
          <div className="FeatureTopRow">
            <div>
              <div className="FeatureTitle">{point.name}</div>
              <div className="FeatureSubtitle">
                {point.categories.length > 0 ? formatCategories(point.categories) : copy.featured.localSpot}
              </div>
            </div>
            <button
              className={saved ? 'SaveButton SaveButtonActive' : 'SaveButton'}
              onClick={() => onToggleSaved(point.id)}
              type="button"
            >
              {saved ? copy.common.saved : copy.common.save}
            </button>
          </div>

          <div className="PointBadges">
            <span className="Badge">
              {copy.featured.fromCenter} {formatDistanceLabel(distanceInKm(point, DEFAULT_CENTER))}
            </span>
            {point.rating > 0 && <span className="Badge">★ {point.rating.toFixed(1)}</span>}
            {point.contact.trim() && <span className="Badge">{point.contact}</span>}
          </div>

          {point.description.trim() && <p className="FeatureDescription">{point.description}</p>}

          <div className="FeatureActions">
            <button
              className="ActionButton ActionButtonPrimary"
              onClick={() => onOpenDirections(point)}
              type="button"
            >
              {copy.featured.goNow}
            </button>
          </div>
        </div>
      </article>
    </Skeleton>
  )
}