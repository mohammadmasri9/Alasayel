import { Router } from 'express'
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../controllers/eventController.js'
import { requireAdmin } from '../middleware/admin.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { imagesUpload } from '../middleware/upload.js'

// Anyone can browse events. Only admins can create, edit or delete them.
const router = Router()
const cover = imagesUpload('coverImage', 1)
const adminOnly = [requireAuth, requireAdmin]

router.get('/', optionalAuth, listEvents)
router.get('/:id', optionalAuth, getEvent)
router.post('/', ...adminOnly, ...cover, createEvent)
router.put('/:id', ...adminOnly, ...cover, updateEvent)
router.delete('/:id', ...adminOnly, deleteEvent)

export default router
