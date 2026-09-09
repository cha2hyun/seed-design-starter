import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, type RouterHistory, RouterProvider } from "@tanstack/react-router";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import type { Product } from "@/entities/product";

import { queryKeys } from "@/shared/api";

import { createQueryClient } from "../providers";
import { createAppRouter } from "../router";

const fetchMock = vi.hoisted(() => vi.fn<typeof fetch>());

vi.mock("@/shared/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/config")>();

  return {
    ...actual,
    ENV: { ...actual.ENV, apiBaseUrl: "https://api.example.com/v1" },
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
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/products/$productId", () => {
  it("cancels the transport when the shared query is cancelled", async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("The request was aborted", "AbortError")),
            { once: true },
          );
        }),
    );
    const { queryClient } = renderRoute(`/products/${product.id}`);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;

    await act(() => queryClient.cancelQueries({ queryKey: queryKeys.products.detail(product.id) }));

    expect(signal?.aborted).toBe(true);
  });

  it("shares the loader cache with the page query", async () => {
    fetchMock.mockResolvedValue(Response.json(product));
    const { queryClient } = renderRoute(`/products/${product.id}`);

    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`https://api.example.com/v1/products/${product.id}`);
    expect(queryClient.getQueryData(queryKeys.products.detail(product.id))).toEqual(product);
  });

  it("reuses an in-flight detail after navigating away and back", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((resolve, reject) => {
          resolveResponse = resolve;
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("The request was aborted", "AbortError")),
            { once: true },
          );
        }),
    );
    const { router } = renderRoute(`/products/${product.id}`);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    await act(() => router.navigate({ to: "/settings" }));
    expect(await screen.findByRole("heading", { level: 1, name: "설정" })).toBeInTheDocument();
    await act(async () => {
      resolveResponse?.(Response.json(product));
      await router.navigate({ to: "/products/$productId", params: { productId: product.id } });
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps a missing product to the route not-found screen", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "Product does not exist" }, { status: 404 }),
    );
    renderRoute("/products/missing");

    expect(
      await screen.findByRole("heading", { level: 1, name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
  });

  it("leaves server failures to the route error boundary", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Service unavailable" }, { status: 503 }));
    renderRoute("/products/unavailable");

    expect(
      await screen.findByRole("heading", { level: 1, name: "불러오지 못했어요" }),
    ).toBeInTheDocument();
  });

  it("shows a pending screen for a slow detail request", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );
    renderRoute(`/products/${product.id}`);

    expect(await screen.findByRole("status")).toHaveTextContent("불러오는 중이에요");
    resolveResponse?.(Response.json(product));
    expect(
      await screen.findByRole("heading", { level: 1, name: product.title }),
    ).toBeInTheDocument();
  });
});
