import 'dotenv/config'

// Fail fast on startup if configuration is missing or unsafe, instead of
// crashing (or running insecurely) later.
function fail(problems) {
  console.error('Invalid configuration:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error('See backend/.env.example (locally) or the Render environment settings.')
  process.exit(1)
}

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key])
if (missing.length) fail(missing.map((k) => `${k} is required`))

const num = (value, fallback) => (Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback)

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list, e.g. "https://alasayel.ps,https://www.alasayel.ps"
  clientUrls: (process.env.CLIENT_URL || (isProd ? '' : 'http://localhost:5173'))
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  // Requests per 15 minutes per IP (auth) / per user (bookings) / per IP (everything)
  rateLimits: {
    auth: num(process.env.RATE_LIMIT_AUTH, 20),
    reserve: num(process.env.RATE_LIMIT_RESERVE, 30),
    api: num(process.env.RATE_LIMIT_API, 1000),
  },
}

export const isProduction = isProd

// Production-only safety checks.
if (isProduction) {
  const problems = []
  const secret = env.jwtSecret
  if (secret.length < 32 || /change-me|demo-only|secret/i.test(secret)) {
    problems.push('JWT_SECRET must be a long random string (32+ characters). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"')
  }
  if (env.clientUrls.length === 0) problems.push('CLIENT_URL must be set to the frontend address, e.g. https://alasayel.vercel.app')
  for (const url of env.clientUrls) {
    if (!url.startsWith('https://')) problems.push(`CLIENT_URL must use https:// in production (got "${url}")`)
  }
  const cloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((k) => !process.env[k])
  if (cloudinary.length) problems.push(`Cloudinary is required in production (missing ${cloudinary.join(', ')})`)
  if (problems.length) fail(problems)
}
