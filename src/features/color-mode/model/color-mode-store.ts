import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type ColorMode, DEFAULT_COLOR_MODE, STORAGE_KEYS } from "@/shared/config";

interface ColorModeState {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
}

function applyToDocument(colorMode: ColorMode): void {
  document.documentElement.setAttribute("data-seed-color-mode", colorMode);
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
      onRehydrateStorage: () => (state) => {
        if (state) applyToDocument(state.colorMode);
      },
    },
  ),
);
