import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createTestRouter } from "@/shared/lib/test-router";

import { ProductDetailPage } from "./product-detail-page";

function renderPage(productId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <ProductDetailPage productId={productId} />
    </QueryClientProvider>,
  );

  return render(router.element);
}

describe("ProductDetailPage", () => {
  it("uses the product detail title while the product is loading", async () => {
    renderPage("p-1");

    expect(await screen.findByRole("status")).toHaveTextContent("불러오는 중이에요");
    expect(document.title).toBe("상품 상세 · SEED 스타터");
  });

  it("identifies the error state as the page heading", async () => {
    renderPage("missing-product");

    expect(
      await screen.findByRole("heading", { level: 1, name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("상품 상세 · SEED 스타터");
  });
});
