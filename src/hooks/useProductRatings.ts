import { useState, useEffect } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export type Review = {
  rating: number;
  text: string;
  name: string;
};

function getStorageKey(productId: number) {
  return `reviews_product_${productId}`;
}

function getVisitorId(): string {
  const key = "al_osra_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useProductRatings(productId: number) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (supabaseConfigured && supabase) {
      console.log("[Supabase] Fetching ratings for product", productId);
      supabase
        .from("product_ratings")
        .select("rating, name, comment")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error("[Supabase] SELECT error:", error);
            return;
          }
          console.log("[Supabase] Fetched", data?.length, "ratings:", data);
          const mapped: Review[] = (data ?? []).map((r) => ({
            rating: r.rating,
            name: r.name ?? "مجهول",
            text: r.comment ?? "",
          }));
          setReviews(mapped);
        });
    } else {
      console.warn("[Supabase] Not configured — using localStorage");
      try {
        const stored = localStorage.getItem(getStorageKey(productId));
        if (stored) setReviews(JSON.parse(stored));
      } catch {}
    }
  }, [productId]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const addReview = async (review: Review) => {
    if (supabaseConfigured && supabase) {
      const visitorId = getVisitorId();
      const payload = {
        product_id: productId,
        visitor_id: visitorId,
        rating: review.rating,
        name: review.name,
        comment: review.text,
      };
      console.log("[Supabase] Inserting rating payload:", payload);
      const { data, error } = await supabase
        .from("product_ratings")
        .insert(payload)
        .select();

      if (error) {
        console.error("[Supabase] INSERT error:", error);
        throw error;
      } else {
        console.log("[Supabase] INSERT success:", data);
        setReviews((prev) => [review, ...prev]);
      }
    } else {
      const updated = [review, ...reviews];
      setReviews(updated);
      try {
        localStorage.setItem(getStorageKey(productId), JSON.stringify(updated));
      } catch {}
    }
  };

  return { reviews, avg, count: reviews.length, addReview };
}
