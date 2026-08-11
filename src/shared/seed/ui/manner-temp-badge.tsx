/**
 * @file ui:manner-temp-badge
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/
import * as React from "react";

import {
  Celsius,
  MannerTempBadge as SeedMannerTempBadge,
  type MannerTempBadgeProps as SeedMannerTempBadgeProps,
} from "@seed-design/react";

import { mannerTempToLevel } from "../lib/manner-temp-level";

export interface MannerTempBadgeProps extends Omit<
  SeedMannerTempBadgeProps,
  "children" | "asChild"
> {
  /**
   * The manner temperature of the badge.
   * Level will be calculated based on this value.
   * If level is provided, this will be ignored.
   */
  temperature: number;
}

export const MannerTempBadge = React.forwardRef<HTMLSpanElement, MannerTempBadgeProps>(
  ({ temperature, level, ...otherProps }, ref) => {
    return (
      <SeedMannerTempBadge
        ref={ref}
        level={level ?? mannerTempToLevel(temperature)}
        {...otherProps}
      >
        <Celsius value={temperature} />
      </SeedMannerTempBadge>
    );
  },
);
MannerTempBadge.displayName = "MannerTempBadge";

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
