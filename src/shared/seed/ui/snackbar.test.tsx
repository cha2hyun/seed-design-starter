import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Snackbar, SnackbarProvider } from "./snackbar";

describe("Snackbar", () => {
  it("uses the caller-provided accessible close label", () => {
    render(
      <SnackbarProvider>
        <Snackbar message="저장했어요" closeLabel="알림 닫기" />
      </SnackbarProvider>,
    );

    expect(screen.getByRole("button", { name: "알림 닫기" })).toBeInTheDocument();
  });
});
