import { useTranslation } from "react-i18next";

import { Tag, type TagTone } from "@/shared/ui";

import type { ProductStatus } from "../model/types";

const STATUS_TONE: Record<ProductStatus, TagTone> = {
  onSale: "brand",
  reserved: "warning",
  sold: "neutral",
};

export interface ProductStatusTagProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusTag({ status, className }: ProductStatusTagProps) {
  const { t } = useTranslation("product");

  return (
    <Tag tone={STATUS_TONE[status]} className={className}>
      {t(`status.${status}`)}
    </Tag>
  );
}
