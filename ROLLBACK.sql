-- ============================================================
-- صيدليات الأسرة — MIGRATION ROLLBACK
-- Run this ONLY if you want to completely undo the migration.
-- WARNING: This will drop all new tables and their data.
-- Your original product_ratings data will NOT be lost —
-- it is preserved and restored from the backup table.
-- ============================================================

-- Step 1: Drop new tables (CASCADE removes FK dependencies automatically)
DROP TABLE IF EXISTS order_items         CASCADE;
DROP TABLE IF EXISTS orders              CASCADE;
DROP TABLE IF EXISTS product_images      CASCADE;
DROP TABLE IF EXISTS products            CASCADE;
DROP TABLE IF EXISTS categories          CASCADE;
DROP TABLE IF EXISTS profiles            CASCADE;

-- Step 2: Remove helper functions
DROP FUNCTION IF EXISTS is_admin_or_staff() CASCADE;
DROP FUNCTION IF EXISTS is_admin()          CASCADE;
DROP FUNCTION IF EXISTS handle_new_user()   CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Step 3: Remove trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Restore product_ratings to its original state
--   (disable RLS and remove the policies we added)
ALTER TABLE product_ratings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_ratings"   ON product_ratings;
DROP POLICY IF EXISTS "public_insert_ratings" ON product_ratings;
DROP POLICY IF EXISTS "staff_manage_ratings"  ON product_ratings;

-- Step 5: Restore product_ratings data from backup (if you ran BACKUP.sql first)
-- Uncomment these lines only if your ratings data was somehow altered:
-- DELETE FROM product_ratings;
-- INSERT INTO product_ratings SELECT * FROM product_ratings_backup_premigration;

-- Step 6: Remove the storage bucket policies
--   (the bucket itself can be deleted from the Supabase Storage UI)
DROP POLICY IF EXISTS "public_read_storage"  ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_storage"  ON storage.objects;
DROP POLICY IF EXISTS "auth_update_storage"  ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_storage"  ON storage.objects;

-- Step 7: Verify product_ratings is intact
SELECT COUNT(*) AS remaining_ratings FROM product_ratings;

-- ============================================================
-- After rollback, the database is back to its original state:
-- Only product_ratings exists, no new tables, no new functions.
-- ============================================================
