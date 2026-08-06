import { createFileRoute } from "@tanstack/react-router";

import { ProductNewPage } from "@/pages/product-new";

export const Route = createFileRoute("/products/new")({
  component: ProductNewPage,
});
