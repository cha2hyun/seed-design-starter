import { useEffect } from "react";

import { useTranslation } from "react-i18next";

/**
 * Sets `document.title` for the current screen.
 *
 * `index.html` ships one hard-coded title for every route, so the tab, the history entry and
 * the bookmark all read the same regardless of where the user is — and a screen reader
 * announces that same string on every navigation. Pages pass their own translated title, so
 * this re-runs when the language changes too.
 */
export function useDocumentTitle(title: string): void {
  const { t } = useTranslation();
  const appName = t("appName");

  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${appName}` : appName;
    return () => {
      document.title = previous;
    };
  }, [title, appName]);
}
