import { ProgressCircle } from "seed-design/ui/progress-circle";

import { cn } from "@/shared/lib";

export interface LoadingBlockProps {
  label: string;
  className?: string;
}

export function LoadingBlock({ label, className }: LoadingBlockProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-x3 py-x10", className)}
      role="status"
      aria-live="polite"
    >
      <ProgressCircle size="40" tone="neutral" />
      <p className="t4-regular text-fg-neutral-muted">{label}</p>
    </div>
  );
}
