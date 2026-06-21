import { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowRight, Upload, X, ImageOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCategories } from "@/hooks/useCategories";
import type { Product, ProductFormData, ProductImage } from "@/types";
import { EMPTY_FORM } from "@/types";
import { AdminLayout } from "./AdminLayout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
      <h2 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right";

function extractStoragePath(url: string): string | null {
  const marker = "product-images/";
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : null;
}

export function AdminProductForm() {
  const params = useParams<{ id: string }>();
  const isNew = !params.id || params.id === "new";
  const productId = isNew ? null : Number(params.id);

  const [, navigate] = useLocation();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew || !supabase || !productId) return;
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const p = data as Product & { product_images: ProductImage[] };
        setForm({
          sku: p.sku ?? "",
          name: p.name,
          brand: p.brand ?? "",
          category_id: p.category_id ? String(p.category_id) : "",
          price: String(p.price),
          unit: p.unit ?? "",
          badge: p.badge ?? "",
          description: p.description ?? "",
          features: p.features ?? [],
          is_active: p.is_active,
          is_featured: p.is_featured,
          stock_quantity: String(p.stock_quantity),
          requires_prescription: p.requires_prescription,
          manufacturer: p.manufacturer ?? "",
          active_ingredient: p.active_ingredient ?? "",
          dosage_form: p.dosage_form ?? "",
          package_size: p.package_size ?? "",
          meta_title: p.meta_title ?? "",
          meta_description: p.meta_description ?? "",
        });
        setExistingImages(p.product_images ?? []);
        setLoading(false);
      });
  }, [isNew, productId]);

  const set = (key: keyof ProductFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ""] }));
  const updateFeature = (i: number, val: string) =>
    setForm((f) => { const arr = [...f.features]; arr[i] = val; return { ...f, features: arr }; });
  const removeFeature = (i: number) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeNewFile = (i: number) => {
    setNewFiles((f) => f.filter((_, idx) => idx !== i));
    setNewPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (img: ProductImage) => {
    setDeletedImages((d) => [...d, img]);
    setExistingImages((imgs) => imgs.filter((i) => i.id !== img.id));
  };

  const handleSave = async () => {
    if (!supabase) { setError("Supabase غير متصل"); return; }
    if (!form.name.trim()) { setError("اسم المنتج مطلوب"); return; }
    if (!form.price || isNaN(Number(form.price))) { setError("السعر غير صحيح"); return; }

    setSaving(true);
    setError("");

    const payload = {
      sku: form.sku || null,
      name: form.name.trim(),
      brand: form.brand || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      price: Number(form.price),
      unit: form.unit || null,
      badge: form.badge || null,
      description: form.description || null,
      features: form.features.filter(Boolean),
      is_active: form.is_active,
      is_featured: form.is_featured,
      stock_quantity: Number(form.stock_quantity) || 0,
      requires_prescription: form.requires_prescription,
      manufacturer: form.manufacturer || null,
      active_ingredient: form.active_ingredient || null,
      dosage_form: form.dosage_form || null,
      package_size: form.package_size || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };

    let savedId = productId;
    if (isNew) {
      const { data, error: insertErr } = await supabase.from("products").insert(payload).select().single();
      if (insertErr || !data) { setError(insertErr?.message ?? "حدث خطأ"); setSaving(false); return; }
      savedId = (data as { id: number }).id;
    } else {
      const { error: updateErr } = await supabase.from("products").update(payload).eq("id", savedId!);
      if (updateErr) { setError(updateErr.message); setSaving(false); return; }
    }

    for (const img of deletedImages) {
      const path = extractStoragePath(img.url);
      if (path) await supabase.storage.from("product-images").remove([path]);
      await supabase.from("product_images").delete().eq("id", img.id);
    }

    const remaining = existingImages;
    for (let idx = 0; idx < newFiles.length; idx++) {
      const file = newFiles[idx];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${savedId}/${Date.now()}-${idx}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: savedId,
          url: urlData.publicUrl,
          is_primary: remaining.length === 0 && idx === 0,
          sort_order: remaining.length + idx,
        });
      }
    }

    setSaving(false);
    navigate("/admin/products");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-slate-800">
            {isNew ? "إضافة منتج جديد" : "تعديل المنتج"}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* Basic Info */}
        <Section title="المعلومات الأساسية">
          <div className="grid grid-cols-2 gap-4">
            <Field label="اسم المنتج" required>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
            <Field label="كود المنتج (SKU)">
              <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)} className={INPUT} dir="ltr" placeholder="SKU-001" />
            </Field>
            <Field label="الماركة / العلامة التجارية">
              <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
            <Field label="الفئة">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={INPUT}>
                <option value="">بدون فئة</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="السعر (ج.م)" required>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={INPUT} dir="ltr" min="0" />
            </Field>
            <Field label="الوحدة">
              <input type="text" value={form.unit} onChange={(e) => set("unit", e.target.value)} className={INPUT} dir="rtl" placeholder="مثال: 300ml، 30 قرص" />
            </Field>
            <Field label="شارة / بادج">
              <input type="text" value={form.badge} onChange={(e) => set("badge", e.target.value)} className={INPUT} dir="rtl" placeholder="مثال: جديد، مميز" />
            </Field>
          </div>
        </Section>

        {/* Stock & Visibility */}
        <Section title="المخزون والظهور">
          <div className="grid grid-cols-2 gap-4">
            <Field label="الكمية في المخزون">
              <input type="number" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} className={INPUT} dir="ltr" min="0" />
            </Field>
            <div className="flex flex-col gap-3 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">منتج نشط (يظهر في الموقع)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">منتج مميز</span>
              </label>
            </div>
          </div>
        </Section>

        {/* Description & Features */}
        <Section title="الوصف والمميزات">
          <Field label="الوصف">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${INPUT} min-h-32 resize-y`}
              dir="rtl"
              rows={5}
            />
          </Field>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">المميزات (نقاط)</label>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    className={`${INPUT} flex-1`}
                    dir="rtl"
                    placeholder={`ميزة ${i + 1}`}
                  />
                  <button onClick={() => removeFeature(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFeature}
                className="text-sm text-blue-600 hover:underline mt-1 font-medium"
              >
                + إضافة ميزة
              </button>
            </div>
          </div>
        </Section>

        {/* Pharmacy Fields */}
        <Section title="تفاصيل صيدلانية">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => set("requires_prescription", e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-slate-700">يستلزم وصفة طبية</span>
              </label>
            </div>
            <Field label="الشركة المصنّعة">
              <input type="text" value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
            <Field label="المادة الفعّالة">
              <input type="text" value={form.active_ingredient} onChange={(e) => set("active_ingredient", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
            <Field label="الشكل الصيدلاني">
              <input type="text" value={form.dosage_form} onChange={(e) => set("dosage_form", e.target.value)} className={INPUT} dir="rtl" placeholder="أقراص، كبسولات، شراب..." />
            </Field>
            <Field label="حجم العبوة">
              <input type="text" value={form.package_size} onChange={(e) => set("package_size", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
          </div>
        </Section>

        {/* Images */}
        <Section title="صور المنتج">
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                {img.is_primary && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-blue-600 text-white py-0.5">رئيسية</span>
                )}
                <button
                  onClick={() => removeExistingImage(img)}
                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-blue-300 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-blue-100 text-blue-700 py-0.5">جديد</span>
                <button
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {existingImages.length === 0 && newPreviews.length === 0 && (
              <div className="w-24 h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                <ImageOff className="w-6 h-6 text-slate-300" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            <Upload className="w-4 h-4" />
            رفع صور
          </button>
          <p className="text-xs text-slate-400 mt-1">أول صورة تُرفع ستكون الصورة الرئيسية</p>
        </Section>

        {/* SEO */}
        <Section title="SEO (محركات البحث)">
          <div className="space-y-4">
            <Field label="عنوان SEO">
              <input type="text" value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={INPUT} dir="rtl" />
            </Field>
            <Field label="وصف SEO">
              <textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} className={`${INPUT} min-h-20 resize-y`} dir="rtl" rows={3} />
            </Field>
          </div>
        </Section>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pb-8">
          <button
            onClick={() => navigate("/admin/products")}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "جارٍ الحفظ..." : isNew ? "إضافة المنتج" : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
