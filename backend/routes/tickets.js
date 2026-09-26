import { Router } from 'express'
import {
  cancelMyTicket,
  getTicket,
  listTickets,
  myTickets,
  reserveTickets,
  updateTicketStatus,
} from '../controllers/ticketController.js'
import { requireAdmin } from '../middleware/admin.js'
import { requireAuth } from '../middleware/auth.js'
import { reserveLimiter } from '../middleware/rateLimits.js'

const router = Router()

router.use(requireAuth) // every ticket endpoint needs a logged-in user

router.post('/', reserveLimiter, reserveTickets)
router.get('/my', myTickets) // must come before /:id
router.get('/', requireAdmin, listTickets)
router.get('/:id', getTicket)
router.put('/:id/cancel', cancelMyTicket)
router.put('/:id/status', requireAdmin, updateTicketStatus)

export default router
