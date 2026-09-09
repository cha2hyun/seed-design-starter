import { request } from "@/shared/api";

import type { Product } from "../model/types";
import type { ProductRepository } from "./product-repository";

/**
 * HTTP repository contract:
 * GET `/products?filter=…`, GET `/products/:id`, and POST `/products`.
 */
export function createHttpProductRepository(baseUrl: string): ProductRepository {
  return {
    fetchProducts(filter, signal) {
      const search = new URLSearchParams({ filter });
      return request<Product[]>(`products?${search.toString()}`, { baseUrl, signal });
    },

    fetchProduct(productId, signal) {
      return request<Product>(`products/${encodeURIComponent(productId)}`, { baseUrl, signal });
    },

    createProduct(input, signal) {
      return request<Product>("products", {
        baseUrl,
        method: "POST",
        body: JSON.stringify(input),
        signal,
      });
    },
  };
}
