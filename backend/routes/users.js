import { Router } from 'express'
import { listUsers, updateUser } from '../controllers/userController.js'
import { requireAdmin } from '../middleware/admin.js'
import { requireAuth } from '../middleware/auth.js'

// Admin user management. (Users edit their own profile via /api/auth/me.)
const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/', listUsers)
router.put('/:id', updateUser)

export default router
