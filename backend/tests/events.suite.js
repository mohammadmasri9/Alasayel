// Events: admin-only management; public sees published/closed/cancelled.
import { png, ymd } from './lib.js'

export const seedContent = false // start with no events

export default async function ({ call, check, login, form, fileStatus }) {
  const A = await login('admin')
  const C = await login('sara')
  const ev = {
    title: 'بطولة الأصايل لقفز الحواجز',
    description: 'منافسات لعدة فئات',
    date: ymd(10),
    startTime: '16:00',
    endTime: '20:00',
    location: 'ميدان المركز — أريحا',
    ticketPrice: '30',
    currency: 'ILS',
    totalTickets: '200',
    status: 'published',
  }

  // --- permissions + validation
  check('create: anonymous -> 401', (await call('POST', '/events', { form: form(ev) })).status === 401)
  check('create: customer -> 403', (await call('POST', '/events', { token: C, form: form(ev) })).status === 403)
  let r = await call('POST', '/events', { token: A, form: form({ ...ev, title: '', date: '2026-02-30', startTime: '25:00', totalTickets: '-5', status: 'nope' }) })
  check('create: invalid -> 400 title/date/time/tickets/status', r.status === 400 && ['title', 'date', 'startTime', 'totalTickets', 'status'].every((k) => r.data.errors?.[k]), r.data.errors)
  r = await call('POST', '/events', { token: A, form: form({ ...ev, startTime: '20:00', endTime: '19:00' }) })
  check('create: end before start -> 400', r.status === 400 && r.data.errors?.endTime)
  check('create: two covers -> 400', (await call('POST', '/events', { token: A, form: form(ev, { coverImage: [png, png] }) })).status === 400)

  // --- create
  r = await call('POST', '/events', { token: A, form: form({ ...ev, availableTickets: '9999', createdBy: '000000000000000000000000' }, { coverImage: png }) })
  const e1 = r.data.event
  check('create: admin with cover -> 201', r.status === 201 && e1.coverImage?.url)
  check('create: availableTickets = totalTickets (body ignored)', e1.availableTickets === 200)
  check('create: createdBy from body ignored', e1.createdBy !== '000000000000000000000000')
  check('create: date stored as midnight UTC', e1.date === `${ev.date}T00:00:00.000Z`)
  const draft = (await call('POST', '/events', { token: A, form: form({ ...ev, title: 'مسودة', status: 'draft', date: ymd(5) }) })).data.event
  const past = (await call('POST', '/events', { token: A, form: form({ ...ev, title: 'سباق سابق', date: ymd(-20), ticketPrice: '' }) })).data.event
  check('create: empty price = free', past.ticketPrice === 0)
  await call('POST', '/events', { token: A, form: form({ ...ev, title: 'اليوم', date: ymd(0), status: 'cancelled' }) })

  // --- listing
  r = await call('GET', '/events')
  const titles = r.data.events.map((e) => e.title)
  check('list: upcoming excludes drafts and past, includes today', !titles.includes('مسودة') && !titles.includes('سباق سابق') && titles.includes('اليوم') && titles.includes(ev.title), titles)
  check('list: upcoming soonest first', titles[0] === 'اليوم')
  r = await call('GET', '/events?when=past')
  check('list: past', r.data.events.length === 1 && r.data.events[0].title === 'سباق سابق')
  check('list: public cannot filter drafts', !(await call('GET', '/events?status=draft')).data.events.some((e) => e.status === 'draft'))
  check('list: customer scope=all ignored', !(await call('GET', '/events?scope=all&when=all', { token: C })).data.events.some((e) => e.status === 'draft'))
  check('list: admin scope=all sees all 4', (await call('GET', '/events?scope=all&when=all', { token: A })).data.total === 4)
  check('list: search', (await call('GET', '/events?q=' + encodeURIComponent('قفز'))).data.events.length === 1)

  // --- details
  check('details: draft hidden from public', (await call('GET', `/events/${draft._id}`)).status === 404)
  check('details: draft visible to admin', (await call('GET', `/events/${draft._id}`, { token: A })).status === 200)
  check('details: published is public', (await call('GET', `/events/${e1._id}`)).status === 200)

  // --- update
  check('update: customer -> 403', (await call('PUT', `/events/${e1._id}`, { token: C, json: { title: 'x' } })).status === 403)
  r = await call('PUT', `/events/${e1._id}`, { token: A, json: { totalTickets: 150, title: 'بطولة معدّلة' } })
  check('update: capacity -> available follows; date kept', r.data.event.totalTickets === 150 && r.data.event.availableTickets === 150 && r.data.event.date === e1.date)
  r = await call('PUT', `/events/${e1._id}`, { token: A, json: { endTime: '15:00' } })
  check('update: end time before saved start -> 400', r.status === 400 && r.data.errors?.endTime)
  check('update: end time after saved start -> 200', (await call('PUT', `/events/${e1._id}`, { token: A, json: { endTime: '22:00' } })).status === 200)
  const oldCover = e1.coverImage.url
  r = await call('PUT', `/events/${e1._id}`, { token: A, form: form({}, { coverImage: png }) })
  check('update: replace cover', r.status === 200 && r.data.event.coverImage.url !== oldCover)
  check('update: old cover file deleted', (await fileStatus(oldCover)) === 404)
  const cover2 = r.data.event.coverImage.url
  r = await call('PUT', `/events/${e1._id}`, { token: A, json: { removeCover: true } })
  check('update: remove cover', r.data.event.coverImage === null && (await fileStatus(cover2)) === 404)

  // --- delete (events with tickets: see tickets.suite.js)
  check('delete: customer -> 403', (await call('DELETE', `/events/${e1._id}`, { token: C })).status === 403)
  check('delete: admin', (await call('DELETE', `/events/${e1._id}`, { token: A })).status === 200)
  check('delete: gone', (await call('GET', `/events/${e1._id}`)).status === 404)
}
