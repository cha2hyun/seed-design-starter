import { HttpError, request } from "@/shared/api";
import { ENV } from "@/shared/config";

import type { NewProduct, Product, ProductListFilter } from "../model/types";

const MEMORY_LATENCY_MS = 400;

function createSeedProducts(): Product[] {
  return [
    {
      id: "p-1",
      title: "3년 쓴 캠핑 의자",
      price: 25000,
      description:
        "접이식 캠핑 의자입니다. 프레임은 튼튼하고 원단에 사용감이 조금 있어요. 직거래만 가능합니다.",
      category: "outdoor",
      status: "onSale",
      negotiable: true,
      sellerName: "당근이",
      region: "역삼동",
      createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    },
    {
      id: "p-2",
      title: "기계식 키보드 (적축)",
      price: 68000,
      description: "1년 정도 사용했고 키캡은 새것으로 교체했습니다. 박스와 케이블 모두 있어요.",
      category: "digital",
      status: "reserved",
      negotiable: false,
      sellerName: "키보드러버",
      region: "삼성동",
      createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    },
    {
      id: "p-3",
      title: "원목 4인 식탁",
      price: 140000,
      description: "이사하면서 내놓습니다. 상판 스크래치 거의 없고 의자는 포함되지 않습니다.",
      category: "furniture",
      status: "sold",
      negotiable: false,
      sellerName: "이사가는중",
      region: "논현동",
      createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
    {
      id: "p-4",
      title: "리팩터링 2판",
      price: 22000,
      description: "밑줄 없이 깨끗합니다. 서점 가격보다 저렴하게 드려요.",
      category: "book",
      status: "onSale",
      negotiable: true,
      sellerName: "책벌레",
      region: "대치동",
      createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    },
  ];
}

export interface ProductRepository {
  fetchProducts: (filter: ProductListFilter, signal?: AbortSignal) => Promise<Product[]>;
  fetchProduct: (productId: string, signal?: AbortSignal) => Promise<Product>;
  createProduct: (input: NewProduct, signal?: AbortSignal) => Promise<Product>;
}

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
