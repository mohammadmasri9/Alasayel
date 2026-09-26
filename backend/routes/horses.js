import { Router } from 'express'
import {
  createHorse,
  deleteHorse,
  getHorse,
  listHorses,
  updateHorse,
} from '../controllers/horseController.js'
import { requireAdmin } from '../middleware/admin.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { imagesUpload } from '../middleware/upload.js'
import { MAX_HORSE_IMAGES } from '../models/Horse.js'

// Anyone can browse. Only admins (the center) can post, edit or delete.
const router = Router()
const images = imagesUpload('images', MAX_HORSE_IMAGES)
const adminOnly = [requireAuth, requireAdmin]

router.get('/', optionalAuth, listHorses)
router.get('/:id', optionalAuth, getHorse)
router.post('/', ...adminOnly, ...images, createHorse)
router.put('/:id', ...adminOnly, ...images, updateHorse)
router.delete('/:id', ...adminOnly, deleteHorse)

export default router
