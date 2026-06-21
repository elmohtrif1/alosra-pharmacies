import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Pencil, Trash2, ImageOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProducts, getPrimaryImage, getCategoryName } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { Product } from "@/types";
import { AdminLayout } from "./AdminLayout";

export function AdminProducts() {
  const [, navigate] = useLocation();
  const { products, loading, reload } = useProducts(false);
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCat =
        catFilter === "all" ||
        String(p.category_id) === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const handleDelete = async (product: Product) => {
    if (!supabase) return;
    if (!confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) return;
    setDeleting(product.id);
    await supabase.from("products").delete().eq("id", product.id);
    await reload();
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-800">المنتجات</h1>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الكود..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              dir="rtl"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الفئات</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-20 text-sm">لا توجد منتجات</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">المنتج</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">الفئة</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">السعر</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">المخزون</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">الحالة</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((product) => {
                    const img = getPrimaryImage(product);
                    const cat = getCategoryName(product);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {img ? (
                                <img src={img} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageOff className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                              {product.sku && (
                                <p className="text-xs text-slate-400">{product.sku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{cat}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800">{product.price} ج.م</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${product.stock_quantity < 10 ? "text-red-600" : "text-slate-600"}`}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {product.is_active ? "نشط" : "مخفي"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/products/${product.id}`)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="تعديل"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deleting === product.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2 text-left">{filtered.length} منتج</p>
      </div>
    </AdminLayout>
  );
}
