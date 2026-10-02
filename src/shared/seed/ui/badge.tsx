/**
 * @file ui:badge
 * @requires @seed-design/react@^3.0.0
 **/
import * as React from "react";

import { Icon, Badge as SeedBadge } from "@seed-design/react";

import { IconCircleAlert } from "@/shared/ui/icons";

export interface BadgeActionProps extends Omit<
  SeedBadge.ActionProps,
  "aria-label" | "asChild" | "children"
> {
  "aria-label": string;
  render?: (trigger: React.ReactElement) => React.ReactNode;
}

export type BadgeProps = Omit<SeedBadge.RootProps, "asChild" | "children" | "prefix"> & {
  children: React.ReactNode;
  prefix?: React.ReactNode;
  actionProps?: BadgeActionProps;
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, prefix, actionProps, ...props }, ref) => {
    let actionElement: React.ReactElement | null = null;
    let renderAction: BadgeActionProps["render"];

    if (actionProps) {
      const { render, ...seedActionProps } = actionProps;
      renderAction = render;
      actionElement = (
        <SeedBadge.Action {...seedActionProps}>
          <Icon size="full" svg={<IconCircleAlert />} />
        </SeedBadge.Action>
      );
    }

    return (
      <SeedBadge.Root ref={ref} {...props}>
        {prefix != null ? (
          <SeedBadge.Prefix>
            <Icon size="full" svg={prefix} />
          </SeedBadge.Prefix>
        ) : null}
        <SeedBadge.Label>{children}</SeedBadge.Label>
        {actionElement ? (renderAction ? renderAction(actionElement) : actionElement) : null}
      </SeedBadge.Root>
    );
  },
);
Badge.displayName = "Badge";
