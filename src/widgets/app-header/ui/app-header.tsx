import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib";

const NAV_ITEMS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/settings", labelKey: "nav.settings" },
] as const;

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-x0_5 z-10 border-b border-stroke-neutral-muted bg-bg-layer-default">
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-x4 py-x4 px-x5">
        <Link to="/" className="t6-bold text-fg-neutral">
          {t("appName")}
        </Link>

        <nav className="flex items-center gap-x1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-r2 py-x2 px-x3 t4-medium text-fg-neutral-muted",
                "hover:bg-bg-neutral-weak",
              )}
              activeProps={{ className: "bg-bg-neutral-weak text-fg-neutral" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
