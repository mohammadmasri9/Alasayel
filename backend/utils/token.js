import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// The token carries only the user id. Role and active status are read
// from the database on every request, so demoting or disabling a user
// takes effect immediately instead of when their token expires.
export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret)
}
