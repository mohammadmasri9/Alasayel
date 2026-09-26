import { Router } from 'express'
import { changePassword, login, me, register, updateMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimits.js'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', requireAuth, me)
router.put('/me', requireAuth, updateMe)
router.put('/password', requireAuth, authLimiter, changePassword)

export default router
