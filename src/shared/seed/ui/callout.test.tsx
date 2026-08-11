import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DismissibleCallout } from "./callout";

describe("DismissibleCallout", () => {
  it("uses the caller-provided accessible close label", () => {
    render(<DismissibleCallout description="새 소식이 있어요" closeLabel="알림 닫기" />);

    expect(screen.getByRole("button", { name: "알림 닫기" })).toBeInTheDocument();
  });
});
