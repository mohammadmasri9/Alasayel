// API test runner:  npm test            (all suites)
//                   npm test -- tickets (only suites whose name contains "tickets")
//
// Starts the real Express app on a random port against a temporary
// in-memory MongoDB. It can never touch Atlas or a server you have running,
// and every suite starts from a freshly wiped + re-seeded database.
import { once } from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

const here = path.dirname(fileURLToPath(import.meta.url))
const filter = process.argv[2]

// --- environment, set BEFORE the app's config is loaded (dotenv never
// overrides variables that already exist, even empty ones).
const mongo = await MongoMemoryServer.create()
const uploadsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'alasayel-test-uploads-'))
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URI: mongo.getUri('alasayel-test'),
  JWT_SECRET: 'test-only-jwt-key-0123456789abcdef0123456789abcdef',
  CLIENT_URL: 'http://localhost:5173',
  UPLOADS_DIR: uploadsDir,
  // Never upload test images to a real Cloudinary account
  CLOUDINARY_CLOUD_NAME: '',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  // The suites log in far more often than a person would
  RATE_LIMIT_AUTH: '100000',
  RATE_LIMIT_API: '100000',
  RATE_LIMIT_RESERVE: '100000',
})

const quiet = async (fn) => {
  const log = console.log
  console.log = () => {}
  try {
    return await fn()
  } finally {
    console.log = log
  }
}

const { default: mongoose } = await import('mongoose')
const { default: app } = await import('../app.js')
const { seed } = await import('../scripts/seed.js')
const { makeContext } = await import('./lib.js')

await quiet(() => mongoose.connect(process.env.MONGODB_URI))
const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const origin = `http://127.0.0.1:${server.address().port}`

const files = (await fs.readdir(here)).filter((f) => f.endsWith('.suite.js') && (!filter || f.includes(filter))).sort()
let totalPass = 0
let totalFail = 0

for (const file of files) {
  const suite = await import(pathToFileURL(path.join(here, file)).href)
  // Fresh database for every suite
  await mongoose.connection.dropDatabase()
  await quiet(() => seed({ content: suite.seedContent !== false }))

  const ctx = makeContext({ origin })
  console.log(`\n▶ ${file}`)
  try {
    await suite.default(ctx)
  } catch (err) {
    ctx.fail(`suite crashed: ${err.stack || err}`)
  }
  console.log(`  ${ctx.passed} passed, ${ctx.failed} failed`)
  totalPass += ctx.passed
  totalFail += ctx.failed
}

console.log(`\n${totalFail ? '✗' : '✓'} ${totalPass} passed, ${totalFail} failed (${files.length} suites)`)

server.close()
await mongoose.disconnect()
await mongo.stop()
await fs.rm(uploadsDir, { recursive: true, force: true })
process.exit(totalFail ? 1 : 0)
