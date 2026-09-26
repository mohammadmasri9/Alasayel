// Registration, login, sessions, profile, password change, and general
// API security (injection attempts, headers, CORS, error format).
export const seedContent = false

export default async function ({ call, check, login, sample, base }) {
  // --- register
  let r = await call('POST', '/auth/register', { json: { name: 'سارة', email: 'New.User@Test.com', password: 'password123', phone: '+970 599 000 000', role: 'admin' } })
  check('register -> 201 with token', r.status === 201 && r.data.token, r.data)
  check('register: role in body ignored (always customer)', r.data.user?.role === 'customer')
  check('register: email lower-cased', r.data.user?.email === 'new.user@test.com')
  check('register: no password in response', !JSON.stringify(r.data).includes('password'))
  r = await call('POST', '/auth/register', { json: { name: 'سارة', email: 'new.user@test.com', password: 'password123' } })
  check('register: duplicate email -> 409', r.status === 409 && r.data.errors?.email)
  r = await call('POST', '/auth/register', { json: { name: 'a', email: 'bad', password: '123' } })
  check('register: invalid -> 400 with field errors', r.status === 400 && r.data.errors?.name && r.data.errors?.email && r.data.errors?.password)

  // --- login
  const admin = sample('admin')
  r = await call('POST', '/auth/login', { json: { email: admin.email, password: 'wrong-password' } })
  const wrongPw = r.data.message
  check('login: wrong password -> 401', r.status === 401)
  r = await call('POST', '/auth/login', { json: { email: 'nobody@test.com', password: 'whatever12' } })
  check('login: unknown email gives the same message (no account probing)', r.status === 401 && r.data.message === wrongPw)
  check('login: deactivated account -> 403', (await call('POST', '/auth/login', { json: { email: sample('blocked').email, password: sample('blocked').password } })).status === 403)
  const A = await login('admin')
  check('login: sample admin works', Boolean(A))

  // --- NoSQL injection attempts must never log anyone in
  for (const [label, body] of [
    ['operator in email', { email: { $gt: '' }, password: admin.password }],
    ['operator in password', { email: admin.email, password: { $gt: '' } }],
    ['regex operator', { email: { $regex: '.*' }, password: { $ne: null } }],
  ]) {
    r = await call('POST', '/auth/login', { json: body })
    check(`injection (${label}) -> rejected`, r.status === 400 || r.status === 401, r.status)
  }
  r = await call('GET', '/horses?status[$ne]=inactive')
  check('query-string operator is not interpreted', r.status === 200 && r.data.horses.every((h) => h.status !== 'inactive'))

  // --- tokens
  check('me: no token -> 401', (await call('GET', '/auth/me')).status === 401)
  check('me: garbage token -> 401', (await call('GET', '/auth/me', { token: 'abc.def.ghi' })).status === 401)
  r = await call('GET', '/auth/me', { token: A })
  check('me: valid token -> user without password fields', r.status === 200 && r.data.user.email === admin.email && !JSON.stringify(r.data).includes('password'))

  // --- profile
  const K = await login('khaled')
  r = await call('PUT', '/auth/me', { token: K, json: { name: 'x', phone: 'abc' } })
  check('profile: invalid -> 400', r.status === 400 && r.data.errors?.name && r.data.errors?.phone)
  r = await call('PUT', '/auth/me', { token: K, json: { name: 'خالد المعدَّل', phone: '+970 599 999 000', role: 'admin', email: 'hack@x.com', isActive: false } })
  check('profile: name + phone saved', r.status === 200 && r.data.user.name === 'خالد المعدَّل' && r.data.user.phone === '+970 599 999 000')
  check('profile: role / email / isActive cannot be changed', r.data.user.role === 'customer' && r.data.user.email === sample('khaled').email && r.data.user.isActive === true)

  // --- password change logs out other sessions
  await new Promise((res) => setTimeout(res, 1100)) // tokens are per-second; make K strictly older
  const pw = sample('khaled').password
  check('password: wrong current -> 400', (await call('PUT', '/auth/password', { token: K, json: { currentPassword: 'nope-nope', newPassword: 'NewPass@123' } })).status === 400)
  check('password: too short -> 400', (await call('PUT', '/auth/password', { token: K, json: { currentPassword: pw, newPassword: 'short' } })).status === 400)
  check('password: same as current -> 400', (await call('PUT', '/auth/password', { token: K, json: { currentPassword: pw, newPassword: pw } })).status === 400)
  r = await call('PUT', '/auth/password', { token: K, json: { currentPassword: pw, newPassword: 'NewPass@123' } })
  check('password: changed -> fresh token', r.status === 200 && r.data.token)
  check('password: fresh token works', (await call('GET', '/auth/me', { token: r.data.token })).status === 200)
  check('password: older sessions logged out', (await call('GET', '/auth/me', { token: K })).status === 401)
  check('password: old password refused', !(await login('khaled')))
  check('password: new password works', Boolean(await login('khaled', 'NewPass@123')))

  // --- general API hardening
  const res = await fetch(`${base}/health`)
  check('security headers (helmet)', res.headers.get('x-content-type-options') === 'nosniff' && !res.headers.get('x-powered-by'))
  const evil = await fetch(`${base}/health`, { headers: { Origin: 'https://evil.example.com' } })
  check('CORS: unknown origin not allowed', !evil.headers.get('access-control-allow-origin'))
  const good = await fetch(`${base}/health`, { headers: { Origin: 'http://localhost:5173' } })
  check('CORS: configured origin allowed', good.headers.get('access-control-allow-origin') === 'http://localhost:5173')
  r = await call('GET', '/does-not-exist')
  check('unknown route -> JSON 404', r.status === 404 && r.data.message)
  const bad = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' })
  check('malformed JSON -> 400', bad.status === 400)
  const big = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.c', password: 'x'.repeat(200_000) }) })
  check('oversized body -> 413', big.status === 413, big.status)
}
