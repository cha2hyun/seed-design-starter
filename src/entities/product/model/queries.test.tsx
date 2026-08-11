import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { queryKeys } from "@/shared/api";

import { useCreateProductMutation } from "./queries";

describe("useCreateProductMutation", () => {
  it("seeds the created detail and only invalidates product lists", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.products.list("all"), []);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateProductMutation(), { wrapper });

    const created = await act(() =>
      result.current.mutateAsync({
        title: "상세 캐시에 넣을 상품",
        price: 18000,
        description: "등록 직후 다시 요청하지 않아요.",
        category: "digital",
        negotiable: false,
      }),
    );

    expect(queryClient.getQueryData(queryKeys.products.detail(created.id))).toEqual(created);
    expect(queryClient.getQueryState(queryKeys.products.list("all"))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.products.detail(created.id))?.isInvalidated).toBe(
      false,
    );
  });
});
