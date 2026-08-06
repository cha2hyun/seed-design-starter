import { useTranslation } from "react-i18next";

import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";

import { type Language, LANGUAGES } from "@/shared/config";
import { useLanguage } from "@/shared/i18n";

export function LanguagePicker() {
  const { t } = useTranslation("settings");
  const { language, setLanguage } = useLanguage();

  return (
    <SegmentedControl
      aria-label={t("language.label")}
      value={language}
      onValueChange={(value) => setLanguage(value as Language)}
    >
      {LANGUAGES.map((code) => (
        <SegmentedControlItem key={code} value={code}>
          {t(`language.${code}`)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
