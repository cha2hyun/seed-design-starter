import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsPage } from "./settings-page";

describe("SettingsPage", () => {
  it("identifies its title as the page heading", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "설정" })).toBeInTheDocument();
  });
});
