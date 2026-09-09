export { createHttpProductRepository } from "./api/http-product-repository";
export {
  createMemoryProductRepository,
  type MemoryProductRepositoryOptions,
} from "./api/memory-product-repository";
export {
  createProduct,
  createProductRepository,
  fetchProduct,
  fetchProducts,
} from "./api/product-api";
export type { ProductRepository } from "./api/product-repository";
export { productDetailQuery, productListQuery, useCreateProductMutation } from "./model/queries";
export {
  PRODUCT_CATEGORIES,
  PRODUCT_LIST_FILTERS,
  PRODUCT_STATUSES,
  type NewProduct,
  type Product,
  type ProductCategory,
  type ProductListFilter,
  type ProductStatus,
} from "./model/types";
export { ProductCard, type ProductCardProps } from "./ui/product-card";
export { ProductStatusTag, type ProductStatusTagProps } from "./ui/product-status-tag";
