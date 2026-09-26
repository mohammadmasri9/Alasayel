// Horse marketplace: only admins post/edit/delete; everyone browses.
import { png } from './lib.js'

export const seedContent = false // start with no horses

export default async function ({ call, check, login, form, fileStatus }) {
  const A = await login('admin')
  const C = await login('sara')
  const base = { name: 'Bayan', gender: 'mare', price: '15000', currency: 'USD', breed: 'Arabian', age: '6', color: 'Grey', location: 'Jericho', description: 'Calm' }
  const withFile = (fields, buf, type, name) => {
    const f = form(fields)
    f.append('images', new Blob([buf], { type }), name)
    return f
  }

  // --- who may create
  let r = await call('POST', '/horses', { form: form(base, { images: png }) })
  check('create: anonymous -> 401', r.status === 401)
  r = await call('POST', '/horses', { token: C, form: form(base, { images: png }) })
  check('create: customer -> 403', r.status === 403)

  // --- validation
  r = await call('POST', '/horses', { token: A, form: form(base) })
  check('create: no images -> 400', r.status === 400 && r.data.errors?.images)
  r = await call('POST', '/horses', { token: A, form: form({ ...base, name: '', price: 'abc', gender: 'x' }, { images: png }) })
  check('create: invalid fields -> 400 name/price/gender', r.status === 400 && r.data.errors?.name && r.data.errors?.price && r.data.errors?.gender)
  r = await call('POST', '/horses', { token: A, form: form({ name: 'x', price: '1' }, { images: png }) })
  check('create: missing gender -> "مطلوب"', r.data.errors?.gender === 'الجنس مطلوب')
  r = await call('POST', '/horses', { token: A, form: withFile(base, Buffer.from('not an image at all, just text'), 'image/png', 'fake.png') })
  check('upload: text disguised as PNG -> 400', r.status === 400 && r.data.errors?.images)
  r = await call('POST', '/horses', { token: A, form: withFile(base, Buffer.from('%PDF-1.4'), 'application/pdf', 'x.pdf') })
  check('upload: PDF -> 400', r.status === 400)
  r = await call('POST', '/horses', { token: A, form: withFile(base, Buffer.alloc(6 * 1024 * 1024, 0xff), 'image/jpeg', 'big.jpg') })
  check('upload: 6 MB -> 400 size', r.status === 400 && /حجم/.test(r.data.message))
  r = await call('POST', '/horses', { token: A, form: form(base, { images: Array(9).fill(png) }) })
  check('upload: 9 images -> 400', r.status === 400)

  // --- create
  r = await call('POST', '/horses', { token: A, form: form({ ...base, ownerId: '000000000000000000000000' }, { images: [png, png] }) })
  const h1 = r.data.horse
  check('create: admin with 2 images -> 201', r.status === 201 && h1.images.length === 2)
  check('create: ownerId from body ignored', h1.ownerId !== '000000000000000000000000')
  check('create: numbers parsed', h1.price === 15000 && h1.age === 6)
  check('upload: image file served', (await fileStatus(h1.images[0].url)) === 200)
  const h2 = (await call('POST', '/horses', { token: A, form: form({ ...base, name: 'Rimal', gender: 'stallion', price: '8000', currency: 'ILS', breed: 'Thoroughbred', location: 'Ramallah' }, { images: png }) })).data.horse
  const h3 = (await call('POST', '/horses', { token: A, form: form({ ...base, name: 'Hidden', price: '100', status: 'inactive' }, { images: png }) })).data.horse
  check('create: hidden listing', h3.status === 'inactive')

  // --- listing, filters
  r = await call('GET', '/horses')
  const names = r.data.horses.map((h) => h.name)
  check('list: public hides inactive', !names.includes('Hidden') && names.includes('Bayan') && names.includes('Rimal'))
  check('list: no owner details exposed', r.data.horses.every((h) => typeof h.ownerId === 'string'))
  check('list: ?status=inactive ignored for public', !(await call('GET', '/horses?status=inactive')).data.horses.some((h) => h.name === 'Hidden'))
  check('list: customer scope=all ignored', !(await call('GET', '/horses?scope=all', { token: C })).data.horses.some((h) => h.name === 'Hidden'))
  check('list: admin scope=all includes hidden', (await call('GET', '/horses?scope=all', { token: A })).data.horses.some((h) => h.name === 'Hidden'))
  r = await call('GET', '/horses?q=rim')
  check('filter: search', r.data.horses.length === 1 && r.data.horses[0].name === 'Rimal')
  r = await call('GET', '/horses?gender=mare')
  check('filter: gender', r.data.total >= 1 && r.data.horses.every((h) => h.gender === 'mare'))
  r = await call('GET', '/horses?minPrice=1000&maxPrice=9000')
  check('filter: price range', r.data.horses.length === 1 && r.data.horses[0].name === 'Rimal')
  check('filter: location', (await call('GET', '/horses?location=ramal')).data.horses.length === 1)
  r = await call('GET', '/horses?sort=price_asc')
  check('sort: price ascending', r.data.horses[0].price <= r.data.horses.at(-1).price)
  r = await call('GET', '/horses?q=' + encodeURIComponent('.*(a+)+$'))
  check('search: regex characters are literal (no ReDoS)', r.status === 200 && r.data.horses.length === 0)
  r = await call('GET', '/horses?limit=1&page=2')
  check('pagination', r.data.horses.length === 1 && r.data.page === 2 && r.data.pages >= 2)

  // --- details
  r = await call('GET', `/horses/${h1._id}`)
  check('details: public, canManage=false', r.status === 200 && r.data.canManage === false)
  check('details: customer canManage=false', (await call('GET', `/horses/${h1._id}`, { token: C })).data.canManage === false)
  check('details: admin canManage=true', (await call('GET', `/horses/${h1._id}`, { token: A })).data.canManage === true)
  check('details: hidden -> 404 for public', (await call('GET', `/horses/${h3._id}`)).status === 404)
  check('details: hidden -> 404 for customer', (await call('GET', `/horses/${h3._id}`, { token: C })).status === 404)
  check('details: hidden visible to admin', (await call('GET', `/horses/${h3._id}`, { token: A })).status === 200)
  check('details: bad id -> 400', (await call('GET', '/horses/not-an-id')).status === 400)
  check('details: missing -> 404', (await call('GET', '/horses/64b000000000000000000000')).status === 404)

  // --- update
  check('update: customer -> 403', (await call('PUT', `/horses/${h1._id}`, { token: C, json: { price: 1 } })).status === 403)
  r = await call('PUT', `/horses/${h1._id}`, { token: A, json: { price: 16000, status: 'pending' } })
  check('update: partial JSON update', r.status === 200 && r.data.horse.price === 16000 && r.data.horse.status === 'pending' && r.data.horse.name === 'Bayan')
  check('update: invalid status -> 400', (await call('PUT', `/horses/${h1._id}`, { token: A, json: { status: 'bogus' } })).status === 400)
  r = await call('PUT', `/horses/${h1._id}`, { token: A, json: { keepImages: '[]' } })
  check('update: removing every image -> 400', r.status === 400 && r.data.errors?.images)
  const [first, second] = h1.images
  r = await call('PUT', `/horses/${h1._id}`, { token: A, form: form({ keepImages: JSON.stringify([second.publicId, 'someone-elses-id']) }, { images: png }) })
  check('update: keep 2nd + add new; foreign ids ignored', r.status === 200 && r.data.horse.images.length === 2 && r.data.horse.images[0].publicId === second.publicId)
  check('update: removed image file deleted', (await fileStatus(first.url)) === 404)

  // --- delete
  check('delete: customer -> 403', (await call('DELETE', `/horses/${h1._id}`, { token: C })).status === 403)
  const imgs = (await call('GET', `/horses/${h1._id}`, { token: A })).data.horse.images
  check('delete: admin', (await call('DELETE', `/horses/${h1._id}`, { token: A })).status === 200)
  check('delete: image files removed', (await Promise.all(imgs.map((i) => fileStatus(i.url)))).every((s) => s === 404))
  await call('DELETE', `/horses/${h2._id}`, { token: A })
}
