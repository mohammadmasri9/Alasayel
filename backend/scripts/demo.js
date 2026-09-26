// Demo mode: run the API against a temporary in-memory MongoDB filled with
// sample data. Nothing needs to be installed or configured, and everything
// is thrown away when you stop it (Ctrl+C).
//
//   npm run demo
//
// Sample logins: see scripts/sampleData.js
import { MongoMemoryServer } from 'mongodb-memory-server'

if (process.env.NODE_ENV === 'production') {
  console.error('Demo mode is for local testing only.')
  process.exit(1)
}

console.log('Starting temporary database (the first run downloads MongoDB, ~1 minute)…')
const mongo = await MongoMemoryServer.create()

// Must be set before the app's config is loaded (dotenv never overrides
// variables that already exist, so .env's MONGODB_URI is ignored here).
process.env.MONGODB_URI = mongo.getUri('alasayel-demo')
process.env.JWT_SECRET ||= 'demo-only-secret-not-for-production'

await import('../server.js') // connects and starts listening
const { seed } = await import('./seed.js')
await seed()
console.log('\nDemo ready. Sample logins are listed in backend/scripts/sampleData.js')

async function shutdown() {
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
