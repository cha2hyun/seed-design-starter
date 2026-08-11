import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { useDocumentTitle } from "@/shared/lib";
import { StateMessage } from "@/shared/ui";

/**
 * Router-level error boundary. TanStack Router owns the boundary itself, so this
 * only renders the fallback — and unlike a hand-rolled boundary it is torn down on
 * navigation, meaning a failed route does not stay failed after the user leaves it.
 */
export function ErrorPage({ reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  useDocumentTitle(t("state.error.title"));
  const router = useRouter();

  const handleRetry = () => {
    reset();
    void router.invalidate();
  };

  return (
    <StateMessage
      role="alert"
      title={t("state.error.title")}
      description={t("state.error.description")}
      headingAs="h1"
      action={
        <ActionButton variant="neutralWeak" size="medium" onClick={handleRetry}>
          {t("action.retry")}
        </ActionButton>
      }
    />
  );
}
