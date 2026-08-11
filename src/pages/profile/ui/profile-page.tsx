import { useState } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "seed-design/ui/alert-dialog";
import { Avatar } from "seed-design/ui/avatar";
import { MannerTempBadge } from "seed-design/ui/manner-temp-badge";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "seed-design/ui/tabs";

import { useDocumentTitle } from "@/shared/lib";
import { PageSection } from "@/shared/ui";

const TABS = ["activity", "saved", "history"] as const;
type Tab = (typeof TABS)[number];

export function ProfilePage() {
  const { t } = useTranslation(["profile", "common"]);
  useDocumentTitle(t("profile:title"));
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("activity");

  const name = t("common:account.name");

  return (
    <div className="flex flex-col gap-x8">
      <PageSection title={t("profile:title")} description={t("profile:description")} headingAs="h1">
        <div className="flex flex-col items-start justify-between gap-x6 rounded-r5 bg-bg-layer-default p-x6 shadow-s1 md:flex-row md:items-center">
          {/* At 320px the identity column needs to wrap instead of squeezing the avatar. */}
          <div className="flex flex-wrap items-center gap-x4">
            {/*
              Decorative: with no `src` the <img> never renders, so its `alt` reaches nobody
              and the fallback's bare initial would be announced as content instead. The name
              is already text immediately beside it.
            */}
            <Avatar aria-hidden="true" className="shrink-0" fallback={name.slice(0, 1)} size="80" />
            <div className="flex flex-col gap-x1">
              <div className="flex flex-wrap items-center gap-x2">
                <span className="t7-bold text-fg-neutral">{name}</span>
                <MannerTempBadge temperature={36.5} />
              </div>
              <span className="t3-regular text-fg-neutral-muted">{t("common:account.email")}</span>
            </div>
          </div>

          <AlertDialogRoot>
            <AlertDialogTrigger asChild>
              <ActionButton
                type="button"
                variant="neutralOutline"
                size="small"
                className="w-full md:w-auto"
              >
                {t("profile:logout.action")}
              </ActionButton>
            </AlertDialogTrigger>
            {/* SEED's dialog renders inline with no portal at z-index 2; the app header is
                sticky at z-10, so without a layerIndex the dialog opens underneath it. */}
            <AlertDialogContent layerIndex={50}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("profile:logout.title")}</AlertDialogTitle>
                <AlertDialogDescription>{t("profile:logout.description")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction type="button" variant="neutralOutline">
                  {t("common:action.cancel")}
                </AlertDialogAction>
                <AlertDialogAction
                  type="button"
                  variant="brandSolid"
                  onClick={() => void navigate({ to: "/login" })}
                >
                  {t("profile:logout.confirmAction")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogRoot>
        </div>
      </PageSection>

      <PageSection title={t("profile:tabs.heading")}>
        <TabsRoot triggerLayout="hug" value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <TabsList aria-label={t("profile:tabs.label")}>
            {TABS.map((name) => (
              <TabsTrigger key={name} value={name}>
                {t(`profile:tabs.${name}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((name) => (
            <TabsContent key={name} value={name}>
              <p className="mt-x4 rounded-r4 bg-bg-layer-default p-x5 t3-regular text-fg-neutral shadow-s1">
                {t(`profile:tabs.${name}Body`)}
              </p>
            </TabsContent>
          ))}
        </TabsRoot>
      </PageSection>
    </div>
  );
}
