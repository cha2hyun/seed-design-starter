import { useTranslation } from "react-i18next";

import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";

import { PRODUCT_LIST_FILTERS, type ProductListFilter } from "@/entities/product";

import { useProductFilterStore } from "../model/product-filter-store";

export function ProductFilter() {
  const { t } = useTranslation("product");
  const filter = useProductFilterStore((state) => state.filter);
  const setFilter = useProductFilterStore((state) => state.setFilter);

  return (
    <SegmentedControl
      aria-label={t("list.title")}
      value={filter}
      onValueChange={(value) => setFilter(value as ProductListFilter)}
    >
      {PRODUCT_LIST_FILTERS.map((option) => (
        <SegmentedControlItem key={option} value={option}>
          {t(`filter.${option}`)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
