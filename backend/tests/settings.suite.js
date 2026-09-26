// Website settings (CMS): public read, admin-only write, image handling.
import { png } from './lib.js'

export default async function ({ call, check, login, form, fileStatus }) {
  const A = await login('admin')
  const C = await login('sara')
  const get = async () => (await call('GET', '/settings')).data.settings

  // --- defaults
  let r = await call('GET', '/settings')
  let s = r.data.settings
  check('public read works without login', r.status === 200)
  check('no-cache header (changes show immediately)', r.headers.get('cache-control') === 'no-cache')
  check('defaults = original site content', s.siteName === 'مركز الأصايل للفروسية' && s.heroTitle === 'مركز الأصايل')
  check('default images flagged', s.logo.url === '/logo.png' && s.logo.isDefault && s.eventBanner.url === null)

  // --- permissions
  check('update: anonymous -> 401', (await call('PUT', '/settings', { form: form({ heroTitle: 'x' }) })).status === 401)
  check('update: customer -> 403', (await call('PUT', '/settings', { token: C, form: form({ heroTitle: 'x' }) })).status === 403)

  // --- validation (incl. script URLs in links)
  r = await call('PUT', '/settings', {
    token: A,
    form: form({
      siteName: '',
      heroDescription: 'x'.repeat(601),
      contactEmail: 'bad',
      whatsappNumber: '0599 123 456',
      mapEmbedUrl: 'https://evil.com/maps/embed',
      mapLinkUrl: 'javascript:alert(1)',
      socialLinks: { facebook: 'javascript:alert(1)', instagram: '', youtube: '', tiktok: '' },
    }),
  })
  check(
    'invalid values -> 400 per field (incl. javascript: links)',
    r.status === 400 && ['siteName', 'heroDescription', 'contactEmail', 'whatsappNumber', 'mapEmbedUrl', 'mapLinkUrl', 'socialLinks.facebook'].every((k) => r.data.errors?.[k]),
    r.data.errors,
  )
  check('fake image -> 400', (await call('PUT', '/settings', { token: A, form: form({}, { logo: Buffer.from('not an image') }) })).status === 400)
  check('failed updates change nothing', (await get()).siteName === 'مركز الأصايل للفروسية')

  // --- partial text update
  r = await call('PUT', '/settings', {
    token: A,
    form: form({
      heroTitle: 'عنوان جديد',
      socialLinks: { facebook: 'https://facebook.com/new', instagram: '', youtube: 'https://youtube.com/@alasayel', tiktok: '' },
      openingHours: [{ day: 'يوميًا', time: '9 — 5' }, { day: '', time: '' }],
      mapEmbedUrl: '<iframe src="https://www.google.com/maps/embed?pb=!1m18&amp;x=1" width="600"></iframe>',
    }),
  })
  s = r.data.settings
  check('update: saved', r.status === 200 && s.heroTitle === 'عنوان جديد')
  check('update: untouched fields keep defaults', s.siteName === 'مركز الأصايل للفروسية' && s.aboutTitle === 'الأصايل… أكثر من مجرد')
  check('update: empty social link hides it', s.socialLinks.instagram === '' && s.socialLinks.youtube.includes('youtube.com'))
  check('update: empty opening-hours rows dropped', s.openingHours.length === 1)
  check('update: pasted <iframe> -> embed URL extracted', s.mapEmbedUrl === 'https://www.google.com/maps/embed?pb=!1m18&x=1')
  check('update: public sees it immediately', (await get()).heroTitle === 'عنوان جديد')

  // --- images
  r = await call('PUT', '/settings', { token: A, form: form({}, { heroImage: png, eventBanner: png }) })
  const hero1 = r.data.settings.heroImage.url
  check('images: upload hero + banner', !r.data.settings.heroImage.isDefault && r.data.settings.eventBanner.url && (await fileStatus(hero1)) === 200)
  check('images: others untouched', r.data.settings.logo.isDefault)
  r = await call('PUT', '/settings', { token: A, form: form({}, { heroImage: png }) })
  check('images: replace deletes the old file', r.data.settings.heroImage.url !== hero1 && (await fileStatus(hero1)) === 404)
  const hero2 = r.data.settings.heroImage.url
  const banner = r.data.settings.eventBanner.url
  r = await call('PUT', '/settings', { token: A, form: form({ resetImages: ['heroImage', 'eventBanner'] }) })
  s = r.data.settings
  check('images: reset to defaults', s.heroImage.isDefault && s.heroImage.url === '/PortraitLogoPresenting.png' && s.eventBanner.url === null)
  check('images: reset deletes uploaded files', (await fileStatus(hero2)) === 404 && (await fileStatus(banner)) === 404)
  check('images: text kept', s.heroTitle === 'عنوان جديد')
}
