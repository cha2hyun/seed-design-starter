import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { DEMO_SESSION } from "@/entities/session";

import { queryKeys } from "@/shared/api";
import { createTestRouter } from "@/shared/lib/test-router";

import { AppSidebar } from "./app-sidebar";

describe("AppSidebar", () => {
  it("starts at md and keeps the full account identity at the bottom", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.session.current, DEMO_SESSION);
    const router = createTestRouter(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <AppSidebar />
        </SnackbarProvider>
      </QueryClientProvider>,
    );
    render(router.element);

    const navigation = await screen.findByRole("navigation", { name: "사이드 메뉴" });
    const accountTrigger = within(navigation).getByRole("button", {
      name: "당근이 계정 메뉴 열기",
    });

    expect(navigation).toHaveClass("hidden", "md:flex");
    expect(within(navigation).getByRole("link", { name: "홈" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "설정" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "대시보드" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "마법사 폼" })).toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "프로필" })).not.toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(within(accountTrigger).getByText("karrot@example.com")).toHaveClass(
      "hidden",
      "xl:block",
    );
  });
});
