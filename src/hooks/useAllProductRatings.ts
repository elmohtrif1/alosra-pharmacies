import { useState, useEffect } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export type RatingSummary = { avg: number; count: number };

export function useAllProductRatings() {
  const [ratings, setRatings] = useState<Record<number, RatingSummary>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (supabaseConfigured && supabase) {
      console.log("[Supabase] Fetching all product ratings");
      supabase
        .from("product_ratings")
        .select("product_id, rating")
        .then(({ data, error }) => {
          if (error) {
            console.error("[Supabase] SELECT all ratings error:", error);
            setLoaded(true);
            return;
          }
          console.log("[Supabase] All ratings fetched:", data?.length, "rows");
          const map: Record<number, { sum: number; count: number }> = {};
          (data ?? []).forEach((r) => {
            if (!map[r.product_id]) map[r.product_id] = { sum: 0, count: 0 };
            map[r.product_id].sum += r.rating;
            map[r.product_id].count += 1;
          });
          const result: Record<number, RatingSummary> = {};
          for (const id in map) {
            result[Number(id)] = {
              avg: map[id].sum / map[id].count,
              count: map[id].count,
            };
          }
          setRatings(result);
          setLoaded(true);
        });
    } else {
      console.warn("[Supabase] Not configured — reading ratings from localStorage");
      const result: Record<number, RatingSummary> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("reviews_product_")) {
          const productId = Number(key.replace("reviews_product_", ""));
          try {
            const arr: { rating: number }[] = JSON.parse(localStorage.getItem(key) || "[]");
            if (arr.length) {
              result[productId] = {
                avg: arr.reduce((s, r) => s + r.rating, 0) / arr.length,
                count: arr.length,
              };
            }
          } catch {}
        }
      }
      setRatings(result);
      setLoaded(true);
    }
  }, []);

  return { ratings, loaded };
}
