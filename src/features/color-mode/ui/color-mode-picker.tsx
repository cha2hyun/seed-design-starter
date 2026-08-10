import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { COLOR_MODES, type ColorMode } from "@/shared/config";
import { Icon } from "@/shared/ui";

import { useColorModeStore } from "../model/color-mode-store";

const MODE_ICON = {
  system: Monitor,
  "light-only": Sun,
  "dark-only": Moon,
} as const;

function nextColorMode(colorMode: ColorMode): ColorMode {
  const index = COLOR_MODES.indexOf(colorMode);
  return COLOR_MODES[(index + 1) % COLOR_MODES.length] ?? COLOR_MODES[0];
}

export function ColorModePicker() {
  const { t } = useTranslation();
  const colorMode = useColorModeStore((state) => state.colorMode);
  const setColorMode = useColorModeStore((state) => state.setColorMode);
  const ModeIcon = MODE_ICON[colorMode];

  return (
    <ActionButton
      type="button"
      size="xsmall"
      variant="ghost"
      layout="iconOnly"
      aria-label={`${t("preferences.colorMode.label")}: ${t(`preferences.colorMode.${colorMode}`)}`}
      onClick={() => setColorMode(nextColorMode(colorMode))}
    >
      <Icon svg={<ModeIcon />} />
    </ActionButton>
  );
}
