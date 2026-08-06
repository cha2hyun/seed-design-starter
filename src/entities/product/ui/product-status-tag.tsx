import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib";

import type { ProductStatus } from "../model/types";

const TONE_CLASS: Record<ProductStatus, string> = {
  onSale: "bg-bg-brand-weak text-fg-brand",
  reserved: "bg-bg-warning-weak text-fg-warning",
  sold: "bg-bg-neutral-weak text-fg-neutral-muted",
};

export interface ProductStatusTagProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusTag({ status, className }: ProductStatusTagProps) {
  const { t } = useTranslation("product");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-r2 py-x0_5 px-x2 t2-bold",
        TONE_CLASS[status],
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}
