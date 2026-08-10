import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { type Language, LANGUAGES } from "@/shared/config";
import { useLanguage } from "@/shared/i18n";

const LANGUAGE_LABEL: Record<Language, string> = {
  ko: "KO",
  en: "EN",
};

function nextLanguage(language: Language): Language {
  const index = LANGUAGES.indexOf(language);
  return LANGUAGES[(index + 1) % LANGUAGES.length] ?? LANGUAGES[0];
}

export function LanguagePicker() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <ActionButton
      type="button"
      size="xsmall"
      variant="neutralWeak"
      aria-label={`${t("preferences.language.label")}: ${LANGUAGE_LABEL[language]}`}
      onClick={() => setLanguage(nextLanguage(language))}
    >
      {LANGUAGE_LABEL[language]}
    </ActionButton>
  );
}
