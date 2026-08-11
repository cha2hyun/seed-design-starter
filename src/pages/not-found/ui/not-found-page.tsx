import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { useDocumentTitle } from "@/shared/lib";
import { StateMessage } from "@/shared/ui";

export function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("state.notFound.title"));

  return (
    <StateMessage
      title={t("state.notFound.title")}
      description={t("state.notFound.description")}
      headingAs="h1"
      action={
        <ActionButton variant="neutralWeak" size="medium" asChild>
          <Link to="/">{t("action.goHome")}</Link>
        </ActionButton>
      }
    />
  );
}
