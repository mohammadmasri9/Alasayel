// Ticket reservations: atomic seats, ownership, statuses, admin tools.
import { ymd } from './lib.js'

export const seedContent = false // this suite creates its own events

export default async function ({ call, check, login, makeUser, form, sample }) {
  const A = await login('admin')
  const C1 = await makeUser('c1')
  const C2 = await makeUser('c2')
  const crowd = await Promise.all(Array.from({ length: 20 }, (_, i) => makeUser(`crowd${i}`)))

  const makeEvent = async (fields) => {
    const r = await call('POST', '/events', { token: A, form: form({ title: 'E', date: ymd(7), totalTickets: '50', ticketPrice: '30', status: 'published', ...fields }) })
    if (!r.data.event) throw new Error('event create failed: ' + JSON.stringify(r.data))
    return r.data.event
  }
  const seats = async (id) => (await call('GET', `/events/${id}`, { token: A })).data.event.availableTickets
  const reserve = (token, eventId, quantity) => call('POST', '/tickets', { token, json: { eventId, quantity } })

  const paid = await makeEvent({ title: 'Paid', totalTickets: '10' })
  const free = await makeEvent({ title: 'Free', ticketPrice: '0' })

  // --- validation and bookability
  check('reserve: anonymous -> 401', (await call('POST', '/tickets', { json: { eventId: paid._id, quantity: 1 } })).status === 401)
  for (const q of [0, 11, 2.5, 'abc', -1, { $gt: 0 }]) {
    const r = await reserve(C1, paid._id, q)
    check(`reserve: quantity ${JSON.stringify(q)} -> 400`, r.status === 400 && r.data.errors?.quantity)
  }
  check('reserve: bad event id -> 400', (await reserve(C1, 'nope', 1)).status === 400)
  check('reserve: event id as operator -> 400', (await reserve(C1, { $ne: null }, 1)).status === 400)
  check('reserve: missing event -> 404', (await reserve(C1, '64b000000000000000000000', 1)).status === 404)
  for (const [fields, code, label] of [
    [{ status: 'draft' }, 404, 'draft'],
    [{ status: 'closed' }, 409, 'closed'],
    [{ status: 'cancelled' }, 409, 'cancelled'],
    [{ date: ymd(-3) }, 409, 'past'],
    [{ totalTickets: '0' }, 409, 'open entry (0 tickets)'],
  ]) {
    const e = await makeEvent({ title: label, ...fields })
    check(`reserve: ${label} -> ${code}`, (await reserve(C1, e._id, 1)).status === code)
  }

  // --- paid booking
  let r = await call('POST', '/tickets', { token: C1, json: { eventId: paid._id, quantity: 3, userId: '64b000000000000000000000', totalPrice: 0, status: 'used' } })
  const t1 = r.data.ticket
  check('reserve: 3 paid tickets -> 201', r.status === 201)
  check('reserve: paid starts "reserved" with instructions', t1.status === 'reserved' && r.data.instructions)
  check('reserve: price computed server-side; body fields ignored', t1.totalPrice === 90 && t1.unitPrice === 30 && t1.quantity === 3)
  check('reserve: ticket code format', /^ASL-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/.test(t1.ticketCode), t1.ticketCode)
  check('reserve: seats 10 -> 7', (await seats(paid._id)) === 7)
  r = await reserve(C2, paid._id, 8)
  check('reserve: more than left -> 409 naming what is left', r.status === 409 && /7/.test(r.data.message))
  check('reserve: failed attempt keeps seats', (await seats(paid._id)) === 7)

  r = await reserve(C2, free._id, 2)
  check('reserve: free event confirmed immediately', r.status === 201 && r.data.ticket.status === 'confirmed' && r.data.ticket.totalPrice === 0 && !r.data.instructions)
  const tFree = r.data.ticket

  await call('PUT', `/events/${paid._id}`, { token: A, json: { ticketPrice: 50 } })
  check('price change later keeps the booked price', (await call('GET', `/tickets/${t1._id}`, { token: C1 })).data.ticket.totalPrice === 90)

  // --- concurrency: 20 customers race for the last 5 seats
  const race = await makeEvent({ title: 'Race', totalTickets: '5' })
  const results = await Promise.all(crowd.map((tok) => reserve(tok, race._id, 1)))
  const ok = results.filter((x) => x.status === 201).length
  check(`race: exactly 5 of 20 succeed (got ${ok})`, ok === 5 && results.filter((x) => x.status === 409).length === 15)
  check('race: seats end at 0, never negative', (await seats(race._id)) === 0)
  check('race: exactly 5 tickets stored', (await call('GET', `/tickets?eventId=${race._id}`, { token: A })).data.total === 5)
  r = await reserve(C1, race._id, 1)
  check('race: sold-out message', r.status === 409 && r.data.message === 'نفدت جميع التذاكر')

  // --- privacy
  r = await call('GET', '/tickets/my', { token: C1 })
  check('my tickets: only mine', r.data.tickets.length === 1 && r.data.tickets[0]._id === t1._id)
  check('my tickets: login required', (await call('GET', '/tickets/my')).status === 401)
  check("someone else's ticket -> 404 (not 403)", (await call('GET', `/tickets/${t1._id}`, { token: C2 })).status === 404)
  check('admin sees any ticket with customer info', (await call('GET', `/tickets/${t1._id}`, { token: A })).data.ticket.userId?.email)

  // --- admin list
  check('admin list: customer -> 403', (await call('GET', '/tickets', { token: C1 })).status === 403)
  r = await call('GET', `/tickets?eventId=${paid._id}`, { token: A })
  check('admin list: by event with seat summary', r.data.total === 1 && r.data.summary.reserved.seats === 3)
  check('admin list: search by code', (await call('GET', `/tickets?q=${t1.ticketCode.slice(4)}`, { token: A })).data.tickets[0]?._id === t1._id)
  check('admin list: search by customer name', (await call('GET', '/tickets?q=c2-', { token: A })).data.tickets.some((t) => t._id === tFree._id))

  // --- statuses
  check('status: customer -> 403', (await call('PUT', `/tickets/${t1._id}/status`, { token: C1, json: { status: 'confirmed' } })).status === 403)
  check('status: invalid -> 400', (await call('PUT', `/tickets/${t1._id}/status`, { token: A, json: { status: 'bogus' } })).status === 400)
  check('status: confirm payment', (await call('PUT', `/tickets/${t1._id}/status`, { token: A, json: { status: 'confirmed' } })).data.ticket?.status === 'confirmed')
  check('status: confirming does not change seats', (await seats(paid._id)) === 7)

  // --- customer cancel
  check('cancel: paid ticket cannot be self-cancelled', (await call('PUT', `/tickets/${t1._id}/cancel`, { token: C1 })).status === 409)
  const t2 = (await reserve(C1, paid._id, 2)).data.ticket
  check('cancel: seats 7 -> 5', (await seats(paid._id)) === 5)
  check("cancel: someone else's -> 404", (await call('PUT', `/tickets/${t2._id}/cancel`, { token: C2 })).status === 404)
  const [a, b] = await Promise.all([call('PUT', `/tickets/${t2._id}/cancel`, { token: C1 }), call('PUT', `/tickets/${t2._id}/cancel`, { token: C1 })])
  check('cancel: double click -> exactly one succeeds', [a.status, b.status].sort().join() === '200,409')
  check('cancel: seats returned once (5 -> 7)', (await seats(paid._id)) === 7)

  // --- admin cancel / check-in
  check('check-in (used)', (await call('PUT', `/tickets/${t1._id}/status`, { token: A, json: { status: 'used' } })).data.ticket?.status === 'used')
  r = await call('PUT', `/tickets/${t1._id}/status`, { token: A, json: { status: 'cancelled' } })
  check('admin cancel returns seats (7 -> 10)', r.data.ticket?.status === 'cancelled' && (await seats(paid._id)) === 10)
  check('cancelled is final', (await call('PUT', `/tickets/${t1._id}/status`, { token: A, json: { status: 'confirmed' } })).status === 409)

  // --- capacity + deletion rules
  r = await call('PUT', `/events/${race._id}`, { token: A, json: { totalTickets: 3 } })
  check('capacity below sold seats -> 400', r.status === 400 && r.data.errors?.totalTickets)
  check('capacity raised 5 -> 8 leaves 3', (await call('PUT', `/events/${race._id}`, { token: A, json: { totalTickets: 8 } })).data.event?.availableTickets === 3)
  check('delete event with active tickets -> 409', (await call('DELETE', `/events/${race._id}`, { token: A })).status === 409)
  check('delete event with only cancelled tickets -> 200', (await call('DELETE', `/events/${paid._id}`, { token: A })).status === 200)
  check('...and its cancelled tickets are removed', (await call('GET', `/tickets/${t2._id}`, { token: A })).status === 404)

  // --- a deactivated customer's session stops working immediately
  const saraToken = await login('sara')
  const users = (await call('GET', '/users?q=' + encodeURIComponent(sample('sara').email), { token: A })).data.users
  await call('PUT', `/users/${users[0]._id}`, { token: A, json: { isActive: false } })
  check('deactivated user cannot reserve', (await reserve(saraToken, free._id, 1)).status === 401)
}
