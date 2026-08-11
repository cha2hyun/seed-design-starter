import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { AccountMenu } from "@/features/account-menu";
import { ColorModePicker } from "@/features/color-mode";
import { LanguagePicker } from "@/features/language";

import { NAV_GROUPS, type NavItemTo } from "@/shared/config";
import { cn } from "@/shared/lib";
import { Icon, IconMenu, IconX, shellInsetClassName } from "@/shared/ui";

export function AppHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky z-10 border-b border-stroke-neutral-muted bg-bg-layer-default"
      // seed-escape: a sticky header pins flush to the viewport edge, and SEED's dimension
      // scale starts at x0_5 (2px), so no token resolves to `top: 0` (`top-0` emits nothing)
      style={{ top: 0 }}
    >
      <div
        className={cn(
          shellInsetClassName,
          "flex items-center justify-between gap-x2 py-x3 sm:gap-x4 md:gap-x8 md:py-x4",
        )}
      >
        <Link
          to="/"
          className="t5-bold text-fg-neutral sm:t6-bold"
          onClick={() => setMenuOpen(false)}
        >
          {t("appName")}
        </Link>

        <div className="flex items-center gap-x1 sm:gap-x2">
          <LanguagePicker />
          <ColorModePicker />
          <AccountMenu location="header" />
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
          <div
            // gap-x4 between groups, gap-x1 inside one: the group label only reads as a
            // heading if it sits closer to its own items than to the group above.
            className={cn(
              shellInsetClassName,
              "flex flex-col gap-x4 overflow-y-auto py-x3 sm:py-x4",
            )}
            // seed-escape: the open menu is pinned inside the sticky header, so it has to cap
            // against the viewport; SEED has no viewport-relative dimension to cap with
            style={{ maxHeight: "60vh" }}
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.labelKey} className="flex flex-col gap-x1">
                <p className="py-x1 px-x3 t2-bold text-fg-neutral-muted">{t(group.labelKey)}</p>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    label={t(item.labelKey)}
                    className="w-full"
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
              </div>
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
