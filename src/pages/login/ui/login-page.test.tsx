import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DEMO_SESSION } from "@/entities/session";

import { queryKeys } from "@/shared/api";
import { createTestRouter } from "@/shared/lib/test-router";

import { LoginPage } from "./login-page";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(queryKeys.session.current, null);
  const router = createTestRouter(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>,
  );
  return {
    user: userEvent.setup(),
    location: router.location,
    queryClient,
    ...render(router.element),
  };
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

  it("explains an invalid email instead of relying on native validation", async () => {
    const { user, location } = setup();
    const email = await screen.findByLabelText("이메일");

    await user.type(email, "not-an-email");
    await user.type(screen.getByLabelText("비밀번호"), "hunter2");
    expect(email.closest("form")).toHaveAttribute("novalidate");

    await user.click(submit());

    expect(await screen.findByText("올바른 이메일 주소를 입력해 주세요.")).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(location()).toBe("/");
  });

  it("submits once both fields are filled", async () => {
    const { user, location, queryClient } = setup();
    await screen.findByRole("button", { name: "로그인하기" });

    await user.type(screen.getByLabelText("이메일"), "karrot@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "hunter2");
    expect(submit()).toBeEnabled();

    await user.click(submit());
    await waitFor(() => expect(location()).toBe("/profile"));
    expect(queryClient.getQueryData(queryKeys.session.current)).toEqual(DEMO_SESSION);
  });

  it("marks the password field so a manager can fill it", async () => {
    setup();
    await screen.findByRole("button", { name: "로그인하기" });
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("autocomplete", "current-password");
  });
});
