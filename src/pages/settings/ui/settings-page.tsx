import { useTranslation } from "react-i18next";

import { Callout } from "seed-design/ui/callout";

import { PageSection } from "@/shared/ui";

export function SettingsPage() {
  const { t } = useTranslation("settings");

  return (
    <div className="flex flex-col gap-x8">
      <PageSection title={t("title")} description={t("description")}>
        <Callout tone="informative" description={t("preferencesInHeader")} />
      </PageSection>
    </div>
  );
}
