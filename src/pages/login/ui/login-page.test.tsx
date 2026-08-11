import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createTestRouter } from "@/shared/lib/test-router";

import { LoginPage } from "./login-page";

function setup() {
  const router = createTestRouter(<LoginPage />);
  return { user: userEvent.setup(), location: router.location, ...render(router.element) };
}

const submit = () => screen.getByRole("button", { name: "로그인하기" });

describe("LoginPage", () => {
  it("refuses to submit with empty credentials", async () => {
    const { location } = setup();
    await screen.findByRole("button", { name: "로그인하기" });

    expect(screen.getByRole("heading", { level: 1, name: "로그인" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "서비스 로그인" })).toBeInTheDocument();
    // SEED's `required` is aria-only — `useField` never sets the native attribute, so the
    // browser enforces nothing and this form used to navigate away with both fields blank.
    expect(submit()).toBeDisabled();
    expect(location()).toBe("/");
  });

  it("still refuses when only one field is filled", async () => {
    const { user } = setup();
    await screen.findByRole("button", { name: "로그인하기" });

    await user.type(screen.getByLabelText("이메일"), "karrot@example.com");
    expect(submit()).toBeDisabled();
  });

  it("submits once both fields are filled", async () => {
    const { user, location } = setup();
    await screen.findByRole("button", { name: "로그인하기" });

    await user.type(screen.getByLabelText("이메일"), "karrot@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "hunter2");
    expect(submit()).toBeEnabled();

    await user.click(submit());
    await waitFor(() => expect(location()).toBe("/profile"));
  });

  it("marks the password field so a manager can fill it", async () => {
    setup();
    await screen.findByRole("button", { name: "로그인하기" });
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("autocomplete", "current-password");
  });
});
