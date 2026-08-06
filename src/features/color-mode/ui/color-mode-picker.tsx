import { useTranslation } from "react-i18next";

import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";

import { COLOR_MODES, type ColorMode } from "@/shared/config";

import { useColorModeStore } from "../model/color-mode-store";

export function ColorModePicker() {
  const { t } = useTranslation("settings");
  const colorMode = useColorModeStore((state) => state.colorMode);
  const setColorMode = useColorModeStore((state) => state.setColorMode);

  return (
    <SegmentedControl
      aria-label={t("colorMode.label")}
      value={colorMode}
      onValueChange={(value) => setColorMode(value as ColorMode)}
    >
      {COLOR_MODES.map((mode) => (
        <SegmentedControlItem key={mode} value={mode}>
          {t(`colorMode.${mode}`)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
