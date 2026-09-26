import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import User from '../models/User.js'
import { sampleUsers } from '../scripts/sampleData.js'
import { signToken } from '../utils/token.js'

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'public')

// A real small PNG for upload tests
export const png = fs.readFileSync(path.join(PUBLIC_DIR, 'logo.png'))

// "YYYY-MM-DD" n days from today (Palestine time)
export const ymd = (n = 0) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hebron' }).format(new Date(Date.now() + n * 86400000))

// Everything a suite needs: HTTP helpers, assertions, sample logins.
export function makeContext({ origin }) {
  const ctx = {
    origin,
    base: `${origin}/api`,
    passed: 0,
    failed: 0,

    check(name, cond, extra = '') {
      if (cond) {
        ctx.passed++
      } else {
        ctx.failed++
        const detail = typeof extra === 'string' ? extra : JSON.stringify(extra)
        console.log(`  ✗ ${name}${detail ? `  ${detail.slice(0, 400)}` : ''}`)
      }
    },
    fail: (msg) => ctx.check(msg, false),

    // call('POST', '/tickets', { token, json }) or { form: FormData }
    async call(method, urlPath, { token, json, form } = {}) {
      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`
      let body
      if (json !== undefined) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(json)
      } else if (form) body = form
      const res = await fetch(ctx.base + urlPath, { method, headers, body })
      return { status: res.status, headers: res.headers, data: await res.json().catch(() => ({})) }
    },

    // Status of a file served under /uploads (or any origin-relative URL)
    fileStatus: async (url) => (await fetch(origin + url)).status,

    sample: (key) => sampleUsers.find((u) => u.key === key),

    // Log in as a sample user; returns the token (or null)
    async login(key, password) {
      const u = ctx.sample(key)
      const r = await ctx.call('POST', '/auth/login', { json: { email: u.email, password: password ?? u.password } })
      return r.data.token || null
    },

    // Create a user directly in the DB and return a token for it
    async makeUser(name, role = 'customer') {
      const user = await User.create({ name, email: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`, password: 'password123', phone: '0599', role })
      return signToken(user)
    },

    // FormData from { field: value } (+ { fileField: [buffers] })
    form(fields = {}, files = {}) {
      const f = new FormData()
      for (const [k, v] of Object.entries(fields)) f.append(k, typeof v === 'string' ? v : JSON.stringify(v))
      for (const [k, list] of Object.entries(files)) {
        for (const buf of [].concat(list)) f.append(k, new Blob([buf], { type: 'image/png' }), `${k}.png`)
      }
      return f
    },
  }
  return ctx
}
