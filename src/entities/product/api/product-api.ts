import { ENV } from "@/shared/config";

import type { NewProduct, Product, ProductListFilter } from "../model/types";
import { createHttpProductRepository } from "./http-product-repository";
import { createMemoryProductRepository } from "./memory-product-repository";
import type { ProductRepository } from "./product-repository";

export function createProductRepository(apiBaseUrl = ENV.apiBaseUrl): ProductRepository {
  return apiBaseUrl ? createHttpProductRepository(apiBaseUrl) : createMemoryProductRepository();
}

const productRepository = createProductRepository();

export function fetchProducts(filter: ProductListFilter, signal?: AbortSignal): Promise<Product[]> {
  return productRepository.fetchProducts(filter, signal);
}

export function fetchProduct(productId: string, signal?: AbortSignal): Promise<Product> {
  return productRepository.fetchProduct(productId, signal);
}

export function createProduct(input: NewProduct, signal?: AbortSignal): Promise<Product> {
  return productRepository.createProduct(input, signal);
}
