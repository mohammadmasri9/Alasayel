// Admin dashboard statistics and user management (uses the sample data).
import { sampleTickets } from '../scripts/sampleData.js'

export default async function ({ call, check, login, sample }) {
  const A = await login('admin')
  const S = await login('sara')
  const K = await login('khaled')

  // --- stats
  check('stats: anonymous -> 401', (await call('GET', '/admin/stats')).status === 401)
  check('stats: customer -> 403', (await call('GET', '/admin/stats', { token: S })).status === 403)
  const r0 = await call('GET', '/admin/stats', { token: A })
  const st = r0.data
  check('stats: admin -> 200', r0.status === 200)
  check('stats: users (1 admin, 4 customers, 1 inactive)', st.users.total === 5 && st.users.admins === 1 && st.users.customers === 4 && st.users.inactive === 1, st.users)
  check('stats: horses by status', st.horses.total === 4 && st.horses.available === 2 && st.horses.pending === 1 && st.horses.sold === 1, st.horses)
  check('stats: events (upcoming excludes draft and past)', st.events.upcoming === 5 && st.events.drafts === 1 && st.events.past === 1, st.events)
  const seats = sampleTickets.reduce((n, t) => n + t[2], 0)
  check(`stats: ticket seats add up to ${seats}`, Object.values(st.tickets).reduce((n, t) => n + t.seats, 0) === seats)
  check('stats: revenue paid = 550 ILS', st.revenue.paid.length === 1 && st.revenue.paid[0].amount === 550 && st.revenue.paid[0].currency === 'ILS', st.revenue)
  check('stats: awaiting payment = 90 ILS', st.revenue.awaitingPayment[0]?.amount === 90, st.revenue)
  check('stats: next events are bookable, soonest first', st.nextEvents.length === 4 && st.nextEvents.every((e, i, a) => e.totalTickets > 0 && (i === 0 || e.date >= a[i - 1].date)))
  check('stats: activity newest first, max 12', st.activity.length <= 12 && st.activity.every((a, i, arr) => i === 0 || new Date(a.at) <= new Date(arr[i - 1].at)))
  check('stats: activity never exposes emails', !JSON.stringify(st.activity).includes('@'))

  // --- user list
  check('users: customer -> 403', (await call('GET', '/users', { token: S })).status === 403)
  let r = await call('GET', '/users', { token: A })
  check('users: admin sees all 5, no password fields', r.data.total === 5 && !JSON.stringify(r.data).includes('password'))
  const khaled = r.data.users.find((u) => u.email === sample('khaled').email)
  check('users: booking counts', khaled.bookings === 3 && khaled.seats === 16, khaled)
  check('users: search', (await call('GET', '/users?q=sara', { token: A })).data.total === 1)
  check('users: filter inactive', (await call('GET', '/users?status=inactive', { token: A })).data.users[0]?.email === sample('blocked').email)
  const id = (key) => r.data.users.find((u) => u.email === sample(key).email)._id
  const adminId = id('admin')

  // --- safety rules
  check('customer cannot promote self -> 403', (await call('PUT', `/users/${id('sara')}`, { token: S, json: { role: 'admin' } })).status === 403)
  check('admin cannot demote self', (await call('PUT', `/users/${adminId}`, { token: A, json: { role: 'customer' } })).status === 400)
  check('admin cannot deactivate self', (await call('PUT', `/users/${adminId}`, { token: A, json: { isActive: false } })).status === 400)
  check('invalid role -> 400', (await call('PUT', `/users/${id('sara')}`, { token: A, json: { role: 'boss' } })).status === 400)
  check('invalid isActive -> 400', (await call('PUT', `/users/${id('sara')}`, { token: A, json: { isActive: 'no' } })).status === 400)
  check('no changes -> 400', (await call('PUT', `/users/${id('sara')}`, { token: A, json: {} })).status === 400)

  // --- deactivate / reactivate
  check('deactivate', (await call('PUT', `/users/${id('khaled')}`, { token: A, json: { isActive: false } })).data.user?.isActive === false)
  check("deactivated user's open session stops working", (await call('GET', '/tickets/my', { token: K })).status === 401)
  check('deactivated user cannot log in', !(await login('khaled')))
  await call('PUT', `/users/${id('khaled')}`, { token: A, json: { isActive: true } })
  check('reactivated user can log in', Boolean(await login('khaled')))

  // --- roles apply to open sessions immediately
  check('promote to admin', (await call('PUT', `/users/${id('sara')}`, { token: A, json: { role: 'admin' } })).data.user?.role === 'admin')
  check('promotion effective on existing token', (await call('GET', '/admin/stats', { token: S })).status === 200)
  check('another admin can disable the original admin', (await call('PUT', `/users/${adminId}`, { token: S, json: { isActive: false } })).status === 200)
  check("disabled admin's token refused", (await call('GET', '/admin/stats', { token: A })).status === 401)
  check('the only active admin still cannot demote self', (await call('PUT', `/users/${id('sara')}`, { token: S, json: { role: 'customer' } })).status === 400)
  await call('PUT', `/users/${adminId}`, { token: S, json: { isActive: true } })
  check('demote back to customer', (await call('PUT', `/users/${id('sara')}`, { token: A, json: { role: 'customer' } })).data.user?.role === 'customer')
  check('demotion effective on existing token', (await call('GET', '/admin/stats', { token: S })).status === 403)
}
