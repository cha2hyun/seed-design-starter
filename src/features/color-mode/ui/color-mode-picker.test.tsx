import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_COLOR_MODE, STORAGE_KEYS } from "@/shared/config";

import { useColorModeStore } from "../model/color-mode-store";
import { ColorModePicker } from "./color-mode-picker";

const originalMatchMedia = window.matchMedia.bind(window);

function installColorSchemeMedia(initiallyDark = false) {
  let matches = initiallyDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );

  return {
    setDark(next: boolean) {
      matches = next;
      const event = {
        matches: next,
        media: "(prefers-color-scheme: dark)",
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

describe("ColorModePicker", () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEYS.colorMode);
    useColorModeStore.getState().setColorMode(DEFAULT_COLOR_MODE);
  });

  afterEach(() => {
    vi.stubGlobal("matchMedia", originalMatchMedia);
  });

  it("offers system, light and dark as explicit choices", async () => {
    installColorSchemeMedia();
    const user = userEvent.setup();
    render(<ColorModePicker />);

    await user.click(screen.getByRole("button", { name: "화면 모드: 시스템 설정 (라이트)" }));

    expect(screen.getByRole("menuitemradio", { name: "시스템 설정" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("menuitemradio", { name: "라이트" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "다크" })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitemradio", { name: "다크" }));

    expect(useColorModeStore.getState().colorMode).toBe("dark-only");
    expect(document.documentElement).toHaveAttribute("data-seed-color-mode", "dark-only");
    expect(screen.getByRole("button", { name: "화면 모드: 다크" })).toBeInTheDocument();
  });

  it("tracks system appearance changes while system mode is selected", () => {
    const media = installColorSchemeMedia();
    render(<ColorModePicker />);

    expect(
      screen.getByRole("button", { name: "화면 모드: 시스템 설정 (라이트)" }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-seed-user-color-scheme", "light");

    act(() => media.setDark(true));

    expect(
      screen.getByRole("button", { name: "화면 모드: 시스템 설정 (다크)" }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-seed-user-color-scheme", "dark");
  });
});
