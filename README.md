# مركز الأصايل للفروسية — Al-Asayel Equestrian Center

Equestrian marketplace and event-ticketing platform.

| Folder      | Stack                                          |
| ----------- | ---------------------------------------------- |
| `frontend/` | React 19 + Vite + Tailwind CSS 4, React Router |
| `backend/`  | Node.js + Express 5 + MongoDB (Mongoose) + JWT |

## Status

- [x] **Milestone 1**: project structure, MongoDB connection, authentication (register / login / current user), JWT + bcrypt, admin role middleware, AuthContext, ProtectedRoute, Login / Register / Profile pages, protected admin page
- [x] **Milestone 2**: horse marketplace: listings with up to 8 photos, search / filters / sorting / pagination, admin horse management, Cloudinary uploads
- [x] **Milestone 3**: events: admin create / edit / publish / close / cancel, cover image, capacity, public upcoming & past lists, event pages, real events on Home and Championships
- [x] **Milestone 4**: ticket reservation: atomic seat booking (no overselling), unique ticket codes, printable ticket page, My tickets, customer cancel of unpaid bookings, admin ticket management (confirm payment, check in, cancel), payment-service abstraction
- [x] **Milestone 5**: website settings (CMS): logo, home hero and about texts/images, events banner, contact details, opening hours, map, social links; editable from the admin panel with no redeploy
- [x] **Milestone 6**: admin dashboard (statistics, revenue, event occupancy, recent activity), user management (roles, deactivate), profile editing and password change
- [ ] **Milestone 7**: security review, mobile/tablet check, automated tests, CI and deployment config are done. Deploying is next: see **[DEPLOYMENT.md](DEPLOYMENT.md)**

**Only admins post content.** Customers browse horses and events and reserve event tickets; horse enquiries go to the center's WhatsApp / phone.

## Requirements

- Node.js 20.6 or newer
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or MongoDB running locally

## Local setup

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # then edit .env: set MONGODB_URI and JWT_SECRET
npm run dev               # http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

In development the frontend calls `/api/...` and Vite forwards those requests to the backend on port 5000, so there are no CORS issues locally.

### Sample data for testing

```bash
cd backend
npm run seed             # sample users + horses, events, tickets (content only if the DB has none)
npm run seed -- --reset  # delete ALL horses/events/tickets first, then add the samples
npm run demo             # no database needed: temporary in-memory DB with the samples
```

The sample logins (an admin, customers with and without tickets, and a deactivated account) and what each one is for are listed in [`backend/scripts/sampleData.js`](backend/scripts/sampleData.js). Seeding is refused when `NODE_ENV=production`. Don't use the sample accounts on the live site.

### Tests

```bash
cd backend
npm test               # all API suites (216 checks)
npm test -- tickets    # only suites whose name contains "tickets"
```

The tests start the real API on a random port with a temporary in-memory database, so they never touch Atlas or a server you have running. They also run on GitHub for every push (`.github/workflows/ci.yml`).

### Creating an admin

Public registration always creates **customer** accounts. To create an admin, or promote an existing user:

```bash
cd backend
npm run create-admin -- --email admin@example.com --name "Admin" --password "a-strong-password"
```

## Environment variables

**backend/.env**

| Variable         | Required | Description                                            |
| ---------------- | -------- | ------------------------------------------------------ |
| `MONGODB_URI`    | yes      | MongoDB connection string                              |
| `JWT_SECRET`     | yes      | Long random string used to sign tokens                 |
| `PORT`           | no       | Default `5000`                                         |
| `NODE_ENV`       | no       | `production` hides internal error messages             |
| `JWT_EXPIRES_IN` | no       | Default `7d`                                           |
| `CLIENT_URL`     | no       | Allowed frontend origin(s), comma-separated, for CORS  |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | in production | Image storage. If empty in development, images are saved to `backend/uploads/` instead |
| `CLOUDINARY_FOLDER` | no    | Media-library root folder, default `alasayel`          |
| `RATE_LIMIT_AUTH` / `RATE_LIMIT_RESERVE` / `RATE_LIMIT_API` | no | Requests per 15 min (defaults 20 / 30 / 1000) |

**frontend** (production only)

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `VITE_API_URL` | **Required.** Backend API base URL, e.g. `https://alasayel-api.onrender.com/api`. Also used in the Content Security Policy |

## API

