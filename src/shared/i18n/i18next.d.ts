import type { AppResources, DEFAULT_NAMESPACE } from "./resources";

/**
 * Makes `t("product:list.title")` a compile error when the key does not exist.
 * Korean is the source of truth for the key shape.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE;
    resources: AppResources;
    returnNull: false;
  }
}
