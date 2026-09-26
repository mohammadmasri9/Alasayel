// Thin wrapper around fetch for talking to the Express API.
// Dev: requests go to /api and Vite proxies them to localhost:5000.
// Production: set VITE_API_URL, e.g. https://api.alasayel.ps/api

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'alasayel_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors || {} // field -> message, for form validation
  }
}

// `body` may be a plain object (sent as JSON) or FormData (file uploads;
// the browser sets the multipart Content-Type itself).
export async function request(path, { method = 'GET', body, headers } = {}) {
  const token = tokenStore.get()
  const isForm = body instanceof FormData
  let res
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: {
        ...(body !== undefined && !isForm && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.message || 'حدث خطأ غير متوقع', data.errors)
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword }),
}

// Removes empty values so URLs stay clean: { q: '', page: 2 } -> "?page=2"
export function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

export const horsesApi = {
  list: (params) => api.get('/horses' + toQuery(params)),
  get: (id) => api.get(`/horses/${id}`),
  create: (formData) => api.post('/horses', formData),
  update: (id, body) => api.put(`/horses/${id}`, body), // FormData or plain object
  remove: (id) => api.del(`/horses/${id}`),
}

export const eventsApi = {
  list: (params) => api.get('/events' + toQuery(params)),
  get: (id) => api.get(`/events/${id}`),
  create: (formData) => api.post('/events', formData),
  update: (id, body) => api.put(`/events/${id}`, body), // FormData or plain object
  remove: (id) => api.del(`/events/${id}`),
}

export const ticketsApi = {
  reserve: (eventId, quantity) => api.post('/tickets', { eventId, quantity }),
  mine: () => api.get('/tickets/my'),
  get: (id) => api.get(`/tickets/${id}`),
  cancel: (id) => api.put(`/tickets/${id}/cancel`),
  // admin
  list: (params) => api.get('/tickets' + toQuery(params)),
  setStatus: (id, status) => api.put(`/tickets/${id}/status`, { status }),
}

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (formData) => api.put('/settings', formData), // admin
}

export const adminApi = {
  stats: () => api.get('/admin/stats'),
}

export const usersApi = {
  list: (params) => api.get('/users' + toQuery(params)),
  update: (id, changes) => api.put(`/users/${id}`, changes), // { role?, isActive? }
}
