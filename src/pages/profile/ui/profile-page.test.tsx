import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTestRouter } from "@/shared/lib/test-router";

import { ProfilePage } from "./profile-page";

describe("ProfilePage", () => {
  it("uses one page heading and the SEED manner temperature badge", async () => {
    const router = createTestRouter(<ProfilePage />);
    render(router.element);

    expect(await screen.findByRole("heading", { level: 1, name: "프로필" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "활동 내역" })).toBeInTheDocument();
    expect(screen.getByText("36.5°C")).toBeInTheDocument();
  });

  it("names the logout confirmation after the action it performs", async () => {
    const user = userEvent.setup();
    const router = createTestRouter(<ProfilePage />);
    render(router.element);

    await user.click(await screen.findByRole("button", { name: "로그아웃" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByRole("heading", { name: "로그아웃하시겠어요?" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });
});
