import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_COLOR_MODE, STORAGE_KEYS } from "@/shared/config";

import { useColorModeStore } from "./color-mode-store";

describe("useColorModeStore", () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEYS.colorMode);
    useColorModeStore.getState().setColorMode(DEFAULT_COLOR_MODE);
  });

  it("falls back to system when persisted state contains an unknown mode", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.colorMode,
      JSON.stringify({ state: { colorMode: "sepia" }, version: 0 }),
    );

    await useColorModeStore.persist.rehydrate();

    expect(useColorModeStore.getState().colorMode).toBe("system");
    expect(document.documentElement).toHaveAttribute("data-seed-color-mode", "system");
  });
});
