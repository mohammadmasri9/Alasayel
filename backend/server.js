import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import app from './app.js'

try {
  await connectDB()
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message)
  process.exit(1)
}

// `exclusive` stops a second server from silently sharing the port
// (possible on Windows), which would send requests to the wrong database.
const server = app.listen({ port: env.port, exclusive: true }, () => {
  console.log(`API listening on http://localhost:${env.port}`)
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use: another API server is probably still running. Stop it first.`)
  } else {
    console.error(err)
  }
  process.exit(1)
})