| Method | Endpoint             | Access        | Purpose                          |
| ------ | -------------------- | ------------- | -------------------------------- |
| GET    | `/api/health`        | public        | Health check                     |
| POST   | `/api/auth/register` | public        | Create a customer account → JWT  |
| POST   | `/api/auth/login`    | public        | Log in → JWT                     |
| GET    | `/api/auth/me`       | logged in     | Current user                     |
| PUT    | `/api/auth/me`       | logged in     | Update my `{ name, phone }` |
| PUT    | `/api/auth/password` | logged in     | `{ currentPassword, newPassword }`. Logs out every other session; returns a fresh token |
| GET    | `/api/admin/stats`   | admin         | Dashboard numbers: users, horses, events, tickets, revenue per currency, next events' occupancy, recent activity |
| GET    | `/api/users`         | admin         | Users with booking counts. Query: `q, role, status (active / inactive), page, limit` |
| PUT    | `/api/users/:id`     | admin         | `{ role?, isActive? }`. You can't change your own account; the last active admin can't be removed. Takes effect on the user's open sessions immediately |
| GET    | `/api/settings`      | public        | Website content (defaults filled in) |
| PUT    | `/api/settings`      | admin         | Update content. `multipart/form-data`: text fields, `socialLinks` / `openingHours` as JSON, images `logo, heroImage, aboutImage, eventBanner`, `resetImages` (JSON list) |
| GET    | `/api/horses`        | public        | List. Query: `q, breed, gender, location, minPrice, maxPrice, currency, status, sort (newest, price_asc, price_desc), page, limit`. Admins can add `scope=all` to include hidden listings |
| GET    | `/api/horses/:id`    | public        | Details. Hidden listings: admin only |
| POST   | `/api/horses`        | admin         | Create. `multipart/form-data`: fields + 1–8 `images` |
| PUT    | `/api/horses/:id`    | admin         | Update. JSON or multipart. `keepImages` = JSON array of publicIds to keep; new `images` are appended |
| DELETE | `/api/horses/:id`    | admin         | Delete listing and its images    |
| GET    | `/api/events`        | public        | List. Query: `when (upcoming default, past, all), status, q, page, limit`. Upcoming = today or later (Palestine time), soonest first. Admins can add `scope=all` to include drafts |
| GET    | `/api/events/:id`    | public        | Details. Drafts: admin only |
| POST   | `/api/events`        | admin         | Create. `multipart/form-data`: fields + optional `coverImage`. `availableTickets` starts equal to `totalTickets` |
| PUT    | `/api/events/:id`    | admin         | Update. JSON or multipart. New `coverImage` replaces the old one; `removeCover=true` removes it. Capacity can't drop below tickets already reserved |
| DELETE | `/api/events/:id`    | admin         | Delete event and its cover. Refused (409) while it has active tickets: cancel the event instead |
| POST   | `/api/tickets`       | logged in     | Reserve `{ eventId, quantity }` (1–10). Seats are taken atomically; 409 if closed / past / sold out. Paid events start `reserved` (pay at the center), free events `confirmed`. 30 per 15 min per user |
| GET    | `/api/tickets/my`    | logged in     | My tickets, with event details |
| GET    | `/api/tickets/:id`   | owner / admin | Ticket details (404 for other people's tickets) |
| PUT    | `/api/tickets/:id/cancel` | owner     | Cancel my **unpaid** (`reserved`) booking before the event; seats go back on sale |
| GET    | `/api/tickets`       | admin         | All tickets. Query: `eventId, status, q (code / customer name, email, phone), page, limit`. Includes seat totals per status |
| PUT    | `/api/tickets/:id/status` | admin     | `{ status }`: reserved → confirmed (paid) → used (checked in); cancelled returns the seats and is final |

Ticket statuses: `reserved` (booked, unpaid), `confirmed` (paid or free), `used` (checked in), `cancelled`. An event with 0 tickets is open entry (no booking). Payments go through `backend/services/paymentService.js`; today only the manual "pay at the center" provider exists.

Event statuses: `draft` (hidden), `published`, `closed` (visible, booking closed), `cancelled` (visible, marked cancelled). Dates are stored as midnight UTC of the event day.

Images: JPG / PNG / WEBP, max 5 MB each, checked by file type **and** file contents. Old images are deleted from storage only after the listing is saved.

Protected endpoints expect `Authorization: Bearer <token>`. Errors are JSON `{ message, errors? }` with `401` (not logged in), `403` (no permission), `400` (validation), `409` (duplicate email). Login and register are rate-limited to 20 requests per 15 minutes per IP.
