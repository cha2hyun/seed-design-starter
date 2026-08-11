import type { ReactNode } from "react";

import { Badge } from "@seed-design/react";

import { cn } from "@/shared/lib";

export type TagTone = "neutral" | "brand" | "warning" | "positive";

export interface TagProps {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}

/** Non-interactive status label backed by SEED's status-specific Badge recipe. */
export function Tag({ tone = "neutral", children, className }: TagProps) {
  return (
    <Badge tone={tone} variant="weak" size="medium" className={cn("shrink-0", className)}>
      {children}
    </Badge>
  );
}
