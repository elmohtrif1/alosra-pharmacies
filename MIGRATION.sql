-- ============================================================
-- صيدليات الأسرة — Full CMS Migration
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. HELPER FUNCTION (avoids recursive RLS)
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id        bigserial PRIMARY KEY,
  name      text UNIQUE NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "staff_manage_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "staff_manage_categories" ON categories FOR ALL USING (is_admin_or_staff());

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                    bigserial PRIMARY KEY,
  sku                   text UNIQUE,
  name                  text NOT NULL,
  brand                 text,
  category_id           bigint REFERENCES categories(id) ON DELETE SET NULL,
  price                 numeric(10,2) NOT NULL,
  unit                  text,
  badge                 text,
  description           text,
  features              text[],
  is_active             boolean DEFAULT true,
  is_featured           boolean DEFAULT false,
  stock_quantity        int DEFAULT 0,
  -- Pharmacy-specific
  requires_prescription boolean DEFAULT false,
  manufacturer          text,
  active_ingredient     text,
  dosage_form           text,
  package_size          text,
  -- SEO
  meta_title            text,
  meta_description      text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_active_products" ON products;
DROP POLICY IF EXISTS "staff_manage_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "staff_manage_products" ON products FOR ALL USING (is_admin_or_staff());

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. PRODUCT IMAGES (gallery support)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          bigserial PRIMARY KEY,
  product_id  bigint REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url         text NOT NULL,
  alt         text,
  is_primary  boolean DEFAULT false,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
DROP POLICY IF EXISTS "staff_manage_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "staff_manage_product_images" ON product_images FOR ALL USING (is_admin_or_staff());

