import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { createProduct, fetchProduct, fetchProducts } from "../api/product-api";
import type { NewProduct, Product, ProductListFilter } from "./types";

export function productListQuery(filter: ProductListFilter) {
  return queryOptions({
    queryKey: queryKeys.products.list(filter),
    queryFn: () => fetchProducts(filter),
  });
}

export function productDetailQuery(productId: string) {
  return queryOptions({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => fetchProduct(productId),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, NewProduct>({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
