import { createFileRoute, notFound } from "@tanstack/react-router";

import { ErrorPage } from "@/pages/error";
import { NotFoundPage } from "@/pages/not-found";
import { ProductDetailPage, ProductDetailPendingPage } from "@/pages/product-detail";

import { productDetailQuery } from "@/entities/product";

import { HttpError } from "@/shared/api";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ abortController, context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        productDetailQuery(params.productId, abortController.signal),
      );
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        // TanStack Router intentionally represents not-found as a branded object.
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw notFound();
      }
      throw error;
    }
  },
  pendingComponent: ProductDetailPendingPage,
  pendingMs: 150,
  pendingMinMs: 300,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={productId} />;
}
