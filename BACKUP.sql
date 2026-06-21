-- ============================================================
-- صيدليات الأسرة — PRE-MIGRATION BACKUP
-- Run this BEFORE the migration to preserve your current data.
-- This script is safe to run multiple times (idempotent).
-- ============================================================

-- Step 1: Create a timestamped backup table for product_ratings
CREATE TABLE IF NOT EXISTS product_ratings_backup_premigration AS
  SELECT * FROM product_ratings;

-- Step 2: Verify the backup row count matches the live table
SELECT
  (SELECT COUNT(*) FROM product_ratings)               AS live_rows,
  (SELECT COUNT(*) FROM product_ratings_backup_premigration) AS backup_rows,
  CASE
    WHEN (SELECT COUNT(*) FROM product_ratings) =
         (SELECT COUNT(*) FROM product_ratings_backup_premigration)
    THEN '✅ Backup matches live table'
    ELSE '❌ Row count mismatch — do not proceed'
  END AS status;

-- ============================================================
-- HOW TO RESTORE FROM BACKUP (run only if something goes wrong)
-- ============================================================
-- DELETE FROM product_ratings;
-- INSERT INTO product_ratings SELECT * FROM product_ratings_backup_premigration;
-- SELECT COUNT(*) FROM product_ratings; -- verify count

-- ============================================================
-- CURRENT TABLE STRUCTURE (for reference)
-- ============================================================
-- product_ratings columns (as deployed before this migration):
--   id         bigint (primary key)
--   product_id bigint
--   visitor_id text
--   name       text
--   rating     integer
--   comment    text
--   created_at timestamptz
-- ============================================================
