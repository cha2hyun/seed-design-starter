/**
 * Single registry of TanStack Query keys. Entities extend it rather than
 * inventing their own strings, which keeps invalidation predictable.
 */
export const queryKeys = {
  session: {
    current: ["session"] as const,
  },
  products: {
    all: ["products"] as const,
    lists: ["products", "list"] as const,
    list: (status: string) => ["products", "list", status] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
  },
} as const;
