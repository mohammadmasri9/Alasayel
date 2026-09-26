// Fill the database with sample users, horses, events and tickets for
// local testing. See scripts/sampleData.js for the accounts.
//
//   npm run seed            users + content (content only if the DB has none)
//   npm run seed -- --reset delete ALL horses, events and tickets first
//
// Sample users are always (re)created with their sample passwords.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import mongoose from 'mongoose'
import { isProduction } from '../config/env.js'
import Event from '../models/Event.js'
import Horse from '../models/Horse.js'
import Ticket from '../models/Ticket.js'
import User from '../models/User.js'
import { deleteImages, uploadImage } from '../services/cloudinaryService.js'
import { generateTicketCode } from '../utils/ticketCode.js'
import { sampleEvents, sampleHorses, sampleTickets, sampleUsers } from './sampleData.js'

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'public')

async function sampleImage(fileName, folder) {
  const buffer = await fs.readFile(path.join(PUBLIC_DIR, fileName))
  return uploadImage({ buffer, mimetype: 'image/png' }, folder)
}

// content: false -> sample users only (used by some test suites).
export async function seed({ reset = false, content = true } = {}) {
  if (isProduction) throw new Error('Refusing to seed sample data with NODE_ENV=production.')

  // --- users
  const users = {}
  for (const u of sampleUsers) {
    let user = await User.findOne({ email: u.email }).select('+password')
    if (!user) user = new User({ email: u.email })
    user.set({ name: u.name, phone: u.phone, role: u.role, isActive: u.isActive ?? true, password: u.password })
    await user.save()
    users[u.key] = user
  }
  console.log(`Sample users ready: ${sampleUsers.map((u) => u.email).join(', ')}`)
  if (!content) return

  if (reset) {
    const [horses, events] = await Promise.all([Horse.find(), Event.find()])
    await deleteImages([...horses.flatMap((h) => h.images), ...events.map((e) => e.coverImage).filter(Boolean)])
    await Promise.all([Horse.deleteMany({}), Event.deleteMany({}), Ticket.deleteMany({})])
    console.log('Removed existing horses, events and tickets.')
  }

  if ((await Horse.estimatedDocumentCount()) + (await Event.estimatedDocumentCount()) > 0) {
    console.log('Horses/events already exist: skipping sample content (use --reset to replace it).')
    return
  }

  // --- horses
  for (const { images, ...h } of sampleHorses) {
    const uploaded = []
    for (const img of images) uploaded.push(await sampleImage(img, 'horses'))
    await Horse.create({ ...h, images: uploaded, ownerId: users.admin._id })
  }

  // --- events
  const events = {}
  for (const { key, cover, ...e } of sampleEvents) {
    const coverImage = cover ? await sampleImage(cover, 'events') : null
    events[key] = await Event.create({ ...e, coverImage, availableTickets: e.totalTickets, createdBy: users.admin._id })
  }

  // --- tickets (seats taken from each event like a real booking)
  for (const [userKey, eventKey, quantity, status] of sampleTickets) {
    const event = events[eventKey]
    await Ticket.create({
      eventId: event._id,
      userId: users[userKey]._id,
      quantity,
      unitPrice: event.ticketPrice,
      totalPrice: event.ticketPrice * quantity,
      currency: event.currency,
      ticketCode: generateTicketCode(),
      status,
    })
    await Event.updateOne({ _id: event._id }, { $inc: { availableTickets: -quantity } })
  }

  console.log(`Sample content: ${sampleHorses.length} horses, ${sampleEvents.length} events, ${sampleTickets.length} tickets.`)
}

// Run directly: `npm run seed`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { connectDB } = await import('../config/db.js')
  await connectDB()
  try {
    await seed({ reset: process.argv.includes('--reset') })
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
