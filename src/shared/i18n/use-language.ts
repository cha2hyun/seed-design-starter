import { useTranslation } from "react-i18next";

import type { Language } from "@/shared/config";

import { changeLanguage, getCurrentLanguage } from "./i18n";

export interface UseLanguageResult {
  language: Language;
  setLanguage: (language: Language) => void;
}

/** Re-renders on `languageChanged` because it subscribes through `useTranslation`. */
export function useLanguage(): UseLanguageResult {
  useTranslation();

  return { language: getCurrentLanguage(), setLanguage: changeLanguage };
}
