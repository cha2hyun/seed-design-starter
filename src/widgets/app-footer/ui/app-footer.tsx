import { useTranslation } from "react-i18next";

import { Footer01 } from "seed-design/block/footer-01";

import { REPO_URL } from "@/shared/config";

export function AppFooter() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-stroke-neutral-muted bg-bg-layer-default">
      <Footer01
        links={[
          {
            href: REPO_URL,
            label: t("footer.github"),
            target: "_blank",
            rel: "noopener noreferrer",
          },
        ]}
      />
    </div>
  );
}
