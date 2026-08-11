import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { ProductList } from "@/widgets/product-list";

import { ProductFilter } from "@/features/product-filter";

import { cn, useDocumentTitle } from "@/shared/lib";
import { PageSection, shellGutterClassName } from "@/shared/ui";

export function HomePage() {
  const { t } = useTranslation("product");
  useDocumentTitle(t("list.title"));

  return (
    <div className={cn("flex flex-col", shellGutterClassName)}>
      <PageSection title={t("list.title")} description={t("list.description")} headingAs="h1">
        <div className="overflow-x-auto lg:w-fit">
          <ProductFilter />
        </div>
      </PageSection>

      <ProductList />

      <ActionButton size="large" className="w-full md:w-auto md:self-start" asChild>
        <Link to="/products/new">{t("create.title")}</Link>
      </ActionButton>
    </div>
  );
}
