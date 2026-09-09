import type { NewProduct, Product, ProductListFilter } from "../model/types";

export interface ProductRepository {
  fetchProducts: (filter: ProductListFilter, signal?: AbortSignal) => Promise<Product[]>;
  fetchProduct: (productId: string, signal?: AbortSignal) => Promise<Product>;
  createProduct: (input: NewProduct, signal?: AbortSignal) => Promise<Product>;
}
