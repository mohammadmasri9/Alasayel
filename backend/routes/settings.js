import { Router } from 'express'
import { IMAGE_FIELDS } from '../config/defaultSettings.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { requireAdmin } from '../middleware/admin.js'
import { requireAuth } from '../middleware/auth.js'
import { imageFieldsUpload } from '../middleware/upload.js'

const router = Router()

router.get('/', getSettings)
router.put('/', requireAuth, requireAdmin, ...imageFieldsUpload(IMAGE_FIELDS), updateSettings)

export default router
