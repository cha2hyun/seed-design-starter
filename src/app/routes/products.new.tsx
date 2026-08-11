import { createFileRoute } from "@tanstack/react-router";

import { ProductNewPage } from "@/pages/product-new";

import { requireSession } from "../guards/require-session";

export const Route = createFileRoute("/products/new")({
  beforeLoad: ({ context }) => requireSession(context.queryClient),
  component: ProductNewPage,
});
