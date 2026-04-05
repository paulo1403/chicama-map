import { BedDouble, ShoppingBag, Store, UtensilsCrossed, Waves } from 'lucide-react'

import type { MapPoint, PointTone } from '../../types/map'
import { getPointTone } from '../../utils/point'

type PointMediaProps = {
  point: MapPoint
  className: string
}

const toneIcons: Record<PointTone, typeof Waves> = {
  food: UtensilsCrossed,
  shop: Store,
  stay: BedDouble,
  surf: Waves,
  local: ShoppingBag,
}

export function PointMedia({ point, className }: PointMediaProps) {
  const tone = getPointTone(point)
  const Icon = toneIcons[tone]

  return (
    <div className={className} aria-hidden="true">
      <Icon className="PointMediaIcon" strokeWidth={2} />
    </div>
  )
}