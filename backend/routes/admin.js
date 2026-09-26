import { Router } from 'express'
import { getStats } from '../controllers/statsController.js'
import { requireAdmin } from '../middleware/admin.js'
import { requireAuth } from '../middleware/auth.js'

// Every route in this file is admin-only.
const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/stats', getStats)

export default router
