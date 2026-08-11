import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { WizardPage } from "./wizard-page";

/** The wizard renders no links and reads no route, so it needs no router harness. */
const setup = () => ({ user: userEvent.setup(), ...render(<WizardPage />) });

const nextButton = () => screen.getByRole("button", { name: /다음|제출하기/ });

async function completeAccountStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/이름/), "당근이");
  await user.type(screen.getByLabelText(/이메일/), "karrot@example.com");
  await user.click(nextButton());
}

describe("WizardPage", () => {
  it("blocks the first step until both fields are filled", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1, name: "단계별 폼" })).toBeInTheDocument();
    expect(nextButton()).toBeDisabled();
  });

  it("rejects a malformed email instead of silently doing nothing", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/이름/), "당근이");
    await user.type(screen.getByLabelText(/이메일/), "abc");

    // Regression guard: `type="email"` used to abort submission before the handler ran, so
    // the button looked enabled and pressing it produced no visible result at all.
    expect(nextButton()).toBeDisabled();
    expect(screen.getByText(/올바르지 않아요/)).toBeInTheDocument();
  });

  it("accepts a well-formed email and advances", async () => {
    const { user } = setup();
    await completeAccountStep(user);

    expect(screen.getByRole("checkbox", { name: /알림/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /약관/ })).toBeInTheDocument();
  });

  it("will not leave the preferences step until terms are accepted", async () => {
    const { user } = setup();
    await completeAccountStep(user);

    // Previously this step advanced regardless, stranding the user on a review step whose
    // Submit was permanently disabled — and not focusable, so unreachable by keyboard.
    expect(nextButton()).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: /약관/ }));
    expect(nextButton()).toBeEnabled();
  });

  it("shows the entered values on the review step and submits", async () => {
    const { user } = setup();
    await completeAccountStep(user);
    await user.click(screen.getByRole("checkbox", { name: /약관/ }));
    await user.click(nextButton());

    expect(screen.getByRole("heading", { level: 2, name: /입력 정보 확인/ })).toBeInTheDocument();
    expect(screen.getByText("karrot@example.com")).toBeInTheDocument();

    await user.click(nextButton());
    expect(screen.getByText(/제출이 완료됐어요/)).toBeInTheDocument();
  });

  it("restarts from an empty first step", async () => {
    const { user } = setup();
    await completeAccountStep(user);
    await user.click(screen.getByRole("checkbox", { name: /약관/ }));
    await user.click(nextButton());
    await user.click(nextButton());
    await user.click(screen.getByRole("button", { name: /처음부터 다시/ }));

    expect(screen.getByLabelText(/이름/)).toHaveValue("");
    expect(nextButton()).toBeDisabled();
  });

  it("marks the current step and only the current step", async () => {
    const { user } = setup();
    const current = () => screen.getByRole("listitem", { current: "step" });

    expect(current()).toHaveTextContent("계정 정보");
    await completeAccountStep(user);
    expect(current()).toHaveTextContent("환경 설정");
  });
});