-- ============================================================
-- 5. PROFILES (admin/staff users — extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      text,
  full_name  text,
  role       text DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_manage_profiles" ON profiles FOR ALL USING (is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 6. PRODUCT RATINGS (update existing table)
-- ============================================================
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_ratings" ON product_ratings;
DROP POLICY IF EXISTS "public_insert_ratings" ON product_ratings;
DROP POLICY IF EXISTS "staff_manage_ratings" ON product_ratings;
CREATE POLICY "public_read_ratings" ON product_ratings FOR SELECT USING (true);
CREATE POLICY "public_insert_ratings" ON product_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "staff_manage_ratings" ON product_ratings FOR ALL USING (is_admin_or_staff());

-- ============================================================
-- 7. ORDERS (schema only — checkout not yet implemented)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id             bigserial PRIMARY KEY,
  customer_name  text,
  customer_phone text,
  customer_email text,
  status         text DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount   numeric(10,2),
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          bigserial PRIMARY KEY,
  order_id    bigint REFERENCES orders(id) ON DELETE CASCADE,
  product_id  bigint REFERENCES products(id) ON DELETE SET NULL,
  quantity    int NOT NULL CHECK (quantity > 0),
  unit_price  numeric(10,2) NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_manage_orders" ON orders;
DROP POLICY IF EXISTS "staff_manage_order_items" ON order_items;
CREATE POLICY "staff_manage_orders" ON orders FOR ALL USING (is_admin_or_staff());
CREATE POLICY "staff_manage_order_items" ON order_items FOR ALL USING (is_admin_or_staff());

-- ============================================================
-- 8. STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_storage" ON storage.objects;
CREATE POLICY "public_read_storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "auth_upload_storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "auth_update_storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "auth_delete_storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- ============================================================
-- 9. SEED: CATEGORIES (explicit IDs to preserve ratings)
-- ============================================================
INSERT INTO categories (id, name, sort_order) VALUES
  (1, 'عناية بالشعر',   1),
  (2, 'فيتامينات',      2),
  (3, 'عناية بالبشرة',  3),
  (4, 'مستلزمات طبية',  4),
  (5, 'أطفال',          5),
  (6, 'أدوية',          6)
ON CONFLICT (id) DO NOTHING;
SELECT setval('categories_id_seq', 10);

-- ============================================================
-- 10. SEED: PRODUCTS (IDs 1-14 match hardcoded to preserve ratings)
-- ============================================================
INSERT INTO products (id, sku, name, brand, category_id, price, unit, badge, description, features, is_active, stock_quantity) VALUES
(1,  'SKU-001', 'Only Curly Shampoo',        'Les Karités', 1, 150, '300 ml',    'جديد',
 E'مع Only Curly Shampoo من Les Karités، شعرك الكيرلي هيحصل على العناية اللي يستحقها 💖\n\n🌸 يساعد على تحديد التموجات الطبيعية للشعر.\n🌸 يقلل الهيشان والتطاير.\n🌸 يمنح الشعر نعومة ولمعان طبيعي.\n🌸 ينظف الشعر بلطف بدون ما يسبب جفاف.\n🌸 خالٍ من السلفات والبارابين والسيليكون.\n\n💗 لأن كل خصلة كيرلي ليها جمالها الخاص... خلي روتين العناية بشعرك يدعم جماله الطبيعي كل يوم.',
 NULL, true, 50),
(2,  'SKU-002', 'فيتامين C 1000mg',          NULL,          2,  85, '30 قرص',   'الأكثر مبيعاً', NULL, NULL, true, 100),
(3,  'SKU-003', 'أوميغا 3 زيت السمك',         NULL,          2, 120, '60 كبسولة', NULL,           NULL, NULL, true, 80),
(4,  'SKU-004', 'كريم ترطيب يومي SPF 50',     NULL,          3,  95, '50ml',     NULL,           NULL, NULL, true, 60),
(5,  'SKU-005', 'شامبو للشعر الجاف',           NULL,          3,  65, '200ml',    NULL,           NULL, NULL, true, 70),
(6,  'SKU-006', 'ضاغط الدم الرقمي',            NULL,          4, 350, 'جهاز',     'مميز',         NULL, NULL, true, 20),
(7,  'SKU-007', 'ميزان حرارة رقمي',            NULL,          4,  75, 'جهاز',     NULL,           NULL, NULL, true, 35),
(8,  'SKU-008', 'شراب السعال للأطفال',          NULL,          5,  45, '120ml',    NULL,           NULL, NULL, true, 90),
(9,  'SKU-009', 'فيتامين D3 للأطفال',          NULL,          5,  90, '30 مل',    'الأكثر مبيعاً', NULL, NULL, true, 75),
(10, 'SKU-010', 'باراسيتامول 500mg',           NULL,          6,  25, '20 قرص',   NULL,           NULL, NULL, true, 200),
(11, 'SKU-011', 'إيبوبروفين 400mg',             NULL,          6,  30, '20 قرص',   NULL,           NULL, NULL, true, 150),
(12, 'SKU-012', 'فيتامين B Complex',           NULL,          2,  70, '30 قرص',   NULL,           NULL, NULL, true, 85),
(13, 'SKU-013', 'غسول اليدين المعقم',           NULL,          3,  35, '500ml',    NULL,           NULL, NULL, true, 120),
(14, 'SKU-014', 'GLAMY LAB Hydra Intense Cream', 'GLAMY LAB', 3, 550, NULL,       'جديد',
 E'دلّعي بشرتك بتركيبة متطورة غنية بـ العسل والإيلاستين البحري لتمنحك ترطيبًا عميقًا، نعومة ملحوظة، ومرونة أكثر مع كل استخدام.\n\n✅ ترطيب مكثف يدوم لساعات طويلة\n✅ يساعد على زيادة مرونة البشرة\n✅ يدعم تجديد البشرة وحمايتها من العوامل الخارجية\n✅ مناسب لجميع أنواع البشرة حتى الحساسة\n✅ خالٍ من العطور\n\nاحصلي على بشرة أكثر نضارة وإشراقًا كل يوم مع GLAMY LAB Hydra Intense Cream.',
 ARRAY['تركيبة غنية بالعسل والإيلاستين البحري','ترطيب عميق ومكثف','مناسب لجميع أنواع البشرة','خالٍ من العطور','فريدة من نوعها UNIQUE FORMULA'],
 true, 30)
ON CONFLICT (id) DO NOTHING;
SELECT setval('products_id_seq', 20);

-- ============================================================
-- 11. SEED: PRODUCT IMAGES (placeholder paths — replace via dashboard)
-- ============================================================
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order) VALUES
(1,  '/products-only-curly-shampoo.png',   'Only Curly Shampoo',          true, 0),
(14, '/products-glamy-lab-hydra-cream.png', 'GLAMY LAB Hydra Intense Cream', true, 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE. Next steps:
-- 1. In Supabase Authentication settings, enable Email/Password sign-in.
-- 2. Create your first admin account via: Supabase Auth > Users > Add User
-- 3. After creating the user, run:
--    UPDATE profiles SET role = 'admin', full_name = 'Admin Name'
--    WHERE email = 'your-admin@email.com';
-- 4. Invite staff: Supabase Auth > Users > Add User (they default to 'staff' role)
-- ============================================================
