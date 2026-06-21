import { useState } from "react";
import { Star, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useProduct } from "@/hooks/useProduct";
import { useProductRatings } from "@/hooks/useProductRatings";
import type { ProductImage } from "@/types";

const WHATSAPP_NUMBER = "201220218685";

function StarInput({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 flex-row-reverse justify-end">
      {[5, 4, 3, 2, 1].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 transition-colors ${star <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-gray-300"} ${readonly ? "" : "cursor-pointer"}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
}

function ImageGallery({ images }: { images: ProductImage[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (images.length === 0) {
    return (
      <div className="w-full max-w-xs mx-auto rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden p-4 flex items-center justify-center aspect-square">
        <ShoppingCart className="w-20 h-20 text-gray-200" />
      </div>
    );
  }
  const main = images[activeIdx] ?? images[0];
  return (
    <div>
      <div className="relative w-full max-w-xs mx-auto rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden aspect-square flex items-center justify-center">
        <img src={main.url} alt={main.alt ?? ""} className="w-full h-full object-contain p-4" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeIdx ? "border-primary" : "border-gray-200"}`}
            >
              <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { product, loading } = useProduct(Number(params.id));
  const { reviews, addReview } = useProductRatings(Number(params.id));

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-400 mb-4">المنتج غير موجود</p>
            <button onClick={() => navigate("/products")} className="text-primary underline">العودة للمنتجات</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const waMessage = encodeURIComponent(`أريد طلب: ${product.name}`);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  const sortedImages = [...(product.product_images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await addReview({ rating, text: reviewText, name: reviewerName || "مجهول" });
      setRating(0); setReviewText(""); setReviewerName(""); setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال التقييم";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800" dir="rtl">
      <Navbar />
      <main className="container mx-auto px-4 max-w-5xl py-6">
        <div className="flex justify-end mb-6">
          <button onClick={() => navigate("/products")} className="flex items-center gap-1 text-primary text-sm hover:underline">
            العودة للمنتجات
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Info */}
          <div className="text-right order-2 md:order-1">
            {product.brand && <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{product.name}</h1>

            {avgRating && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 font-bold">{avgRating}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({reviews.length} تقييم)</span>
              </div>
            )}

            <p className="text-2xl font-black text-accent mb-1">{product.price} ج.م</p>
            {product.unit && <p className="text-sm text-gray-400 mb-4">{product.unit}</p>}

            {product.requires_prescription && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                يستلزم هذا المنتج وصفة طبية
              </div>
            )}

            {product.description && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">المميزات</h3>
                <ul className="space-y-1">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-primary">✔</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pharmacy details */}
            {(product.manufacturer || product.active_ingredient || product.dosage_form || product.package_size) && (
              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm space-y-1">
                {product.manufacturer && <p><span className="font-bold text-gray-700">الشركة المصنّعة: </span>{product.manufacturer}</p>}
                {product.active_ingredient && <p><span className="font-bold text-gray-700">المادة الفعّالة: </span>{product.active_ingredient}</p>}
                {product.dosage_form && <p><span className="font-bold text-gray-700">الشكل الصيدلاني: </span>{product.dosage_form}</p>}
                {product.package_size && <p><span className="font-bold text-gray-700">حجم العبوة: </span>{product.package_size}</p>}
              </div>
            )}

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-colors text-base mt-2"
            >
              <ShoppingCart className="w-5 h-5" />
              اطلب عبر واتساب
            </a>
          </div>

          {/* Image Gallery */}
          <div className="order-1 md:order-2 flex flex-col items-center justify-start">
            <ImageGallery images={sortedImages} />
          </div>
        </div>

        {/* Ratings */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-right">التقييمات والمراجعات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-right">
                <h3 className="font-bold text-gray-800 mb-4">أضف تقييمك</h3>
                <div className="mb-3">
                  <label className="block text-sm text-gray-500 mb-1">اسمك</label>
                  <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="ادخل اسمك..." className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-right" dir="rtl" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-500 mb-1">تقييمك</label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-1">تعليقك (اختياري)</label>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="شاركنا رأيك في المنتج..." rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-right" dir="rtl" />
                </div>
                <button type="submit" disabled={!rating || submitting} className="flex items-center justify-center gap-2 w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl transition-colors hover:bg-primary/90 text-sm">
                  {submitting ? "جاري الإرسال..." : "إرسال التقييم 📨"}
                </button>
                {submitted && <p className="mt-3 text-green-600 font-semibold text-sm text-center">شكراً! تم إضافة تقييمك بنجاح ✓</p>}
                {submitError && <p className="mt-3 text-red-600 font-semibold text-sm text-center">⚠️ {submitError}</p>}
              </form>
            </div>

            <div className="text-right">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Star className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="font-semibold text-sm">لا توجد تقييمات بعد</p>
                  <p className="text-xs mt-1">كن أول من يقيّم هذا المنتج!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <StarInput value={review.rating} readonly />
                        <span className="font-semibold text-sm text-gray-700">{review.name}</span>
                      </div>
                      {review.text && <p className="text-gray-600 text-sm">{review.text}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
