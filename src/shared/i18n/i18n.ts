import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LANGUAGE, type Language, LANGUAGES, STORAGE_KEYS } from "@/shared/config";

import { DEFAULT_NAMESPACE, resources } from "./resources";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...LANGUAGES],
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: Object.keys(resources[DEFAULT_LANGUAGE]),
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEYS.language,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

i18n.on("languageChanged", () => {
  document.documentElement.lang = getCurrentLanguage();
});

// Resources are inline, so init() resolves synchronously and has already emitted
// `languageChanged` by the time the listener above is attached. Without this the attribute
// keeps the `lang="ko"` hardcoded in index.html even when the detector resolved English.
document.documentElement.lang = getCurrentLanguage();

export function changeLanguage(language: Language): void {
  void i18n.changeLanguage(language);
}

export function getCurrentLanguage(): Language {
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  return LANGUAGES.includes(resolved as Language) ? (resolved as Language) : DEFAULT_LANGUAGE;
}

export { i18n };
