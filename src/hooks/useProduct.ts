import { useState, useEffect } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types";
import { products as hardcoded } from "@/data/products";
import { hardcodedToProduct } from "./useProducts";

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    if (!supabaseConfigured || !supabase) {
      const p = hardcoded.find((h) => h.id === id);
      setProduct(p ? hardcodedToProduct(p) : null);
      setLoading(false);
      return;
    }

    supabase
      .from("products")
      .select(
        "*, categories(id, name, sort_order), product_images(id, product_id, url, alt, is_primary, sort_order)"
      )
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          const p = hardcoded.find((h) => h.id === id);
          setProduct(p ? hardcodedToProduct(p) : null);
        } else {
          setProduct(data as unknown as Product);
        }
        setLoading(false);
      });
  }, [id]);

  return { product, loading };
}
