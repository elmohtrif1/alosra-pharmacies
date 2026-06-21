import { useState, useEffect } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Category } from "@/types";

const FALLBACK: Category[] = [
  { id: 1, name: "عناية بالشعر", sort_order: 1 },
  { id: 2, name: "فيتامينات", sort_order: 2 },
  { id: 3, name: "عناية بالبشرة", sort_order: 3 },
  { id: 4, name: "مستلزمات طبية", sort_order: 4 },
  { id: 5, name: "أطفال", sort_order: 5 },
  { id: 6, name: "أدوية", sort_order: 6 },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabaseConfigured || !supabase) {
      setCategories(FALLBACK);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) setCategories(FALLBACK);
    else setCategories(data ?? FALLBACK);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return { categories, loading, reload: load };
}
