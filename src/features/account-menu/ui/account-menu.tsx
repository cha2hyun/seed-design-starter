import { useCallback, useEffect, useState } from "react";

import { useLinkProps, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import { Avatar } from "seed-design/ui/avatar";
import { List, ListButtonItem, ListLinkItem } from "seed-design/ui/list";
import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuRoot,
  MenuTrigger,
} from "seed-design/ui/menu";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";

import { useLogoutMutation, useSessionQuery } from "@/entities/session";

import { Icon, IconChevronDown, IconLogin, IconLogout, IconUser } from "@/shared/ui";

export interface AccountMenuProps {
  location: "header" | "sidebar";
  onOpenChange?: (open: boolean) => void;
}

/** A single account entry point shared by the compact header and full side navigation. */
export function AccountMenu({ location, onOpenChange }: AccountMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: session } = useSessionQuery();
  const logoutMutation = useLogoutMutation();
  const snackbar = useSnackbarAdapter();
  const inSidebar = location === "sidebar";
  const [menuOpen, setMenuOpen] = useState(false);
  const profileLinkProps = useLinkProps({ to: "/profile" });
  const loginLinkProps = useLinkProps({ to: "/login" });
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setMenuOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeWhenOwnerHides = () => {
      const ownerIsVisible = inSidebar ? desktopQuery.matches : !desktopQuery.matches;
      if (!ownerIsVisible) handleOpenChange(false);
    };

    closeWhenOwnerHides();
    desktopQuery.addEventListener("change", closeWhenOwnerHides);
    return () => desktopQuery.removeEventListener("change", closeWhenOwnerHides);
  }, [handleOpenChange, inSidebar, menuOpen]);

  if (!session) {
    const signIn = t("account.signIn");

    return inSidebar ? (
      <List>
        <ListLinkItem {...loginLinkProps} title={signIn} prefix={<Icon svg={<IconLogin />} />} />
      </List>
    ) : (
      <ActionButton asChild size="xsmall" variant="ghost" className="md:hidden">
        <a {...loginLinkProps} aria-label={signIn}>
          <Icon svg={<IconLogin />} />
          <span className="hidden sm:inline">{signIn}</span>
        </a>
      </ActionButton>
    );
  }

  const { name, email } = session.user;
  const menuLabel = t("account.openMenu", { name });

  return (
    <MenuRoot
      size="responsive"
      placement={inSidebar ? "right-end" : "bottom-end"}
      open={menuOpen}
      onOpenChange={handleOpenChange}
    >
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
          <MenuLinkItem
            {...profileLinkProps}
            label={t("account.profile")}
            prefixIcon={<IconUser />}
          />
        </MenuGroup>
        <MenuGroup>
          <MenuItem
            label={t("account.signOut")}
            prefixIcon={<IconLogout />}
            disabled={logoutMutation.isPending}
            onClick={() =>
              logoutMutation.mutate(undefined, {
                onSuccess: () => void navigate({ to: "/login" }),
                onError: () =>
                  snackbar.create({
                    render: () => (
                      <Snackbar
                        variant="critical"
                        message={t("account.signOutError")}
                        closeLabel={t("action.close")}
                      />
                    ),
                  }),
              })
            }
          />
        </MenuGroup>
      </MenuContent>
    </MenuRoot>
  );
}
