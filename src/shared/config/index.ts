export const LANGUAGES = ["ko", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "ko";

/**
 * Destinations for Side Navigation and the mobile header menu, in render order.
 *
 * Grouped on purpose: the starter's own screens come first, and the blueprint screens
 * exist only to demonstrate SEED components. Flattening the two reads as if `/login`
 * were somewhere you navigate to mid-session, and buries the product flow.
 */
export const NAV_GROUPS = [
  {
    labelKey: "nav.group.app",
    items: [
      { to: "/", labelKey: "nav.home" },
      { to: "/settings", labelKey: "nav.settings" },
    ],
  },
  {
    labelKey: "nav.group.blueprint",
    items: [
      { to: "/dashboard", labelKey: "nav.dashboard" },
      { to: "/wizard", labelKey: "nav.wizard" },
      { to: "/profile", labelKey: "nav.profile" },
      { to: "/login", labelKey: "nav.login" },
    ],
  },
] as const;

export type NavItemTo = (typeof NAV_GROUPS)[number]["items"][number]["to"];

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
