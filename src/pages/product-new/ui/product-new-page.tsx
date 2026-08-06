import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";

import { CreateProductForm } from "@/features/create-product";

import { PageSection } from "@/shared/ui";

export function ProductNewPage() {
  const { t } = useTranslation("product");
  const navigate = useNavigate();
  const snackbar = useSnackbarAdapter();

  return (
    <PageSection title={t("create.title")}>
      <CreateProductForm
        onCreated={(product) => {
          snackbar.create({
            render: () => <Snackbar variant="positive" message={t("create.successMessage")} />,
          });
          void navigate({ to: "/products/$productId", params: { productId: product.id } });
        }}
      />
    </PageSection>
  );
}
