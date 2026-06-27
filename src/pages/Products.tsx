import { useState, useMemo } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useProducts, getPrimaryImage, getCategoryName } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { BranchOrderDialog } from "@/components/BranchOrderDialog";
import type { Product } from "@/types";

function ProductCard({ product }: { product: Product }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const image = getPrimaryImage(product);
  const cat = getCategoryName(product);

  const waMessage = encodeURIComponent(
    `أريد طلب: ${product.name}${product.sku ? ` - كود المنتج: ${product.sku}` : ""}`
  );

  return (
    <>
      <BranchOrderDialog open={open} setOpen={setOpen} waMessage={waMessage} />

      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <div className="relative bg-gray-50 flex items-center justify-center h-44 overflow-hidden">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-contain p-3" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-200" />
            </div>
          )}
          {product.badge && (
            <span className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {product.badge}
            </span>
          )}
          {product.requires_prescription && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              بوصفة طبية
            </span>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1 text-right gap-0.5">
          {cat && <span className="text-xs text-gray-400">{cat}</span>}
          {product.brand && <span className="text-xs text-gray-500 font-medium">{product.brand}</span>}
          <h3 className="font-bold text-gray-800 text-sm leading-snug">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs mt-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-700">
              {(product.average_rating ?? 0).toFixed(1)}
            </span>
            <span className="text-gray-400">({product.rating_count ?? 0})</span>
          </div>
          {product.unit && <span className="text-xs text-gray-400">{product.unit}</span>}
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="flex items-center gap-1 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors"
            >
              <ShoppingCart className="w-3 h-3" />
              اطلب
            </button>
            <span className="font-black text-accent text-base">{product.price} ج.م</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function Products() {
  const { products, loading } = useProducts(true);
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");

  const categoryNames = ["الكل", ...categories.map((c) => c.name)];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catName = getCategoryName(p);
      const matchCategory = activeCategory === "الكل" || catName === activeCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        catName.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 text-foreground" dir="rtl">
      <Navbar />
      <main>
        <section className="bg-primary py-10 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-2">منتجاتنا</h1>
          <p className="text-blue-100 text-base">اختر من أفضل المنتجات الصيدلانية</p>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-center mb-5">
              <div className="relative w-full max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center" style={{ scrollbarWidth: "none" }}>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">لا توجد منتجات مطابقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
