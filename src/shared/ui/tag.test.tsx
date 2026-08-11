import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tag, type TagTone } from "./tag";

const TONES: TagTone[] = ["neutral", "brand", "warning", "positive"];

describe("Tag", () => {
  it("is not a button", () => {
    render(<Tag>거래완료</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("거래완료").parentElement?.tagName).toBe("SPAN");
  });

  it.each(TONES)("uses SEED's weak %s badge recipe", (tone) => {
    render(<Tag tone={tone}>label</Tag>);
    const badge = screen.getByText("label").parentElement;

    expect(badge).toHaveClass("seed-badge__root--variant_weak");
    expect(badge).toHaveClass(`seed-badge__root--tone_${tone}-variant_weak`);
  });

  it("uses the medium size and still accepts a className", () => {
    render(<Tag className="mt-x2">label</Tag>);
    const badge = screen.getByText("label").parentElement;

    expect(badge).toHaveClass("seed-badge__root--size_medium");
    expect(badge).toHaveClass("shrink-0");
    expect(badge).toHaveClass("mt-x2");
  });
});
