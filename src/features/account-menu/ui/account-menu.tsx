import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import { Avatar } from "seed-design/ui/avatar";
import { List, ListButtonItem } from "seed-design/ui/list";
import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "seed-design/ui/menu";

import { Icon, IconChevronDown, IconLogout, IconUser } from "@/shared/ui";

export interface AccountMenuProps {
  location: "header" | "sidebar";
}

/**
 * A single account entry point shared by the compact header and full side navigation.
 * The starter has no session API, so the displayed identity is demo data; signing out
 * navigates to the existing login blueprint without inventing client-side auth state.
 */
export function AccountMenu({ location }: AccountMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const name = t("account.name");
  const email = t("account.email");
  const menuLabel = t("account.openMenu", { name });
  const inSidebar = location === "sidebar";

  return (
    <MenuRoot size="responsive" placement={inSidebar ? "right-end" : "bottom-end"}>
      {inSidebar ? (
        <List>
          <MenuTrigger asChild>
            <ListButtonItem
              title={name}
              detail={<span className="hidden xl:block">{email}</span>}
              prefix={
                <Avatar
                  aria-hidden="true"
                  className="shrink-0"
                  fallback={name.slice(0, 1)}
                  size="36"
                />
              }
              suffix={<Icon svg={<IconChevronDown />} />}
              aria-label={menuLabel}
            />
          </MenuTrigger>
        </List>
      ) : (
        <MenuTrigger asChild>
          <ActionButton
            type="button"
            size="xsmall"
            variant="ghost"
            className="md:hidden"
            aria-label={menuLabel}
          >
            <Icon svg={<IconUser />} />
            <span className="hidden sm:inline">{name}</span>
          </ActionButton>
        </MenuTrigger>
      )}

      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>{t("account.menu")}</MenuGroupLabel>
          <MenuItem
            label={t("account.profile")}
            prefixIcon={<IconUser />}
            onClick={() => void navigate({ to: "/profile" })}
          />
        </MenuGroup>
        <MenuGroup>
          <MenuItem
            label={t("account.signOut")}
            prefixIcon={<IconLogout />}
            onClick={() => void navigate({ to: "/login" })}
          />
        </MenuGroup>
      </MenuContent>
    </MenuRoot>
  );
}
