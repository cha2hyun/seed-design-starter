export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "ko";

/** Primary app destinations shared by Side Navigation and the mobile header menu. */
export const NAV_ITEMS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/settings", labelKey: "nav.settings" },
] as const;
export type NavItemTo = (typeof NAV_ITEMS)[number]["to"];

/** Public GitHub repository for this starter. */
export const REPO_URL = "https://github.com/cha2hyun/seed-design-starter";

/** Mirrors SEED's `data-seed-color-mode` attribute values. */
export const COLOR_MODES = ["system", "light-only", "dark-only"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
export const DEFAULT_COLOR_MODE: ColorMode = "system";

export const STORAGE_KEYS = {
  language: "seed-starter:language",
  colorMode: "seed-starter:color-mode",
} as const;

export const IS_DEV = import.meta.env.DEV;

/** Values from `env/.env*` (Vite `envDir`). Only `VITE_*` keys reach the client. */
export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  appName: import.meta.env.VITE_APP_NAME ?? "seed-design-starter",
} as const;
