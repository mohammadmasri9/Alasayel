import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Production-only Content Security Policy: the browser may only load
// scripts from this site, images from here / Cloudinary, and call our API.
// This blocks most injected-script (XSS) attacks. The API origin comes from
// VITE_API_URL at build time.
function contentSecurityPolicy(apiUrl) {
  let apiOrigin = ''
  try {
    apiOrigin = apiUrl ? new URL(apiUrl).origin : ''
  } catch {
    throw new Error(`VITE_API_URL is not a valid URL: "${apiUrl}"`)
  }
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`,
    'frame-src https://www.google.com', // Google Maps embed on the Contact page
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // On Vercel, a build without the API address would deploy a site that
  // can't reach its backend, so stop with a clear message instead.
  if (process.env.VERCEL && mode === 'production' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables (e.g. https://alasayel-api.onrender.com/api).')
  }

  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_API_URL)],
    server: {
      port: Number(process.env.PORT) || 5173,
      // In development, forward /api requests to the Express backend so the
      // frontend can use relative URLs. In production, set VITE_API_URL.
      proxy: {
        '/api': process.env.API_PROXY_TARGET || 'http://localhost:5000',
        // Locally stored images (only used when Cloudinary isn't configured)
        '/uploads': process.env.API_PROXY_TARGET || 'http://localhost:5000',
      },
    },
  }
})
