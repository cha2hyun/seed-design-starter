import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface StateMessageProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Shared shell for empty, error and not-found states. */
export function StateMessage({ title, description, action, className }: StateMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-x3 rounded-r4 py-x10 px-x5 text-center",
        "bg-bg-layer-default",
        className,
      )}
    >
      <p className="t6-bold text-fg-neutral">{title}</p>
      {description && <p className="t4-regular text-fg-neutral-muted">{description}</p>}
      {action && <div className="mt-x2">{action}</div>}
    </div>
  );
}
