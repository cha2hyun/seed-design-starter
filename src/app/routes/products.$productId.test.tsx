import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, type RouterHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import type { Product } from "@/entities/product";

import { HttpError, queryKeys } from "@/shared/api";

import { createQueryClient } from "../providers";
import { createAppRouter } from "../router";

const routeMocks = vi.hoisted(() => ({
  fetchProduct: vi.fn<(productId: string, signal: AbortSignal) => Promise<Product>>(),
}));

vi.mock("@/entities/product", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/product")>();

  return {
    ...actual,
    productDetailQuery: (productId: string) => ({
      queryKey: ["products", "detail", productId] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) => routeMocks.fetchProduct(productId, signal),
    }),
  };
});

const product: Product = {
  id: "p-route",
  title: "라우트로 불러온 상품",
  price: 25000,
  description: "라우터 통합 테스트 상품이에요.",
  category: "outdoor",
  status: "onSale",
  negotiable: false,
  sellerName: "판매자",
  region: "역삼동",
  createdAt: new Date().toISOString(),
};

function renderRoute(path: string) {
  const queryClient = createQueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const history: RouterHistory = createMemoryHistory({ initialEntries: [path] });
  const router = createAppRouter({ history, queryClient });

  return {
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </QueryClientProvider>,
    ),
  };
}

beforeEach(() => {
  routeMocks.fetchProduct.mockReset();
});

describe("/products/$productId", () => {
  it("shares the loader cache with the page query", async () => {
    routeMocks.fetchProduct.mockResolvedValue(product);
    const { queryClient } = renderRoute(`/products/${product.id}`);

    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
    expect(routeMocks.fetchProduct).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(queryKeys.products.detail(product.id))).toEqual(product);
  });

  it("maps a missing product to the route not-found screen", async () => {
    routeMocks.fetchProduct.mockRejectedValue(new HttpError(404, "Product does not exist"));
    renderRoute("/products/missing");

    expect(
      await screen.findByRole("heading", { level: 1, name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
  });

  it("leaves server failures to the route error boundary", async () => {
    routeMocks.fetchProduct.mockRejectedValue(new HttpError(503, "Service unavailable"));
    renderRoute("/products/unavailable");

    expect(
      await screen.findByRole("heading", { level: 1, name: "불러오지 못했어요" }),
    ).toBeInTheDocument();
  });

  it("shows a pending screen for a slow detail request", async () => {
    let resolveProduct: ((value: Product) => void) | undefined;
    routeMocks.fetchProduct.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProduct = resolve;
        }),
    );
    renderRoute(`/products/${product.id}`);

    expect(await screen.findByRole("status")).toHaveTextContent("불러오는 중이에요");
    resolveProduct?.(product);
    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
  });
});
