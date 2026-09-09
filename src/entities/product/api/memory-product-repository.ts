import { HttpError } from "@/shared/api";

import type { Product } from "../model/types";
import { createSeedProducts } from "./product-fixtures";
import type { ProductRepository } from "./product-repository";

const MEMORY_LATENCY_MS = 400;

export interface MemoryProductRepositoryOptions {
  latencyMs?: number;
  products?: Product[];
}

function getAbortError(signal?: AbortSignal): Error {
  return signal?.reason instanceof Error
    ? signal.reason
    : new DOMException("The request was aborted", "AbortError");
}

function waitForMemoryTransport(latencyMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(getAbortError(signal));
  }

  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      globalThis.clearTimeout(timeoutId);
      reject(getAbortError(signal));
    };
    const timeoutId = globalThis.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, latencyMs);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

/** Runnable local repository used when no `VITE_API_BASE_URL` is configured. */
export function createMemoryProductRepository(
  options: MemoryProductRepositoryOptions = {},
): ProductRepository {
  const latencyMs = options.latencyMs ?? MEMORY_LATENCY_MS;
  const store = new Map(
    (options.products ?? createSeedProducts()).map((product) => [product.id, product]),
  );

  return {
    async fetchProducts(filter, signal) {
      await waitForMemoryTransport(latencyMs, signal);
      const all = [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (filter === "all") return all;
      if (filter === "sold") return all.filter((product) => product.status === "sold");
      return all.filter((product) => product.status !== "sold");
    },

    async fetchProduct(productId, signal) {
      await waitForMemoryTransport(latencyMs, signal);
      const product = store.get(productId);
      if (!product) {
        throw new HttpError(404, `Product ${productId} does not exist`);
      }
      return product;
    },

    async createProduct(input, signal) {
      await waitForMemoryTransport(latencyMs, signal);
      const product: Product = {
        ...input,
        id: `p-${store.size + 1}-${Date.now()}`,
        status: "onSale",
        sellerName: "나",
        region: "역삼동",
        createdAt: new Date().toISOString(),
      };
      store.set(product.id, product);
      return product;
    },
  };
}
