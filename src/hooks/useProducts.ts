import { useState, useEffect } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types";
import { products as hardcoded } from "@/data/products";

export function hardcodedToProduct(p: (typeof hardcoded)[0]): Product {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    unit: p.unit,
    badge: p.badge,
    description: p.description,
    features: p.features,
    is_active: true,
    is_featured: false,
    stock_quantity: 0,
    requires_prescription: false,
    product_images: p.image
      ? [{ id: 0, product_id: p.id, url: p.image, is_primary: true, sort_order: 0 }]
      : [],
    categories: undefined,
    category_id: undefined,
  };
}

export function getPrimaryImage(product: Product): string | undefined {
  const images = product.product_images ?? [];
  const primary = images.find((i) => i.is_primary) ?? images[0];
  return primary?.url;
}

export function getCategoryName(product: Product): string {
  if (product.categories && typeof product.categories === "object") {
    return (product.categories as { name: string }).name;
  }
  return "";
}

export function useProducts(activeOnly = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    if (!supabaseConfigured || !supabase) {
      setProducts(hardcoded.map(hardcodedToProduct));
      setLoading(false);
      return;
    }

    let q = supabase
      .from("products")
      .select(
        "*, categories(id, name, sort_order), product_images(id, product_id, url, alt, is_primary, sort_order)"
      )
      .order("created_at", { ascending: false });

    if (activeOnly) q = q.eq("is_active", true);

    const { data, error: err } = await q;

    if (err) {
      console.error("[useProducts]", err);
      setError(err.message);
      setProducts(hardcoded.map(hardcodedToProduct));
    } else {
      const { data: ratings } = await supabase!
        .from("product_ratings")
        .select("product_id, rating");

      const productsWithRatings = (data ?? []).map((product: any) => {
        const productRatings =
          ratings?.filter((r: any) => r.product_id === product.id) ?? [];

        const ratingCount = productRatings.length;

        const averageRating =
          ratingCount > 0
            ? productRatings.reduce(
                (sum: number, r: any) => sum + r.rating,
                0
              ) / ratingCount
            : 0;

        return {
          ...product,
          average_rating: averageRating,
          rating_count: ratingCount,
        };
      });

      setProducts(productsWithRatings as Product[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeOnly]);

  return { products, loading, error, reload: load };
}