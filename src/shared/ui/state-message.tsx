import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/shared/lib";

export interface StateMessageProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "title"
> {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** The title's semantic heading element. Keep unset for embedded states. */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/** Shared shell for empty, error and not-found states. */
export function StateMessage({
  title,
  description,
  action,
  className,
  headingAs: Heading,
  ...props
}: StateMessageProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col items-center justify-center gap-x3 rounded-r4 py-x10 px-x5 text-center",
        "bg-bg-layer-default",
        className,
      )}
    >
      {Heading ? (
        <Heading className="t6-bold text-fg-neutral">{title}</Heading>
      ) : (
        <p className="t6-bold text-fg-neutral">{title}</p>
      )}
      {description && <p className="t4-regular text-fg-neutral-muted">{description}</p>}
      {action && <div className="mt-x2">{action}</div>}
    </div>
  );
}
