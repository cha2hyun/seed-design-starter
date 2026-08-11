import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type Product, productDetailQuery } from "@/entities/product";

import { createTestRouter } from "@/shared/lib/test-router";

import { ProductDetailPage, ProductDetailPendingPage } from "./product-detail-page";

const product: Product = {
  id: "p-detail",
  title: "테스트 캠핑 의자",
  price: 25000,
  description: "튼튼한 캠핑 의자예요.",
  category: "outdoor",
  status: "onSale",
  negotiable: true,
  sellerName: "당근이",
  region: "역삼동",
  createdAt: new Date().toISOString(),
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(productDetailQuery(product.id).queryKey, product);
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <ProductDetailPage productId={product.id} />
    </QueryClientProvider>,
  );

  return render(router.element);
}

describe("ProductDetailPage", () => {
  it("renders loader-provided product data and uses its title for the document", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${product.title} · SEED 스타터`);
  });

  it("keeps the seller avatar decorative when the seller name is already visible", async () => {
    renderPage();

    expect(await screen.findByText(product.sellerName)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: product.sellerName })).not.toBeInTheDocument();
  });
});

describe("ProductDetailPendingPage", () => {
  it("announces the route-level loading state", () => {
    render(<ProductDetailPendingPage />);

    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중이에요");
    expect(document.title).toBe("상품 상세 · SEED 스타터");
  });
});
