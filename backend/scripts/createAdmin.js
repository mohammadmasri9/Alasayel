// Create an admin account, or promote an existing user to admin.
//
//   npm run create-admin -- --email admin@example.com --name "Admin" --password "S3cure-pass"
//
// If the email already exists, the user is promoted to admin (and the
// password is updated only if --password is given).
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

const email = arg('email')?.toLowerCase().trim()
const name = arg('name') || 'Administrator'
const password = arg('password')

if (!email) {
  console.error('Usage: npm run create-admin -- --email <email> [--name <name>] --password <password>')
  process.exit(1)
}

await connectDB()

try {
  let user = await User.findOne({ email })
  if (user) {
    user.role = 'admin'
    user.isActive = true
    if (password) user.password = password
    await user.save()
    console.log(`Promoted existing user ${email} to admin.`)
  } else {
    if (!password || password.length < 8) {
      console.error('A --password of at least 8 characters is required for a new admin.')
      process.exitCode = 1
    } else {
      user = await User.create({ name, email, password, role: 'admin' })
      console.log(`Created admin ${email}.`)
    }
  }
} finally {
  await mongoose.disconnect()
}
