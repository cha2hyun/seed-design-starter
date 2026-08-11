import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import { Avatar } from "seed-design/ui/avatar";
import { Callout } from "seed-design/ui/callout";

import { productDetailQuery, ProductStatusTag } from "@/entities/product";

import { useLanguage } from "@/shared/i18n";
import { formatCurrency, formatRelativeTime, useDocumentTitle } from "@/shared/lib";
import { LoadingBlock, PageSection, StateMessage } from "@/shared/ui";

export interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { t } = useTranslation(["product", "common"]);
  const { language } = useLanguage();
  const { data, isPending, isError } = useQuery(productDetailQuery(productId));
  useDocumentTitle(data?.title ?? t("product:detail.title"));

  if (isPending) {
    return <LoadingBlock label={t("common:state.loading")} />;
  }

  if (isError) {
    return (
      <StateMessage
        headingAs="h1"
        title={t("common:state.notFound.title")}
        description={t("common:state.notFound.description")}
        action={
          <ActionButton variant="neutralWeak" size="medium" asChild>
            <Link to="/">{t("common:action.goHome")}</Link>
          </ActionButton>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-x6">
      <div className="flex flex-col gap-x3">
        <div className="flex items-center gap-x2">
          <ProductStatusTag status={data.status} />
          <span className="t3-regular text-fg-neutral-muted">
            {t(`product:category.${data.category}`)}
          </span>
        </div>

        <h1 className="screen-title text-fg-neutral">{data.title}</h1>
        <p className="t9-bold text-fg-neutral">{formatCurrency(data.price, language)}</p>
        <p className="t3-regular text-fg-neutral-muted">
          {data.region} · {formatRelativeTime(data.createdAt, language)}
        </p>
      </div>

      <div className="flex items-center gap-x3 rounded-r4 bg-bg-layer-default p-x4">
        <Avatar size="48" fallback={data.sellerName.slice(0, 1)} alt={data.sellerName} />
        <div className="flex min-w-0 flex-col">
          <span className="t3-regular text-fg-neutral-muted">
            {t("product:detail.sellerLabel")}
          </span>
          <span className="truncate t5-bold text-fg-neutral">{data.sellerName}</span>
        </div>
      </div>

      {data.negotiable && (
        <Callout tone="informative" description={t("product:create.negotiableField")} />
      )}

      <PageSection title={t("product:detail.descriptionLabel")}>
        <p className="article-body whitespace-pre-line text-fg-neutral">{data.description}</p>
      </PageSection>

      <ActionButton size="large" className="max-w-form" disabled={data.status === "sold"}>
        {t("product:detail.chatAction")}
      </ActionButton>
    </div>
  );
}
