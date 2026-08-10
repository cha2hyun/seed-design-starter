import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import type { ColorMode } from "@/shared/config";
import { Icon, IconMoon, IconSun } from "@/shared/ui";

import { useColorModeStore } from "../model/color-mode-store";

type ExplicitColorMode = Extract<ColorMode, "light-only" | "dark-only">;

function resolveExplicitMode(colorMode: ColorMode): ExplicitColorMode {
  if (colorMode === "light-only" || colorMode === "dark-only") return colorMode;
  if (typeof window === "undefined") return "light-only";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-only" : "light-only";
}

function toggleColorMode(colorMode: ColorMode): ExplicitColorMode {
  return resolveExplicitMode(colorMode) === "light-only" ? "dark-only" : "light-only";
}

export function ColorModePicker() {
  const { t } = useTranslation();
  const colorMode = useColorModeStore((state) => state.colorMode);
  const setColorMode = useColorModeStore((state) => state.setColorMode);
  const explicitMode = resolveExplicitMode(colorMode);
  const ModeIcon = explicitMode === "light-only" ? IconSun : IconMoon;

  return (
    <ActionButton
      type="button"
      size="xsmall"
      variant="ghost"
      layout="iconOnly"
      aria-label={`${t("preferences.colorMode.label")}: ${t(`preferences.colorMode.${explicitMode}`)}`}
      onClick={() => setColorMode(toggleColorMode(colorMode))}
    >
      <Icon svg={<ModeIcon />} />
    </ActionButton>
  );
}
