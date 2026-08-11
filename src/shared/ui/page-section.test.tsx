import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageSection } from "./page-section";

describe("PageSection", () => {
  it("uses an h2 for a regular section by default", () => {
    render(<PageSection title="최근 거래">내용</PageSection>);

    expect(screen.getByRole("heading", { level: 2, name: "최근 거래" })).toBeInTheDocument();
  });

  it("lets a screen identify its single page heading", () => {
    render(
      <PageSection title="대시보드" headingAs="h1">
        내용
      </PageSection>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "대시보드" })).toBeInTheDocument();
  });
});
