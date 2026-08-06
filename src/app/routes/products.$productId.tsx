import { createFileRoute } from "@tanstack/react-router";

import { queryClient } from "@/app/providers";

import { ProductDetailPage } from "@/pages/product-detail";

import { productDetailQuery } from "@/entities/product";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }) => queryClient.ensureQueryData(productDetailQuery(params.productId)),
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={productId} />;
}
