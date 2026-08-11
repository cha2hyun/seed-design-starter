import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { DEMO_SESSION } from "@/entities/session";

import { queryKeys } from "@/shared/api";
import { createTestRouter } from "@/shared/lib/test-router";

import { AppHeader } from "./app-header";

function setup() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.session.current, DEMO_SESSION);
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AppHeader />
      </SnackbarProvider>
    </QueryClientProvider>,
  );
  return render(router.element);
}

describe("AppHeader", () => {
  it("keeps account actions separate from mobile primary navigation", async () => {
    const user = userEvent.setup();
    setup();

    const accountTrigger = await screen.findByRole("button", {
      name: "당근이 계정 메뉴 열기",
    });
    expect(accountTrigger).toHaveClass("md:hidden");
    expect(within(accountTrigger).getByText("당근이")).toHaveClass("hidden", "sm:inline");

    await user.click(screen.getByRole("button", { name: "메뉴 열기" }));

    const navigation = screen.getByRole("navigation", { name: "주요 메뉴" });
    expect(within(navigation).getByRole("link", { name: "홈" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "설정" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "대시보드" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "마법사 폼" })).toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "프로필" })).not.toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("closes the mobile navigation with Escape and restores trigger focus", async () => {
    const user = userEvent.setup();
    setup();

    const trigger = await screen.findByRole("button", { name: "메뉴 열기" });
    await user.click(trigger);
    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("navigation", { name: "주요 메뉴" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleName("메뉴 열기");
  });
});
