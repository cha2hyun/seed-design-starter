import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { StateMessage } from "@/shared/ui";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <StateMessage
      title={t("state.notFound.title")}
      description={t("state.notFound.description")}
      action={
        <ActionButton variant="neutralWeak" size="medium" asChild>
          <Link to="/">{t("action.goHome")}</Link>
        </ActionButton>
      }
    />
  );
}
