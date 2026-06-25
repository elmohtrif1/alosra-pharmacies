# صيدليات الأسرة — Al-Osra Pharmacy

Full-stack pharmacy website with a public product catalog, ratings system, and a protected admin panel for managing products, categories, ratings, and staff.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- **Auth & Database**: Supabase (PostgreSQL + Supabase Auth)
- **Routing**: Wouter
- **Deployment**: Vercel (frontend + serverless API)

---

## Setup After Extracting

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Set environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon key |
| `SUPABASE_URL` | Same as above (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |
| `VITE_APP_URL` | Your Vercel domain, e.g. `https://yourapp.vercel.app` |

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser — it's only used by the `/api` serverless functions.

### Step 3 — Set up the database

Run `MIGRATION.sql` once in your Supabase SQL Editor (Dashboard → SQL Editor → New query).

Then create your first admin user:

1. Go to **Supabase → Authentication → Users → Add user**
2. Enter the admin email and password
3. Run this SQL to grant admin role:

```sql
UPDATE profiles SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your-admin@email.com';
```

### Step 4 — Run locally

**Frontend only** (no admin user management):
```bash
npm run dev
```

**Frontend + Admin API** (full functionality):
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### Step 5 — Build for production

```bash
npm run build
```

Output goes to `dist/`.

### Step 6 — Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel → Project → Settings → Environment Variables
4. Deploy — Vercel automatically serves `/api` routes as serverless functions

> **Important:** Add your reset-password URL to Supabase's allowed redirect list:
> Supabase → Auth → URL Configuration → Redirect URLs → add `https://yourapp.vercel.app/admin/reset-password`

---

## Project Structure

```
├── api/
│   └── admin/
│       ├── users.js           POST  /api/admin/users
│       └── users/[id].js      DELETE /api/admin/users/:id
├── src/
│   ├── components/            Public-facing UI
│   ├── components/ui/         shadcn/ui component library
│   ├── hooks/                 useAuth, useProducts, etc.
│   ├── lib/                   supabase.ts, utils.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminForgotPassword.tsx
│   │   │   ├── AdminResetPassword.tsx
│   │   │   ├── AdminSettings.tsx       ← change name + password
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminCategories.tsx
│   │   │   ├── AdminStaff.tsx          ← role dropdown
│   │   │   └── AdminRatings.tsx
│   │   └── Products.tsx
│   ├── types/index.ts
│   └── App.tsx
├── public/
├── server.js                  Local Express dev server
├── MIGRATION.sql              Full DB schema + RLS policies + seed data
├── BACKUP.sql
├── ROLLBACK.sql
├── vercel.json
└── .env.example
```

---

## Admin Routes

| URL | Description |
|---|---|
| `/admin/login` | Sign in |
| `/admin/forgot-password` | Request password reset email |
| `/admin/reset-password` | Set new password (from email link) |
| `/admin/dashboard` | Overview stats |
| `/admin/products` | Product management |
| `/admin/categories` | Category management |
| `/admin/ratings` | Ratings moderation |
| `/admin/staff` | Staff management (admin only) |
| `/admin/settings` | Change name + password |
