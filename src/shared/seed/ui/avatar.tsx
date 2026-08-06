/**
 * @file ui:avatar
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/
import * as React from "react";

import { Avatar as SeedAvatar } from "@seed-design/react";

export interface AvatarProps extends SeedAvatar.RootProps {
  src?: string;

  alt?: string;

  fallback?: React.ReactNode;
}

/**
 * @see https://seed-design.io/react/components/avatar
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, children, ...otherProps }, ref) => {
    return (
      <SeedAvatar.Root ref={ref} {...otherProps}>
        <SeedAvatar.Fallback>{fallback}</SeedAvatar.Fallback>
        <SeedAvatar.Image src={src} alt={alt} />
        {children}
      </SeedAvatar.Root>
    );
  },
);
Avatar.displayName = "Avatar";

export interface AvatarBadgeProps extends SeedAvatar.BadgeProps {}

export const AvatarBadge = SeedAvatar.Badge;

export interface AvatarStackProps extends SeedAvatar.StackProps {}

export const AvatarStack = SeedAvatar.Stack;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
