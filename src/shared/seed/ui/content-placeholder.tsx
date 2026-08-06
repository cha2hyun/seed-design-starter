/**
 * @file ui:content-placeholder
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/
import * as React from "react";

import { ContentPlaceholder as SeedContentPlaceholder } from "@seed-design/react";

export interface ContentPlaceholderProps extends SeedContentPlaceholder.RootProps {}

/**
 * @see https://seed-design.io/react/components/content-placeholder
 */
export const ContentPlaceholder = React.forwardRef<HTMLDivElement, ContentPlaceholderProps>(
  ({ children, ...props }, ref) => {
    return (
      <SeedContentPlaceholder.Root {...props} ref={ref}>
        <SeedContentPlaceholder.Asset>{children}</SeedContentPlaceholder.Asset>
      </SeedContentPlaceholder.Root>
    );
  },
);
ContentPlaceholder.displayName = "ContentPlaceholder";

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
