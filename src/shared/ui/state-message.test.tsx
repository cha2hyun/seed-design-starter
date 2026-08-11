import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StateMessage } from "./state-message";

describe("StateMessage", () => {
  it("keeps an embedded state's title as a paragraph by default", () => {
    render(<StateMessage title="표시할 항목이 없어요" />);

    const title = screen.getByText("표시할 항목이 없어요");

    expect(title.tagName).toBe("P");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it.each(["h1", "h2", "h3", "h4", "h5", "h6"] as const)(
    "renders its title as %s when requested",
    (headingAs) => {
      render(<StateMessage title="페이지 상태" headingAs={headingAs} />);

      const level = Number(headingAs.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;

      expect(screen.getByRole("heading", { level, name: "페이지 상태" })).toBeInTheDocument();
    },
  );

  it("forwards live-region attributes to the state container", () => {
    render(<StateMessage title="불러오지 못했어요" role="alert" aria-live="assertive" />);

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("alert")).toHaveTextContent("불러오지 못했어요");
  });
});
