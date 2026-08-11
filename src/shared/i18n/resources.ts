import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enLogin from "./locales/en/login.json";
import enProduct from "./locales/en/product.json";
import enProfile from "./locales/en/profile.json";
import enSettings from "./locales/en/settings.json";
import enWizard from "./locales/en/wizard.json";
import koCommon from "./locales/ko/common.json";
import koDashboard from "./locales/ko/dashboard.json";
import koLogin from "./locales/ko/login.json";
import koProduct from "./locales/ko/product.json";
import koProfile from "./locales/ko/profile.json";
import koSettings from "./locales/ko/settings.json";
import koWizard from "./locales/ko/wizard.json";

export const DEFAULT_NAMESPACE = "common";

export const resources = {
  ko: {
    common: koCommon,
    dashboard: koDashboard,
    login: koLogin,
    product: koProduct,
    profile: koProfile,
    settings: koSettings,
    wizard: koWizard,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    login: enLogin,
    product: enProduct,
    profile: enProfile,
    settings: enSettings,
    wizard: enWizard,
  },
} as const;

export type AppResources = (typeof resources)["ko"];
