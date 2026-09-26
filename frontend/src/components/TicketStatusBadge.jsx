import { TICKET_STATUSES_SHORT } from '../utils/ticket'
import Badge from './Badge'

const tone = { reserved: 'amber', confirmed: 'green', used: 'gray', cancelled: 'red' }

export default function TicketStatusBadge({ status, className }) {
  return (
    <Badge tone={tone[status]} className={className}>
      {TICKET_STATUSES_SHORT[status] || status}
    </Badge>
  )
}
