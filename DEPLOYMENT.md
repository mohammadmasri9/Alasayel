# Deployment guide

```
Browser ──► Vercel (frontend, React)  ──►  Render (backend API, Express)
                                               ├── MongoDB Atlas (data)
                                               └── Cloudinary   (images)
```

Do the steps in order. Each one lists what to copy for the next.
Free plans work for all four services (see "Costs" at the end).

---

## 1. MongoDB Atlas: production database

Use a **separate database** from development, so test data never reaches the live site.

1. Atlas → **Database Access** → **Add New Database User**
   - Username: e.g. `alasayel_prod`
   - Password: **Autogenerate** (long, random). Save it in your password manager.
   - Role: **Read and write to any database**
2. Atlas → **Network Access** → **Add IP Address**
   - Best: add Render's outbound IPs (Render → your service → **Connect** → **Outbound**, after step 3).
   - Simplest: `0.0.0.0/0` (allow from anywhere). Acceptable only with a strong password.
3. Atlas → **Database** → **Connect** → **Drivers** → copy the connection string, then:
   - replace `<password>` with the new user's password
   - add the database name **`alasayel`** after `.net/`:
   `mongodb+srv://alasayel_prod:PASSWORD@cluster0.xxxx.mongodb.net/alasayel?retryWrites=true&w=majority`

> Also rotate the development user's password (it was shared in chat) and update `backend/.env`.

**Copy for later:** `MONGODB_URI` (production).

## 2. Cloudinary: image storage

1. Sign up at <https://cloudinary.com> (free plan).
2. Dashboard → **Settings → API Keys**. Copy **Cloud name**, **API key**, **API secret**.

**Copy for later:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
Never put these in the frontend or in git.

## 3. Render: backend API

The code must be on GitHub first. It is on the **`feature/platform`** branch (`main` still has the old static site). Either merge it into `main` first (recommended: open a pull request on GitHub), or pick `feature/platform` as the branch in Render and Vercel.

1. <https://render.com> → sign in with GitHub.
2. **New → Blueprint** → select the `Alasayel` repository and the branch (`main` after merging, otherwise `feature/platform`). Render reads `render.yaml`.
3. Fill in the values it asks for:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | from step 1 |
   | `CLIENT_URL` | leave `https://example.com` for now; you set it in step 5 |
   | `CLOUDINARY_*` | from step 2 |

   `JWT_SECRET` is generated automatically. `NODE_ENV=production` is already set.
4. **Apply**. After the build, open `https://<your-service>.onrender.com/api/health`. It should show `{"status":"ok"}`.

If it doesn't start, open **Logs**: the server prints exactly which setting is missing or unsafe.

**Copy for later:** the API address, e.g. `https://alasayel-api.onrender.com`.

## 4. Vercel: frontend

1. <https://vercel.com> → sign in with GitHub → **Add New → Project** → import `Alasayel`.
2. **Root Directory:** `frontend` (click Edit). If you did not merge into `main`: after importing, go to **Settings → Git → Production Branch** and set `feature/platform`. Framework: **Vite** (detected automatically).
3. **Environment Variables:**

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://alasayel-api.onrender.com/api` (your API address from step 3 **+ `/api`**) |

4. **Deploy**. The build stops with a clear message if `VITE_API_URL` is missing.

**Copy for later:** the site address, e.g. `https://alasayel.vercel.app`.

## 5. Connect them

1. Render → service → **Environment** → set `CLIENT_URL` to the Vercel address from step 4
   (no trailing slash; several addresses separated by commas are allowed).
2. **Save**. Render redeploys automatically.

The API only accepts browser requests from `CLIENT_URL`, so until this is set the site shows its built-in content and nothing can be booked.

## 6. Create the real admin account

Run this **on your computer** from the project folder. It connects to the production database only for this command.

PowerShell:
```powershell
cd backend
$env:MONGODB_URI = "PASTE-PRODUCTION-URI"; npm run create-admin -- --email you@example.com --name "Your name" --password "A-long-unique-password"; Remove-Item Env:MONGODB_URI
```

Git Bash / macOS / Linux:
```bash
cd backend
MONGODB_URI="PASTE-PRODUCTION-URI" npm run create-admin -- --email you@example.com --name "Your name" --password "A-long-unique-password"
```

Never run `npm run seed` or `npm run demo` against production. The sample accounts have public passwords.

## 7. Test the live site

- [ ] Home page loads with texts and photos. `/events` and `/horses` load.
- [ ] Register a customer account; log out; log in again.
- [ ] Log in as admin → **لوحة التحكم** (dashboard) opens. As the customer, `/admin` shows **غير مصرّح لك** (not authorised).
- [ ] Admin: add a horse with 2 photos. The photos come from `res.cloudinary.com`.
- [ ] Admin: create a published event with a cover image and a few tickets.
- [ ] Customer: reserve tickets. Admin → **التذاكر** (tickets) → **تأكيد الدفع** (confirm payment) → **تسجيل الدخول** (check in).
- [ ] Admin → **إعدادات الموقع** (website settings): change the home title and photo. Reload the home page in a private window to see the change.
- [ ] Refresh the browser on a deep link like `/events/<id>`. It must not 404.

## 8. Custom domain (optional, when ready)

1. Vercel → project → **Settings → Domains** → add `alasayel.ps` and `www.alasayel.ps`, and follow the DNS instructions. HTTPS is automatic.
2. Render → service → **Settings → Custom Domains** → add `api.alasayel.ps`, and add the CNAME it shows. HTTPS is automatic.
3. Update both sides and redeploy:
   - Render `CLIENT_URL` = `https://alasayel.ps,https://www.alasayel.ps`
   - Vercel `VITE_API_URL` = `https://api.alasayel.ps/api` → **Redeploy** (the address is built into the site).

---

## Updating the site later

Push to the deployed branch. GitHub Actions runs the checks (lint, build, 216 API tests). Vercel and Render redeploy automatically.

## Costs

| Service | Free plan | Note |
|---|---|---|
| Vercel | Hobby | Fine for this site |
| Render | Free | **Sleeps after 15 min idle**: the first visit after that takes ~30–60 s to wake the API. The site shows its built-in content meanwhile. **Starter (~$7/month)** removes this; recommended once the site is public. |
| MongoDB Atlas | M0 (512 MB) | Plenty for thousands of horses, events and tickets |
| Cloudinary | Free (25 credits/month) | Plenty for a site this size |

## Security checklist (already built in)

- Passwords hashed with bcrypt. Never returned by the API.
- Every protected endpoint checks the login token **and** the role on the server.
- The server refuses to start in production with a weak `JWT_SECRET`, a non-https `CLIENT_URL`, or no Cloudinary.
- CORS allows only `CLIENT_URL`. Security headers via Helmet (API) and `vercel.json` (site).
- Content Security Policy: the site only runs its own scripts and only talks to its own API.
- Rate limits on login, registration, password changes, bookings, and the whole API.
- Uploads: JPG / PNG / WEBP only, checked by file contents, 5 MB max.
- Deactivating a user or changing a password takes effect on open sessions immediately.
- Secrets live only in Render / `.env` (git-ignored). The frontend holds none.
