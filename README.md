# Nexura — Full-Stack Next.js E-Commerce Starter

A production-style e-commerce web app with a Next.js (App Router) frontend and a
separate Node/Express backend, PostgreSQL database, and Firebase Authentication
(Email/Password + Google Sign-In).

```
ecommerce-app/
├── frontend/   → Next.js 14 (App Router) + Tailwind CSS
└── backend/    → Node.js + Express + PostgreSQL (pg) + Firebase Admin
```

## Design system

60-30-10 color rule:
- **60% — Ink** `#0F1115` deep charcoal-navy (backgrounds, header/footer, dark sections)
- **30% — Porcelain** `#EEF0F3` cool off-white (cards, product tiles, light sections)
- **10% — Aurora gradient** `#6D5EF5 → #00C2D1` (violet → cyan, used for CTAs, active
  states, gradient text, price highlights) with a warm gold `#F5B942` used sparingly
  for ratings/badges.

Fonts: **Space Grotesk** (display/headings) + **Inter** (body/UI), loaded via `next/font/google`.

---

## 3. Deploying to Render

This repo includes a `render.yaml` **Blueprint** so both services and the database can be
created together, or you can wire each service up manually in the Render dashboard using
the same commands.

### Option A — One-click Blueprint

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo → Render reads `render.yaml`
   and provisions `nexura-db` (Postgres), `nexura-backend`, and `nexura-frontend`.
3. Fill in the env vars marked `sync: false` in the Render dashboard for each service
   (Firebase credentials, `CLIENT_ORIGIN`, `NEXT_PUBLIC_API_URL`, etc. — see below).
4. Deploy. The backend's build command also runs `npm run db:init`, which is safe to run
   on every deploy (it uses `CREATE TABLE IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

### Option B — Manual setup (two separate Web Services)

**Backend** — New → Web Service → connect repo:
| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npm run db:init` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Env vars: `DATABASE_URL` (from your Render/Aiven Postgres), `CLIENT_ORIGIN` (your frontend
URL), `DEV_SECRET`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

**Frontend** — New → Web Service → connect repo:
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Env vars: `NEXT_PUBLIC_API_URL` (your backend's `/api` URL) and the six
`NEXT_PUBLIC_FIREBASE_*` values.

> `npm start` on the frontend runs `next start -p $PORT`, and the backend already reads
> `process.env.PORT` — both bind correctly to the port Render assigns.

Once both services are live, go back and set `CLIENT_ORIGIN` (backend) and
`NEXT_PUBLIC_API_URL` (frontend) to each other's real Render URLs, then redeploy.

---

## 1. Local backend setup

```bash
cd backend
cp .env.example .env      # fill in your real values
npm install
npm run db:init           # runs schema.sql against your Postgres database
npm run dev                # starts on http://localhost:5000
```

### Database (PostgreSQL — Render / Aiven, etc.)

Create a Postgres instance on [Render](https://render.com) or [Aiven](https://aiven.io),
grab the connection string, and put it in `backend/.env` as `DATABASE_URL`.
Example:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

Run `npm run db:init` once to create tables from `src/config/schema.sql`.

### Firebase Admin (backend)

1. Firebase Console → Project Settings → Service Accounts → **Generate new private key**.
2. Paste the three fields into `backend/.env` (`FIREBASE_PROJECT_ID`,
   `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
3. The backend verifies the Firebase ID token sent by the frontend on every
   protected request (see `src/middleware/authMiddleware.js`).

---

## 2. Local frontend setup

```bash
cd frontend
cp .env.local.example .env.local   # fill in your real values
npm install
npm run dev                         # starts on http://localhost:3000
```

### Firebase (frontend)

1. Firebase Console → Add project → Add a Web app.
2. Enable **Authentication → Sign-in method → Email/Password** and **Google**.
3. Copy the web config values into `frontend/.env.local`.

All secrets live in `.env` / `.env.local` files (never committed — see `.gitignore`).

---

## Dev panel (add products, no admin system needed)

There's no payment gateway wired in yet, so for now the fastest way to get products into
the store is the built-in **dev panel** at `/dev` (also linked in the footer):

1. Set `DEV_SECRET` in `backend/.env` to any long random string.
2. Visit `http://localhost:3000/dev`, enter that same key, and add a product
   (name, price, image URL, category, stock, featured flag).
3. It calls `POST /api/products` on the backend with an `x-dev-secret` header —
   this is a shared-secret gate, not real role-based auth. Fine for a solo dev
   or small team; swap for a proper `role` column + admin auth before letting
   other people use it.

## Features included

- Email/password **Signup** (name, email, phone, password) & **Login**, plus
  **"Continue with Google"** (Firebase Auth, Google icon included)
- Firebase ID token verified by the Express backend, user profile upserted into PostgreSQL
- Professional **homepage** with hero, category strip, and a responsive **product grid**
- Reusable **ProductCard** component (image, name, price, rating, wishlist, add-to-cart)
- **Product detail** page, **Cart** page, **Checkout** page (stub), **Orders** page (stub)
- **Profile** page (view/edit name & phone, order history placeholder, sign out)
- Global **AuthContext** wired to Firebase + backend session sync
- Clean 60-30-10 dark/gradient design system, fully responsive, accessible focus states

## Next steps for production

- Add real payment provider (Stripe/Razorpay) in `checkout`
- Add product search/filtering, pagination, and an admin panel for CRUD on products
- Add image upload/storage (Firebase Storage or S3) instead of seeded image URLs
- Add order emails, inventory management, and reviews
