import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const WINDOW = 15 * 60 * 1000
const common = { windowMs: WINDOW, standardHeaders: 'draft-8', legacyHeaders: false }

// Everything under /api, per IP: stops scripts from hammering the server.
export const apiLimiter = rateLimit({
  ...common,
  limit: env.rateLimits.api,
  message: { message: 'طلبات كثيرة، يرجى المحاولة بعد قليل' },
})

// Login / register / password change, per IP: slows down password guessing.
export const authLimiter = rateLimit({
  ...common,
  limit: env.rateLimits.auth,
  message: { message: 'محاولات كثيرة، يرجى المحاولة بعد قليل' },
})

// Ticket reservations, per user (not IP, so people sharing a network
// aren't blocked): stops one account from grabbing all seats.
export const reserveLimiter = rateLimit({
  ...common,
  limit: env.rateLimits.reserve,
  keyGenerator: (req) => req.user._id.toString(),
  message: { message: 'محاولات حجز كثيرة، يرجى المحاولة بعد قليل' },
})
