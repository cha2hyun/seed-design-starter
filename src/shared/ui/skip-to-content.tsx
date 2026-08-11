import { useTranslation } from "react-i18next";

/** Target for the skip link; the root layout puts this on its `<main>`. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * First tab stop on every page. The side navigation carries six links and the header three
 * controls, so without this a keyboard user traverses all of them again on every navigation
 * before reaching the content they came for.
 *
 * Visible only while focused: `sr-only` lifts it out of the layout, and `focus:not-sr-only`
 * restores it in place over the header.
 */
export function SkipToContent() {
  const { t } = useTranslation();

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-x2 focus:left-x2 focus:z-20 focus:rounded-r3 focus:bg-bg-brand-solid focus:py-x2 focus:px-x4 focus:t4-bold focus:text-palette-static-white"
    >
      {t("nav.skipToContent")}
    </a>
  );
}
