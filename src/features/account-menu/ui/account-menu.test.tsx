import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTestRouter } from "@/shared/lib/test-router";

import { AccountMenu } from "./account-menu";

function setup(location: "header" | "sidebar" = "header") {
  const router = createTestRouter(<AccountMenu location={location} />);

  return { user: userEvent.setup(), location: router.location, ...render(router.element) };
}

describe("AccountMenu", () => {
  it("moves the compact identity from icon-only base to a named sm header control", async () => {
    setup();

    const trigger = await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" });
    const name = within(trigger).getByText("당근이");

    expect(trigger).toHaveClass("md:hidden");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(name).toHaveClass("hidden", "sm:inline");
  });

  it("reveals the full sidebar identity and its xl email detail", async () => {
    setup("sidebar");

    const trigger = await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" });
    const email = within(trigger).getByText("karrot@example.com");

    expect(within(trigger).getByText("당근이")).toBeInTheDocument();
    expect(email).toHaveClass("hidden", "xl:block");
  });

  it("opens a responsive action menu and navigates to the profile", async () => {
    const { user, location } = setup();

    await user.click(await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" }));

    const menu = await screen.findByRole("menu");
    expect(menu).toHaveClass("seed-menu__content--size_responsive");

    await user.click(within(menu).getByRole("menuitem", { name: "프로필 보기" }));
    await waitFor(() => expect(location()).toBe("/profile"));
  });

  it("routes the signed-in demo account to login after sign-out", async () => {
    const { user, location } = setup("sidebar");

    await user.click(await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" }));
    await user.click(await screen.findByRole("menuitem", { name: "로그아웃" }));

    await waitFor(() => expect(location()).toBe("/login"));
  });
});
