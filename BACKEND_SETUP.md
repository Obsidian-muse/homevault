# HomeVault — Backend Setup

This adds a full production backend (Prisma + PostgreSQL, NextAuth, Cloudinary)
behind the existing HomeVault frontend. Everything the dashboard displays now
comes from real API routes instead of the old static mock data in `lib/data.ts`.

## 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically. If that fails in a
network-restricted environment, run `npm run db:generate` again once you have
normal internet access — `prisma generate` needs to download its query engine
binary the first time.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — a PostgreSQL connection string (Neon, Supabase, RDS, local Postgres, etc.)
- `NEXTAUTH_SECRET` — any long random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000` in dev
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard (only needed for asset image uploads)

## 3. Create the database schema

```bash
npm run db:migrate
```

This creates all tables from `prisma/schema.prisma` (User, Home, Room, Asset,
Warranty, MaintenanceRecord).

## 4. (Optional) Seed demo data

```bash
npm run db:seed
```

Creates a demo user (`alex@homevault.dev` / `password123`) with 3 homes, rooms,
assets, warranties, and maintenance history — the same story the original
mock data told, now backed by real rows you can edit through the UI.

## 5. Run the app

```bash
npm run dev
```

Visit `/register` to create an account (or `/login` with the seeded demo
user), then `/dashboard`.

## What's wired up

- **Auth**: `/login`, `/register`, NextAuth credentials + bcrypt, JWT
  sessions, `proxy.ts` (Next.js 16's renamed `middleware.ts`) protects
  everything under `/dashboard`.
- **Homes / Rooms / Assets / Warranties / Maintenance**: full CRUD via
  `/api/*` routes, all Zod-validated and ownership-checked so a user can only
  ever see or modify their own data.
- **Dashboard**: `/api/dashboard` returns aggregated stats (totals, expiring
  warranties, upcoming maintenance, recent assets) with optimized Prisma
  queries run in parallel.
- **Images**: `POST/DELETE /api/assets/:id/image` uploads/replaces/removes an
  asset photo on Cloudinary and stores `imageUrl` + `imagePublicId`.
- **Profile & account**: `/api/profile` (view/update name & password),
  `/api/account` (delete account — cascades to all owned data).

## API reference

| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Create a user |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth sign-in/out/session |
| GET/POST | `/api/homes` | List / create homes |
| GET/PATCH/DELETE | `/api/homes/:id` | Home detail / update / delete |
| GET/POST | `/api/rooms` | List (`?homeId=`) / create rooms |
| GET/PATCH/DELETE | `/api/rooms/:id` | Room detail / update / delete |
| GET/POST | `/api/assets` | List (`?homeId=&roomId=`) / create assets |
| GET/PATCH/DELETE | `/api/assets/:id` | Asset detail / update / delete |
| POST/DELETE | `/api/assets/:id/image` | Upload/replace or remove asset image |
| GET/POST | `/api/warranties` | List (`?assetId=`) / create warranties |
| GET/PATCH/DELETE | `/api/warranties/:id` | Warranty detail / update / delete |
| GET/POST | `/api/maintenance` | List (`?assetId=&upcoming=true`) / create records |
| GET/PATCH/DELETE | `/api/maintenance/:id` | Record detail / update / delete |
| GET | `/api/dashboard` | Aggregated dashboard stats |
| GET/PATCH | `/api/profile` | Current user profile / update name & password |
| DELETE | `/api/account` | Delete the current user and all owned data |

Every route validates its input with the Zod schemas in `lib/validations.ts`
and checks ownership through `lib/ownership.ts` before touching the database,
so one user's request can never read or modify another user's home, room,
asset, warranty, or maintenance record.
