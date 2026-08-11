import type { ReactNode } from "react";

import { cn } from "@/shared/lib";
import { Icon, IconTrendingDown, IconTrendingUp } from "@/shared/ui";

export interface StatCardProps {
  /** Decorative glyph for the metric, e.g. `<IconWallet />`. */
  icon: ReactNode;
  label: string;
  /** Already formatted for the active locale. */
  value: string;
  /** Signed change against the previous period, e.g. `+14.2%`. */
  change: string;
  direction: "up" | "down";
  /** Names the comparison period, e.g. "vs. previous period". */
  caption: string;
  /** Spoken form of the delta — the arrow and colour are not readable alone. */
  changeLabel: string;
}

/**
 * Stat tile: label, value, delta. The value uses the font's default proportional
 * figures on purpose — `tabular-nums` widens every digit to a `0` and reads loose at
 * display sizes; it belongs in aligned columns, not in a standalone headline number.
 */
export function StatCard({
  icon,
  label,
  value,
  change,
  direction,
  caption,
  changeLabel,
}: StatCardProps) {
  const TrendGlyph = direction === "up" ? IconTrendingUp : IconTrendingDown;

  return (
    <div className="flex flex-col gap-x3 rounded-r4 bg-bg-layer-default p-x5 shadow-s1">
      <div className="flex items-center gap-x2">
        <span
          aria-hidden="true"
          className="inline-flex size-x8 shrink-0 items-center justify-center rounded-full bg-bg-brand-weak text-fg-brand"
        >
          <Icon svg={icon} size="x4" />
        </span>
        <span className="t3-regular text-fg-neutral-muted">{label}</span>
      </div>

      <p className="t9-bold text-fg-neutral lg:t11-bold">{value}</p>

      <p className="flex flex-wrap items-center gap-x1">
        {/* Direction is carried by the glyph and the spoken label, never by colour alone. */}
        <span
          className={cn(
            "inline-flex items-center gap-x0_5 t3-bold",
            direction === "up" ? "text-fg-positive" : "text-fg-critical",
          )}
        >
          <Icon svg={<TrendGlyph />} size="x3_5" />
          <span aria-hidden="true">{change}</span>
          <span className="sr-only">{changeLabel}</span>
        </span>
        <span className="t3-regular text-fg-neutral-muted">{caption}</span>
      </p>
    </div>
  );
}
