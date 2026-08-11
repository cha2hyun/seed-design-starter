import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconWallet } from "@/shared/ui";

import { StatCard } from "./stat-card";

const base = {
  icon: <IconWallet />,
  label: "총 누적 거래액",
  value: "₩2,870,000",
  caption: "지난 기간 대비",
};

describe("StatCard", () => {
  it("renders label, value and delta", () => {
    render(<StatCard {...base} change="+9.4%" direction="up" changeLabel="9.4% 상승" />);
    expect(screen.getByText("총 누적 거래액")).toBeInTheDocument();
    expect(screen.getByText("₩2,870,000")).toBeInTheDocument();
    expect(screen.getByText("+9.4%")).toBeInTheDocument();
  });

  it("does not give the headline figure tabular digits", () => {
    render(<StatCard {...base} change="+9.4%" direction="up" changeLabel="9.4% 상승" />);
    // `tabular-nums` widens every digit to a `0`, which reads loose at display size. It is
    // for columns of numbers that must align, not for a standalone headline.
    expect(screen.getByText("₩2,870,000").className).not.toContain("tabular-nums");
  });

  it.each([
    ["up", "text-fg-positive"],
    ["down", "text-fg-critical"],
  ] as const)("colours a %s delta with %s", (direction, expected) => {
    render(<StatCard {...base} change="-1.8%" direction={direction} changeLabel="1.8% 하락" />);
    expect(screen.getByText("-1.8%").parentElement?.className).toContain(expected);
  });

  it("states the direction in words, not colour alone", () => {
    render(<StatCard {...base} change="-1.8%" direction="down" changeLabel="1.8% 하락" />);
    // The arrow and the colour are both invisible to a screen reader.
    expect(screen.getByText("1.8% 하락")).toBeInTheDocument();
    expect(screen.getByText("-1.8%")).toHaveAttribute("aria-hidden", "true");
  });
});
