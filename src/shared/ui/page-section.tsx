import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface PageSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** The section title's semantic heading element. */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
  headingAs: Heading = "h2",
}: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-x5", className)}>
      {(title || description || action) && (
        <header className="flex flex-col gap-x3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-x1">
            {title && <Heading className="t7-bold text-fg-neutral">{title}</Heading>}
            {description && <p className="t4-regular text-fg-neutral-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
