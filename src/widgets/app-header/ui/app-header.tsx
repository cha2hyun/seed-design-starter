import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { ColorModePicker } from "@/features/color-mode";
import { LanguagePicker } from "@/features/language";

import { NAV_ITEMS, type NavItemTo } from "@/shared/config";
import { cn } from "@/shared/lib";
import { Icon, IconMenu, IconX, shellInsetClassName } from "@/shared/ui";

export function AppHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-x0_5 z-10 border-b border-stroke-neutral-muted bg-bg-layer-default">
      <div
        className={cn(
          shellInsetClassName,
          "flex items-center justify-between gap-x4 py-x3 md:gap-x8 md:py-x4",
        )}
      >
        <Link to="/" className="t6-bold text-fg-neutral" onClick={() => setMenuOpen(false)}>
          {t("appName")}
        </Link>

        <div className="flex items-center gap-x2">
          <LanguagePicker />
          <ColorModePicker />
          <ActionButton
            type="button"
            size="xsmall"
            variant="ghost"
            layout="iconOnly"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="app-mobile-nav"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon svg={menuOpen ? <IconX /> : <IconMenu />} />
          </ActionButton>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="app-mobile-nav"
          className="border-t border-stroke-neutral-muted md:hidden"
          aria-label={t("nav.primary")}
        >
          <div className={cn(shellInsetClassName, "flex flex-col gap-x1 py-x3")}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={t(item.labelKey)}
                className="w-full"
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function NavLink({
  to,
  label,
  className,
  onNavigate,
}: {
  to: NavItemTo;
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-r2 py-x2 px-x3 t4-medium text-fg-neutral-muted",
        "hover:bg-bg-neutral-weak",
        className,
      )}
      activeProps={{ className: "bg-bg-neutral-weak text-fg-neutral" }}
      activeOptions={{ exact: to === "/" }}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}
