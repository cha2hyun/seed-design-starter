export const PRODUCT_STATUSES = ["onSale", "reserved", "sold"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = ["digital", "furniture", "outdoor", "book"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  negotiable: boolean;
  sellerName: string;
  region: string;
  createdAt: string;
}

export interface NewProduct {
  title: string;
  price: number;
  description: string;
  category: ProductCategory;
  negotiable: boolean;
}

export const PRODUCT_LIST_FILTERS = ["all", "onSale", "sold"] as const;
export type ProductListFilter = (typeof PRODUCT_LIST_FILTERS)[number];
