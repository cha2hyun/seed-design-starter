import { useEffect, useSyncExternalStore } from "react";

import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "seed-design/ui/menu";

import { COLOR_MODES, type ColorMode } from "@/shared/config";
import { Icon, IconCheck, IconMoon, IconSun } from "@/shared/ui";

import { useColorModeStore } from "../model/color-mode-store";

type ExplicitColorMode = Extract<ColorMode, "light-only" | "dark-only">;
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function getPreferredColorMode(): ExplicitColorMode {
  if (typeof window === "undefined") return "light-only";
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark-only" : "light-only";
}

function subscribeToPreferredColorMode(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function usePreferredColorMode(): ExplicitColorMode {
  return useSyncExternalStore(
    subscribeToPreferredColorMode,
    getPreferredColorMode,
    () => "light-only",
  );
}

export interface ColorModePickerProps {
  onOpenChange?: (open: boolean) => void;
}

export function ColorModePicker({ onOpenChange }: ColorModePickerProps) {
  const { t } = useTranslation();
  const colorMode = useColorModeStore((state) => state.colorMode);
  const setColorMode = useColorModeStore((state) => state.setColorMode);
  const preferredColorMode = usePreferredColorMode();
  const explicitMode = colorMode === "system" ? preferredColorMode : colorMode;
  const ModeIcon = explicitMode === "light-only" ? IconSun : IconMoon;
  const currentModeLabel =
    colorMode === "system"
      ? `${t("preferences.colorMode.system")} (${t(`preferences.colorMode.${preferredColorMode}`)})`
      : t(`preferences.colorMode.${colorMode}`);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-seed-user-color-scheme",
      preferredColorMode === "dark-only" ? "dark" : "light",
    );
  }, [preferredColorMode]);

  return (
    <MenuRoot size="responsive" placement="bottom-end" onOpenChange={onOpenChange}>
      <MenuTrigger asChild>
        <ActionButton
          type="button"
          size="xsmall"
          variant="ghost"
          layout="iconOnly"
          aria-label={`${t("preferences.colorMode.label")}: ${currentModeLabel}`}
        >
          <Icon svg={<ModeIcon />} />
        </ActionButton>
      </MenuTrigger>

      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>{t("preferences.colorMode.label")}</MenuGroupLabel>
          {COLOR_MODES.map((mode) => (
            <MenuItem
              key={mode}
              role="menuitemradio"
              aria-checked={colorMode === mode}
              label={t(`preferences.colorMode.${mode}`)}
              suffixIcon={colorMode === mode ? <IconCheck /> : undefined}
              onClick={() => setColorMode(mode)}
            />
          ))}
        </MenuGroup>
      </MenuContent>
    </MenuRoot>
  );
}
