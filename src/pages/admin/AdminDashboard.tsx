import { useEffect, useState } from "react";
import { Package, CheckCircle, Star, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DashboardStats } from "@/types";
import { AdminLayout } from "./AdminLayout";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, activeProducts: 0, featuredProducts: 0,
    totalRatings: 0, recentRatings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("products").select("id, is_active, is_featured", { count: "exact" }),
      supabase.from("product_ratings").select("id", { count: "exact" }),
      supabase
        .from("product_ratings")
        .select("id, product_id, name, rating, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]).then(async ([products, ratings, recent]) => {
      const all = (products.data ?? []) as { is_active: boolean; is_featured: boolean }[];
      const recentRows = (recent.data ?? []) as DashboardStats["recentRatings"];

      const productIds = [...new Set(recentRows.map((r) => r.product_id).filter(Boolean))];
      let productMap: Record<number, { name: string; sku?: string }> = {};
      if (productIds.length > 0 && supabase) {
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, sku")
          .in("id", productIds);
        for (const p of (productsData ?? []) as { id: number; name: string; sku?: string }[]) {
          productMap[p.id] = { name: p.name, sku: p.sku };
        }
      }

      setStats({
        totalProducts: products.count ?? 0,
        activeProducts: all.filter((p) => p.is_active).length,
        featuredProducts: all.filter((p) => p.is_featured).length,
        totalRatings: ratings.count ?? 0,
        recentRatings: recentRows.map((r) => ({
          ...r,
          product_name: productMap[r.product_id]?.name,
          product_sku: productMap[r.product_id]?.sku,
        })),
      });
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-6">لوحة التحكم</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Package} label="إجمالي المنتجات" value={stats.totalProducts} color="bg-blue-600" />
              <StatCard icon={CheckCircle} label="المنتجات النشطة" value={stats.activeProducts} color="bg-emerald-600" />
              <StatCard icon={Star} label="إجمالي التقييمات" value={stats.totalRatings} color="bg-amber-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-500" />
                <h2 className="font-bold text-slate-800">آخر التقييمات</h2>
              </div>
              {stats.recentRatings.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">لا توجد تقييمات بعد</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentRatings.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-medium text-slate-700">{r.name ?? "زائر"}</p>
                          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full truncate max-w-[160px]">
                            {r.product_name ?? `منتج #${r.product_id}`}
                          </span>
                          {r.product_sku && (
                            <span className="text-xs bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full">
                              {r.product_sku}
                            </span>
                          )}
                        </div>
                        {r.comment && <p className="text-xs text-slate-400 line-clamp-1">{r.comment}</p>}
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-sm font-bold flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {r.rating}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
