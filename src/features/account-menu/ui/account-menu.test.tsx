import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { DEMO_SESSION, type Session } from "@/entities/session";

import { queryKeys } from "@/shared/api";
import { createTestRouter } from "@/shared/lib/test-router";

import { AccountMenu } from "./account-menu";

const sessionApiMocks = vi.hoisted(() => ({
  logout: vi.fn<() => Promise<null>>(),
}));

vi.mock("@/entities/session/api/session-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/session")>();
  return { ...actual, logout: sessionApiMocks.logout };
});

beforeEach(() => {
  sessionApiMocks.logout.mockReset();
  sessionApiMocks.logout.mockResolvedValue(null);
});

function setup({
  location = "header",
  session = DEMO_SESSION,
}: {
  location?: "header" | "sidebar";
  session?: Session | null;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 30_000 },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(queryKeys.session.current, session);
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AccountMenu location={location} />
      </SnackbarProvider>
    </QueryClientProvider>,
  );

  return {
    user: userEvent.setup(),
    location: router.location,
    queryClient,
    ...render(router.element),
  };
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
    setup({ location: "sidebar" });

    const trigger = await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" });
    const email = within(trigger).getByText("karrot@example.com");

    expect(within(trigger).getByText("당근이")).toBeInTheDocument();
    expect(email).toHaveClass("hidden", "xl:block");
  });

  it("opens a responsive action menu and navigates to the profile", async () => {
    const { user, location } = setup();

    const trigger = await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" });
    await user.click(trigger);

    const menu = await screen.findByRole("menu");
    expect(menu).toHaveClass("seed-menu__content--size_responsive");

    const profileLink = within(menu).getByRole("menuitem", { name: "프로필 보기" });
    expect(profileLink).toHaveAttribute("href", "/profile");
    await user.click(profileLink);
    await waitFor(() => expect(location()).toBe("/profile"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("routes the signed-in demo account to login after sign-out", async () => {
    const { user, location, queryClient } = setup({ location: "sidebar" });

    await user.click(await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" }));
    await user.click(await screen.findByRole("menuitem", { name: "로그아웃" }));

    await waitFor(() => expect(location()).toBe("/login"));
    expect(queryClient.getQueryData(queryKeys.session.current)).toBeNull();
  });

  it("announces a sign-out failure and keeps the current session", async () => {
    sessionApiMocks.logout.mockRejectedValueOnce(new Error("Session endpoint unavailable"));
    const { user, location, queryClient } = setup({ location: "sidebar" });

    await user.click(await screen.findByRole("button", { name: "당근이 계정 메뉴 열기" }));
    await user.click(await screen.findByRole("menuitem", { name: "로그아웃" }));

    expect(
      await screen.findByText("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(location()).toBe("/");
    expect(queryClient.getQueryData(queryKeys.session.current)).toEqual(DEMO_SESSION);
  });

  it("shows a login action instead of demo identity when signed out", async () => {
    const { user, location } = setup({ location: "sidebar", session: null });

    expect(screen.queryByText("당근이")).not.toBeInTheDocument();
    const signIn = await screen.findByRole("link", { name: "로그인" });
    expect(signIn).toHaveAttribute("href", "/login");

    await user.click(signIn);
    await waitFor(() => expect(location()).toBe("/login"));
  });
});
