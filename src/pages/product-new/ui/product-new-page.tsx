import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";

import { CreateProductForm } from "@/features/create-product";

import { useDocumentTitle } from "@/shared/lib";
import { PageSection } from "@/shared/ui";

export function ProductNewPage() {
  const { t } = useTranslation(["product", "common"]);
  useDocumentTitle(t("product:create.title"));
  const navigate = useNavigate();
  const snackbar = useSnackbarAdapter();

  return (
    <PageSection title={t("product:create.title")} className="max-w-form" headingAs="h1">
      <CreateProductForm
        onCreated={(product) => {
          snackbar.create({
            render: () => (
              <Snackbar
                variant="positive"
                message={t("product:create.successMessage")}
                closeLabel={t("common:action.close")}
              />
            ),
          });
          void navigate({
            to: "/products/$productId",
            params: { productId: product.id },
          });
        }}
      />
    </PageSection>
  );
}
