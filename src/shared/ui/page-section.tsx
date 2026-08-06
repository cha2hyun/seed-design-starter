import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface PageSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({ title, description, action, children, className }: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-x4", className)}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-x3">
          <div className="flex flex-col gap-x1">
            {title && <h2 className="t7-bold text-fg-neutral">{title}</h2>}
            {description && <p className="t4-regular text-fg-neutral-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
