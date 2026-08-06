import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { ProductList } from "@/widgets/product-list";

import { ProductFilter } from "@/features/product-filter";

import { PageSection } from "@/shared/ui";

export function HomePage() {
  const { t } = useTranslation("product");

  return (
    <div className="flex flex-col gap-x6">
      <PageSection title={t("list.title")} description={t("list.description")}>
        <ProductFilter />
      </PageSection>

      <ProductList />

      <ActionButton size="large" asChild>
        <Link to="/products/new">{t("create.title")}</Link>
      </ActionButton>
    </div>
  );
}
