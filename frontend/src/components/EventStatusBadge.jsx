import { EVENT_STATUSES } from '../utils/event'
import Badge from './Badge'

const tone = { draft: 'gray', published: 'green', closed: 'amber', cancelled: 'red' }

export default function EventStatusBadge({ status, className }) {
  return (
    <Badge tone={tone[status]} className={className}>
      {EVENT_STATUSES[status] || status}
    </Badge>
  )
}
