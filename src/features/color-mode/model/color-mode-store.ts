import { create } from "zustand";
import { persist } from "zustand/middleware";

import { COLOR_MODES, type ColorMode, DEFAULT_COLOR_MODE, STORAGE_KEYS } from "@/shared/config";

interface ColorModeState {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
}

function applyToDocument(colorMode: ColorMode): void {
  document.documentElement.setAttribute("data-seed-color-mode", colorMode);
}

function isColorMode(value: unknown): value is ColorMode {
  return typeof value === "string" && COLOR_MODES.includes(value as ColorMode);
}

export const useColorModeStore = create<ColorModeState>()(
  persist(
    (set) => ({
      colorMode: DEFAULT_COLOR_MODE,
      setColorMode: (colorMode) => {
        applyToDocument(colorMode);
        set({ colorMode });
      },
    }),
    {
      name: STORAGE_KEYS.colorMode,
      merge: (persistedState, currentState) => {
        const persistedColorMode = (persistedState as Partial<ColorModeState> | undefined)
          ?.colorMode;

        return {
          ...currentState,
          colorMode: isColorMode(persistedColorMode) ? persistedColorMode : DEFAULT_COLOR_MODE,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyToDocument(state.colorMode);
      },
    },
  ),
);
