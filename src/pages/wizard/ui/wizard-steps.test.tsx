import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WizardSteps } from "./wizard-steps";

const LABELS = ["계정 정보", "환경 설정", "최종 확인"];

const renderAt = (currentIndex: number) =>
  render(
    <WizardSteps
      labels={LABELS}
      currentIndex={currentIndex}
      listLabel={`3단계 중 ${currentIndex + 1}단계`}
      completedLabel="완료됨"
      currentLabel="진행 중"
    />,
  );

describe("WizardSteps", () => {
  it("marks exactly one step as current", () => {
    renderAt(1);
    const current = screen.getAllByRole("listitem").filter((li) => li.ariaCurrent === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("환경 설정");
  });

  it("never puts two typography weights on the same label", () => {
    renderAt(1);
    for (const label of LABELS) {
      const className = screen.getByText(label, { selector: "span" }).className;
      // `cn` is plain clsx, so `t2-medium t2-bold` keeps both and Tailwind's source order
      // decides the winner — which silently left the current step no heavier than the rest.
      expect(className.includes("t2-bold") && className.includes("t2-medium")).toBe(false);
    }
  });

  it("renders the current label bold and the others medium", () => {
    renderAt(1);
    expect(screen.getByText("환경 설정", { selector: "span" }).className).toContain("t2-bold");
    expect(screen.getByText("최종 확인", { selector: "span" }).className).toContain("t2-medium");
  });

  it("uses a foreground that contrasts with the brand fill", () => {
    renderAt(1);
    const node = screen.getByText("2");
    // Not `fg-brand`: it resolves to the same carrot as the brand background in dark mode.
    expect(node.className).toContain("text-fg-brand-contrast");
    expect(node.className).not.toMatch(/text-fg-brand(?!-contrast)/);
  });

  it("swaps the number for a tick once a step is behind the cursor", () => {
    renderAt(2);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("완료됨")).toHaveLength(2);
  });

  it("names the list for assistive tech", () => {
    renderAt(0);
    expect(screen.getByRole("list", { name: "3단계 중 1단계" })).toBeInTheDocument();
  });
});
