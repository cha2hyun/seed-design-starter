import { useLinkProps, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { List, ListLinkItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";

import { AccountMenu } from "@/features/account-menu";

import { NAV_GROUPS, type NavItemTo } from "@/shared/config";
import { Icon, IconDashboard, IconHome, IconSettings, IconWizard } from "@/shared/ui";

const NAV_ICONS: Record<NavItemTo, typeof IconHome> = {
  "/": IconHome,
  "/dashboard": IconDashboard,
  "/wizard": IconWizard,
  "/settings": IconSettings,
};

export function AppSidebar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    // `nav`, not `aside`: a complementary landmark keeps this out of the navigation list
    // assistive tech offers, and it is the app's primary navigation.
    <nav
      className="hidden shrink-0 flex-col border-r border-stroke-neutral-muted bg-bg-layer-default md:flex"
      aria-label={t("nav.side")}
      // seed-escape: SEED Layout defines Side Navigation but ships no width token, and
      // `w-sidebar` reads the project `--width-*` namespace that seed-lockin/token-only refuses
      style={{ width: "var(--width-sidebar)" }}
    >
      <div
        className="sticky top-x16 flex flex-col overflow-y-auto py-x4"
        // seed-escape: the side navigation account entry stays at the viewport bottom;
        // SEED has no viewport-relative height token for the space below the x16 header.
        style={{ height: "calc(100dvh - var(--seed-dimension-x16))" }}
      >
        <div className="flex flex-col gap-x4">
          {NAV_GROUPS.map((group) => (
            <div key={group.labelKey} className="flex flex-col gap-x2">
              <ListHeader as="h2" variant="mediumWeak">
                {t(group.labelKey)}
              </ListHeader>
              <List>
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={t(item.labelKey)}
                    active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)}
                  />
                ))}
              </List>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-stroke-neutral-muted pt-x3">
          <AccountMenu location="sidebar" />
        </div>
      </div>
    </nav>
  );
}

/**
 * An anchor, not a button. A button is not a link to assistive tech and offers none of the
 * middle-click / open-in-new-tab affordances users expect from navigation, and the router's
 * `defaultPreload: "intent"` only ever fires for real link props. `ListLinkItem` renders its
 * own `<a>` and does not take `asChild`, so the router's props are spread onto it instead.
 */
function SidebarLink({ to, label, active }: { to: NavItemTo; label: string; active: boolean }) {
  const linkProps = useLinkProps({ to });
  const Glyph = NAV_ICONS[to];

  return (
    <ListLinkItem
      {...linkProps}
      highlighted={active}
      title={label}
      prefix={<Icon svg={<Glyph />} />}
      aria-current={active ? "page" : undefined}
    />
  );
}
