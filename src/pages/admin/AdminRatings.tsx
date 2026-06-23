import { useEffect, useState } from "react";
import { Star, Trash2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Rating } from "@/types";
import { AdminLayout } from "./AdminLayout";

type RatingWithProduct = Rating & {
  product_name?: string;
  product_sku?: string;
  products?: { name: string; sku?: string } | null;
};

export function AdminRatings() {
  const { isAdmin } = useAuth();
  const [ratings, setRatings] = useState<RatingWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data: ratingsData } = await supabase
      .from("product_ratings")
      .select("id, product_id, name, rating, comment, created_at")
      .order("created_at", { ascending: false });

    const rows = (ratingsData ?? []) as Rating[];

    const productIds = [...new Set(rows.map((r) => r.product_id).filter(Boolean))];
    let productMap: Record<number, { name: string; sku?: string }> = {};

    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, sku")
        .in("id", productIds);
      for (const p of (productsData ?? []) as { id: number; name: string; sku?: string }[]) {
        productMap[p.id] = { name: p.name, sku: p.sku };
      }
    }

    setRatings(
      rows.map((r) => ({
        ...r,
        products: productMap[r.product_id] ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!supabase || !isAdmin || !confirm("حذف هذا التقييم؟")) return;
    await supabase.from("product_ratings").delete().eq("id", id);
    await load();
  };

  const filtered = ratings.filter((r) =>
    !search ||
    (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.comment ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.products?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.products?.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-800">التقييمات</h1>
          {!isAdmin && (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              عرض فقط
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في التقييمات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              dir="rtl"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">لا توجد تقييمات</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <li key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{r.name ?? "زائر"}</span>
                      <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                        {r.products?.name ?? `منتج #${r.product_id}`}
                      </span>
                      {r.products?.sku && (
                        <span className="text-xs bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full">
                          {r.products.sku}
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 flex-shrink-0"
                      title="حذف التقييم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
