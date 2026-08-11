import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";

import { useProductFilterStore } from "@/features/product-filter";

import { ProductCard, productListQuery } from "@/entities/product";

import { cn } from "@/shared/lib";
import { LoadingBlock, shellGutterClassName, StateMessage } from "@/shared/ui";

export function ProductList() {
  const { t } = useTranslation(["product", "common"]);
  const filter = useProductFilterStore((state) => state.filter);
  const { data, isPending, isError, refetch } = useQuery(productListQuery(filter));

  if (isPending) {
    return <LoadingBlock label={t("common:state.loading")} />;
  }

  if (isError) {
    return (
      <StateMessage
        role="alert"
        title={t("common:state.error.title")}
        description={t("common:state.error.description")}
        action={
          <ActionButton variant="neutralWeak" size="medium" onClick={() => void refetch()}>
            {t("common:action.retry")}
          </ActionButton>
        }
      />
    );
  }

  if (data.length === 0) {
    return (
      <StateMessage
        title={t("product:list.empty.title")}
        description={t("product:list.empty.description")}
      />
    );
  }

  return (
    <ul className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", shellGutterClassName)}>
      {data.map((product) => (
        <li key={product.id} className="min-w-0">
          <Link
            to="/products/$productId"
            params={{ productId: product.id }}
            className="group block h-full rounded-r4"
          >
            <ProductCard product={product} className="h-full" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
