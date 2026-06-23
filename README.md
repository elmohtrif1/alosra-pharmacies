# صيدليات الأسرة — Al-Osra Pharmacy

A full-stack pharmacy website with a public product catalog, ratings, and a protected admin panel for managing products, categories, ratings, and staff.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Routing**: Wouter
- **Deployment**: Vercel (frontend + API serverless functions)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd al-osra-pharmacy
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon key |
| `SUPABASE_URL` | Same as above (used server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |

> ⚠️ **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is only used in the `/api` serverless functions.

### 3. Set Up the Database

Run `MIGRATION.sql` in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).

After running the migration, create your first admin user:

1. Go to **Supabase → Authentication → Users → Add user**
2. Enter the admin's email and password
3. Run this SQL to grant admin role:

```sql
UPDATE profiles SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your-admin@email.com';
```

### 4. Run Locally

**Option A — Frontend only** (no admin user management):

```bash
npm run dev
```

**Option B — Frontend + Admin API** (full functionality):

```bash
# Terminal 1: API server
npm run server

# Terminal 2: Vite dev server (proxies /api → localhost:3001)
npm run dev
```

---

## Deployment on Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel → Project → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel automatically handles the `/api` routes as serverless functions

---

## Project Structure

```
├── api/
│   └── admin/
│       ├── users.js        POST /api/admin/users  (create user)
│       └── users/
│           └── [id].js     DELETE /api/admin/users/:id
├── src/
│   ├── components/         Public-facing UI components
│   ├── components/ui/      shadcn/ui component library
│   ├── hooks/              Data-fetching hooks (Supabase)
│   ├── lib/                supabase.ts, utils.ts
│   ├── pages/
│   │   ├── admin/          Admin panel pages (Login, Dashboard, etc.)
│   │   └── Products.tsx
│   ├── types/index.ts
│   └── App.tsx
├── public/                 Static assets (logo, product images)
├── server.js               Local dev Express server (not used on Vercel)
├── MIGRATION.sql           Full DB schema + seed data
├── BACKUP.sql              Pre-migration backup helper
├── ROLLBACK.sql            Undo migration
└── vercel.json             SPA routing + API passthrough
```

---

## Admin Panel

URL: `/admin/login`

| Role | Permissions |
|------|-------------|
| **Admin** | All: products, categories, ratings, staff, add/delete users |
| **Staff** | View products, categories, ratings (read-only on ratings) |

---

## Required SQL

Run `MIGRATION.sql` once after creating your Supabase project. It creates:
- `profiles` table (extends Supabase Auth)
- `categories`, `products`, `product_images` tables
- `orders`, `order_items` tables
- Row Level Security policies
- `handle_new_user()` trigger (auto-creates profile on signup)
- Storage bucket `product-images`
- Seed data (6 categories, 14 products)
