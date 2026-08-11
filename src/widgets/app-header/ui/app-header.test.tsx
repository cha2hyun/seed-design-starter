import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTestRouter } from "@/shared/lib/test-router";

import { AppHeader } from "./app-header";

describe("AppHeader", () => {
  it("keeps account actions separate from mobile primary navigation", async () => {
    const user = userEvent.setup();
    const router = createTestRouter(<AppHeader />);
    render(router.element);

    const accountTrigger = await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" });
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
});
