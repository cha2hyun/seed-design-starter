import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DEMO_SESSION } from "@/entities/session";

import { queryKeys } from "@/shared/api";
import { createTestRouter } from "@/shared/lib/test-router";

import { ProfilePage } from "./profile-page";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(queryKeys.session.current, DEMO_SESSION);
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>,
  );

  return { queryClient, router, ...render(router.element) };
}

describe("ProfilePage", () => {
  it("uses one page heading and the SEED manner temperature badge", async () => {
    setup();

    expect(await screen.findByRole("heading", { level: 1, name: "프로필" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "활동 내역" })).toBeInTheDocument();
    expect(screen.getByText("36.5°C")).toBeInTheDocument();
    expect(screen.getByText(DEMO_SESSION.user.name)).toBeInTheDocument();
    expect(screen.getByText(DEMO_SESSION.user.email)).toBeInTheDocument();
  });

  it("names the logout confirmation after the action it performs", async () => {
    const user = userEvent.setup();
    const { queryClient, router } = setup();

    await user.click(await screen.findByRole("button", { name: "로그아웃" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByRole("heading", { name: "로그아웃하시겠어요?" }),
    ).toBeInTheDocument();
    const confirm = within(dialog).getByRole("button", { name: "로그아웃" });
    expect(confirm).toBeInTheDocument();

    await user.click(confirm);
    await waitFor(() => expect(router.location()).toBe("/login"));
    expect(queryClient.getQueryData(queryKeys.session.current)).toBeNull();
  });
});
