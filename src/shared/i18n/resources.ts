import enCommon from "./locales/en/common.json";
import enProduct from "./locales/en/product.json";
import enSettings from "./locales/en/settings.json";
import koCommon from "./locales/ko/common.json";
import koProduct from "./locales/ko/product.json";
import koSettings from "./locales/ko/settings.json";

export const DEFAULT_NAMESPACE = "common";

export const resources = {
  ko: { common: koCommon, product: koProduct, settings: koSettings },
  en: { common: enCommon, product: enProduct, settings: enSettings },
} as const;

export type AppResources = (typeof resources)["ko"];
