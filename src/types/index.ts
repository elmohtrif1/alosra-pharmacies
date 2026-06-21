export interface Category {
  id: number;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: number;
  sku?: string;
  name: string;
  brand?: string;
  category_id?: number;
  categories?: Category;
  price: number;
  unit?: string;
  badge?: string;
  description?: string;
  features?: string[];
  product_images?: ProductImage[];
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  requires_prescription: boolean;
  manufacturer?: string;
  active_ingredient?: string;
  dosage_form?: string;
  package_size?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
  average_rating?: number;
  rating_count?: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff";
  created_at: string;
}

export interface Rating {
  id: string;
  product_id: number;
  visitor_id?: string;
  name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalRatings: number;
  recentRatings: (Rating & { product_name?: string })[];
}

export type ProductFormData = {
  sku: string;
  name: string;
  brand: string;
  category_id: string;
  price: string;
  unit: string;
  badge: string;
  description: string;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: string;
  requires_prescription: boolean;
  manufacturer: string;
  active_ingredient: string;
  dosage_form: string;
  package_size: string;
  meta_title: string;
  meta_description: string;
};

export const EMPTY_FORM: ProductFormData = {
  sku: "",
  name: "",
  brand: "",
  category_id: "",
  price: "",
  unit: "",
  badge: "",
  description: "",
  features: [],
  is_active: true,
  is_featured: false,
  stock_quantity: "0",
  requires_prescription: false,
  manufacturer: "",
  active_ingredient: "",
  dosage_form: "",
  package_size: "",
  meta_title: "",
  meta_description: "",
};
