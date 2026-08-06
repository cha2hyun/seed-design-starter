import { useTranslation } from "react-i18next";

import { useLanguage } from "@/shared/i18n";
import { cn, formatCurrency, formatRelativeTime } from "@/shared/lib";

import type { Product } from "../model/types";
import { ProductStatusTag } from "./product-status-tag";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation("product");
  const { language } = useLanguage();

  return (
    <article
      className={cn(
        "flex flex-col gap-x2 rounded-r4 bg-bg-layer-default p-x4 shadow-s1",
        "group-hover:bg-bg-layer-default-pressed",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-x3">
        <h3 className="t5-bold text-fg-neutral">{product.title}</h3>
        <ProductStatusTag status={product.status} />
      </div>

      <p className="t6-bold text-fg-neutral">{formatCurrency(product.price, language)}</p>

      <div className="flex items-center gap-x2 t3-regular text-fg-neutral-muted">
        <span>{product.region}</span>
        <span aria-hidden>·</span>
        <span>{formatRelativeTime(product.createdAt, language)}</span>
        <span aria-hidden>·</span>
        <span>{t(`category.${product.category}`)}</span>
      </div>
    </article>
  );
}
