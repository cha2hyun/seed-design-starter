import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { queryKeys } from "@/shared/api";

import { createQueryClient } from "../providers";
import { createAppRouter } from "../router";

describe("/products/new", () => {
  it("redirects a signed-out visitor before the seller form renders", async () => {
    const queryClient = createQueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.session.current, null);
    const router = createAppRouter({
      history: createMemoryHistory({ initialEntries: ["/products/new"] }),
      queryClient,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "로그인" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(screen.queryByRole("heading", { level: 1, name: "상품 등록" })).not.toBeInTheDocument();
  });
});
