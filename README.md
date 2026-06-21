# صيدليات الأسرة — Pharmacy CMS

A full-stack pharmacy e-commerce CMS built with React + Vite + Supabase.

---

## Quick Reference

| Item | Value |
|------|-------|
| Admin login | `https://f0f5033a-e224-41aa-95c6-323065ae1af1-00-6rowy0n7389t.worf.replit.dev/admin/login` |
| Public site | `https://f0f5033a-e224-41aa-95c6-323065ae1af1-00-6rowy0n7389t.worf.replit.dev/` |
| Products page | `https://f0f5033a-e224-41aa-95c6-323065ae1af1-00-6rowy0n7389t.worf.replit.dev/products` |
| Supabase project | `https://mxydtlgbmsxrpshauhhj.supabase.co` |
| Supabase dashboard | `https://supabase.com/dashboard/project/mxydtlgbmsxrpshauhhj` |

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- **Routing**: Wouter
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email + password)
- **Storage**: Supabase Storage (product images)
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## Database Schema (6 tables)

| Table | Purpose |
|-------|---------|
| `categories` | Product categories with sort order |
| `products` | Full product catalog (SKU, stock, pharmacy fields, SEO) |
| `product_images` | Multi-image gallery per product |
| `profiles` | Admin/staff user roles (extends Supabase Auth) |
| `orders` | Order schema (ready for checkout — not yet wired to UI) |
| `order_items` | Order line items |
| `product_ratings` | Existing ratings table (unchanged, RLS added) |

All tables have Row Level Security (RLS). Public users can only read active products and submit ratings. Admins and staff have full CRUD access.

---

## Migration Files

| File | Purpose |
|------|---------|
| `BACKUP.sql` | Run FIRST — backs up product_ratings to a snapshot table |
| `MIGRATION.sql` | Creates all tables, seeds 14 products, enables RLS |
| `ROLLBACK.sql` | Completely undoes the migration (safe, ratings preserved) |

---

## Setup Instructions

### Step 1 — Back up existing data (takes 5 seconds)

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/mxydtlgbmsxrpshauhhj/sql)
2. Paste the contents of `BACKUP.sql`
3. Run it
4. Confirm the output shows: `✅ Backup matches live table`

### Step 2 — Run the migration

1. Still in the SQL Editor
2. Paste the contents of `MIGRATION.sql`
3. Run it
4. You should see no errors — all statements are idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)

### Step 3 — Enable email/password authentication

1. Go to Supabase → Authentication → Providers
2. Enable **Email** provider
3. (Optional) Disable email confirmation for faster testing

### Step 4 — Create your admin account

Since your Supabase account already exists, the auto-trigger won't fire retroactively. Run this in the SQL Editor immediately after the migration:

```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin'
FROM auth.users
WHERE email = '3mar.osama.11@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      email = EXCLUDED.email;

-- Verify:
SELECT id, email, role FROM profiles WHERE email = '3mar.osama.11@gmail.com';
```

Expected result: one row with `role = 'admin'`.

### Step 5 — Log in

Navigate to `https://YOUR-DOMAIN/admin/login` and enter your credentials.

### Step 6 — Invite staff

- Go to Supabase → Authentication → Users → Add User
- Enter their email and a temporary password
- Their profile is auto-created with `role = 'staff'`
- To promote to admin: `UPDATE profiles SET role = 'admin' WHERE email = 'staff@example.com';`

---

## Admin Dashboard Features

### `/admin/dashboard`
- Total products count
- Active products count
- Featured products count
- Total ratings count
- Last 5 ratings with reviewer name and score

### `/admin/products`
- Full product table (name, SKU, category, price, stock, active status)
- Search by name or SKU
- Filter by category
- Edit and delete buttons
- Low stock highlighted in red (< 10 units)

### `/admin/products/new` and `/admin/products/:id`
- Add or edit a product
- All fields: name, SKU, brand, category, price, unit, badge
- Pharmacy-specific: prescription required, manufacturer, active ingredient, dosage form, package size
- Description and features (bullet points)
- Multiple image upload (first = primary)
- Stock quantity and visibility toggles
- SEO meta title and description

