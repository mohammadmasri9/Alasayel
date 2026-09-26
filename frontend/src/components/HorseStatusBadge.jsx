import { STATUSES } from '../utils/horse'
import Badge from './Badge'

const tone = { available: 'green', pending: 'amber', sold: 'red', inactive: 'gray' }

export default function HorseStatusBadge({ status, className }) {
  return (
    <Badge tone={tone[status]} className={className}>
      {STATUSES[status] || status}
    </Badge>
  )
}
