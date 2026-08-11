import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { createProduct, fetchProduct, fetchProducts } from "../api/product-api";
import type { NewProduct, Product, ProductListFilter } from "./types";

export function productListQuery(filter: ProductListFilter) {
  return queryOptions({
    queryKey: queryKeys.products.list(filter),
    queryFn: ({ signal }) => fetchProducts(filter, signal),
  });
}

export function productDetailQuery(productId: string, requestSignal?: AbortSignal) {
  return queryOptions({
    queryKey: queryKeys.products.detail(productId),
    queryFn: ({ signal }) => fetchProduct(productId, requestSignal ?? signal),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, NewProduct>({
    mutationFn: (input) => createProduct(input),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product);
      return queryClient.invalidateQueries({ queryKey: queryKeys.products.lists });
    },
  });
}