### `/admin/categories`
- Add, rename, delete categories inline
- Categories appear as filter pills on the public products page

### `/admin/staff`
- View all admin and staff accounts
- Promote/demote between admin and staff roles
- Remove staff accounts (admin only)

### `/admin/ratings`
- View all product ratings
- Search by reviewer name or comment
- Delete abusive ratings

---

## Product Image Storage

- Bucket: `product-images` (public read)
- Path format: `{productId}/{timestamp}-{filename}`
- Uploads via admin dashboard → stored in Supabase Storage → public URL saved in `product_images` table
- Products 1 and 14 seed with local placeholder paths (`/products-only-curly-shampoo.png`, `/products-glamy-lab-hydra-cream.png`) — these are real images already on the site. Replace via the edit screen when ready.

---

## How the Public Site Loads Products

```
Page loads → useProducts() hook fires → Supabase query runs →
  ✅ Success → shows live database products
  ❌ Error   → falls back to 14 hardcoded products (safe fallback)
```

After the migration, the query always succeeds and live database products are shown. The fallback is never triggered.

New products added via the admin dashboard appear on the public site immediately on the next page load — no code changes, no redeployment.

---

## Product Rating Continuity

The existing `product_ratings` table is not modified (no columns added or removed). The migration only adds RLS policies. All 14 seeded products use the same IDs (1–14) as the old hardcoded products, so every existing rating remains linked to the correct product.

---

## Rollback Instructions

If anything goes wrong, run `ROLLBACK.sql` in the SQL Editor. It:

1. Drops all 6 new tables
2. Removes all helper functions and triggers
3. Disables RLS on `product_ratings` and removes the 3 policies added
4. Optionally restores `product_ratings` from the pre-migration backup

After rollback, the database is exactly as it was before.

---

## Environment Variables

Set in Replit Secrets (already configured):

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public (anon) key |

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @workspace/al-osra-pharmacy run dev

# Typecheck
pnpm --filter @workspace/al-osra-pharmacy run typecheck
```

---

## Remaining Manual Steps After Migration

1. ✅ Run `BACKUP.sql`
2. ✅ Run `MIGRATION.sql`
3. ✅ Run the admin profile SQL (Step 4 above)
4. ✅ Log in at `/admin/login`
5. ⬜ Upload real product images via the admin edit screen (optional — placeholder images already working)
6. ⬜ Add pharmacy details (prescription status, manufacturer, etc.) to existing products via admin (optional)

---

## Changelog (Post-Migration Fixes)

These bugs were found and fixed during the production audit:

| # | Bug | Fix |
|---|-----|-----|
| 1 | Rating submission silently failed — `visitor_id` column is NOT NULL but was never included in the INSERT payload | `useProductRatings.ts` now generates a UUID per browser and stores it in `localStorage` as `al_osra_visitor_id` |
| 2 | Rating success toast fired immediately without awaiting the Supabase INSERT, so "شكراً!" appeared even when the DB insert failed | `handleSubmit` in `ProductDetail.tsx` is now `async`; success state only sets on confirmed INSERT |
| 3 | `Rating.id` was typed as `number` in TypeScript but the actual column is UUID (`string`); the mismatch was hidden by explicit casting | `Rating.id` corrected to `string` in `types/index.ts`; `AdminRatings.tsx` `handleDelete` signature updated |
| 4 | Deleting a product image in the admin dashboard marked it removed from UI state, then the save handler tried to find it in that same state (already empty) to get the Storage URL — so Supabase Storage files were never deleted (DB record was deleted correctly) | `AdminProductForm.tsx` now stores the full `ProductImage` object when marking for deletion, ensuring the URL is available at save time for Storage cleanup |

## Known Limitations

- Orders schema is prepared but the public checkout UI is not yet built. WhatsApp ordering continues to work as before.
- The `product_ratings` table does not yet enforce a FK constraint to `products`. This is safe — the IDs match, so ratings display correctly. A FK can be added with `ALTER TABLE product_ratings ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id);` after migration.
- Bundle size is 736 KB (220 KB gzipped) — acceptable for a pharmacy catalog. Can be reduced in future with route-based code splitting (`React.lazy`).

---

*صيدليات الأسرة — Built with React + Supabase*
