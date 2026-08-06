export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "ko";

/** Mirrors SEED's `data-seed-color-mode` attribute values. */
export const COLOR_MODES = ["system", "light-only", "dark-only"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
export const DEFAULT_COLOR_MODE: ColorMode = "system";

export const STORAGE_KEYS = {
  language: "seed-starter:language",
  colorMode: "seed-starter:color-mode",
} as const;

export const IS_DEV = import.meta.env.DEV;
