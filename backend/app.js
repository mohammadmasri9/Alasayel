import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { env, isProduction } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimits.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'
import horseRoutes from './routes/horses.js'
import settingsRoutes from './routes/settings.js'
import ticketRoutes from './routes/tickets.js'
import userRoutes from './routes/users.js'
import { UPLOADS_DIR } from './services/cloudinaryService.js'

const app = express()

// Render (and most hosts) sit behind a proxy; needed for correct client IPs
// in the rate limiter.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    // Only the configured frontend origin(s) may call the API from a browser.
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true)
      callback(null, false)
    },
  }),
)
app.use(express.json({ limit: '100kb' }))
app.use('/api', apiLimiter)

// In development the health check also names the database, so it's easy to
// see which one a running server is using. Never shown in production.
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', ...(!isProduction && { db: mongoose.connection.name }) }),
)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/horses', horseRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/users', userRoutes)

// Development-only image storage used when Cloudinary isn't configured
// (see services/cloudinaryService.js).
if (!isProduction) app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1h' }))

app.use(notFound)
app.use(errorHandler)

export default app
