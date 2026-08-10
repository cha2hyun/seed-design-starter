import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { List, ListButtonItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";

import { NAV_ITEMS, type NavItemTo } from "@/shared/config";
import { Icon, IconHome, IconSettings } from "@/shared/ui";

const NAV_ICONS: Record<NavItemTo, typeof IconHome> = {
  "/": IconHome,
  "/settings": IconSettings,
};

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside
      className="hidden shrink-0 flex-col border-r border-stroke-neutral-muted bg-bg-layer-default md:flex"
      aria-label={t("nav.side")}
      // seed-escape: SEED Layout defines Side Navigation but ships no width token
      style={{ width: "var(--width-sidebar)" }}
    >
      <div className="flex flex-col gap-x2 py-x4">
        <ListHeader as="h2" variant="mediumWeak">
          {t("nav.primary")}
        </ListHeader>
        <List>
          {NAV_ITEMS.map((item) => {
            const Glyph = NAV_ICONS[item.to];
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

            return (
              <ListButtonItem
                key={item.to}
                highlighted={active}
                title={t(item.labelKey)}
                prefix={<Icon svg={<Glyph />} />}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  void navigate({ to: item.to });
                }}
              />
            );
          })}
        </List>
      </div>
    </aside>
  );
}
