/**
 * Single registry of TanStack Query keys. Entities extend it rather than
 * inventing their own strings, which keeps invalidation predictable.
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (status: string) => ["products", "list", status] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
  },
} as const;
