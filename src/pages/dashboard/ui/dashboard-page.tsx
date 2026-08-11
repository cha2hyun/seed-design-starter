import { useState } from "react";

import { useTranslation } from "react-i18next";

import { Chip } from "seed-design/ui/chip";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";

import { useLanguage } from "@/shared/i18n";
import { formatCurrency, useDocumentTitle } from "@/shared/lib";
import {
  IconHandshake,
  IconPackage,
  IconWallet,
  PageSection,
  StateMessage,
  Tag,
} from "@/shared/ui";

import { StatCard } from "./stat-card";

const PERIODS = ["daily", "weekly", "monthly"] as const;
type Period = (typeof PERIODS)[number];

const FILTERS = ["all", "active", "completed"] as const;
type Filter = (typeof FILTERS)[number];

type TransactionStatus = Exclude<Filter, "all">;

/** Titles live in the locale files: an English user searching this list found nothing. */
interface Transaction {
  id: "mbp-m3-max" | "iphone-15-pro" | "sony-xm5" | "switch-oled";
  price: number;
  status: TransactionStatus;
}

/** Per-period figures so the segmented control changes something the user can see. */
const METRICS: Record<Period, { gmv: number; newProducts: number; acceptedOffers: number }> = {
  daily: { gmv: 410_000, newProducts: 6, acceptedOffers: 2 },
  weekly: { gmv: 2_870_000, newProducts: 31, acceptedOffers: 11 },
  monthly: { gmv: 12_450_000, newProducts: 128, acceptedOffers: 42 },
};

/** Includes negatives so the tile's down-trend treatment is actually exercised, not just built. */
const CHANGES: Record<Period, { gmv: string; newProducts: string; acceptedOffers: string }> = {
  daily: { gmv: "+3.1%", newProducts: "-2.4%", acceptedOffers: "+5.0%" },
  weekly: { gmv: "+9.4%", newProducts: "+4.8%", acceptedOffers: "-1.8%" },
  monthly: { gmv: "+14.2%", newProducts: "+8.5%", acceptedOffers: "+24.0%" },
};

const TRANSACTIONS: Transaction[] = [
  { id: "mbp-m3-max", price: 2_800_000, status: "completed" },
  { id: "iphone-15-pro", price: 1_150_000, status: "active" },
  { id: "sony-xm5", price: 320_000, status: "active" },
  { id: "switch-oled", price: 350_000, status: "completed" },
];

export function DashboardPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  useDocumentTitle(t("dashboard:title"));
  const { language } = useLanguage();
  const [period, setPeriod] = useState<Period>("weekly");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const stats = [
    {
      key: "gmv",
      icon: <IconWallet />,
      label: t("dashboard:summary.gmv"),
      value: formatCurrency(METRICS[period].gmv, language),
      change: CHANGES[period].gmv,
    },
    {
      key: "newProducts",
      icon: <IconPackage />,
      label: t("dashboard:summary.newProducts"),
      value: METRICS[period].newProducts.toLocaleString(language),
      change: CHANGES[period].newProducts,
    },
    {
      key: "acceptedOffers",
      icon: <IconHandshake />,
      label: t("dashboard:summary.acceptedOffers"),
      value: METRICS[period].acceptedOffers.toLocaleString(language),
      change: CHANGES[period].acceptedOffers,
    },
  ];

  const rows = TRANSACTIONS.map((item) => ({
    ...item,
    title: t(`dashboard:list.item.${item.id}`),
  }));

  const needle = search.trim().toLocaleLowerCase(language);
  const visible = rows.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      (needle === "" || item.title.toLocaleLowerCase(language).includes(needle)),
  );

  return (
    <div className="flex flex-col gap-x8">
      <PageSection
        title={t("dashboard:title")}
        description={t("dashboard:description")}
        headingAs="h1"
      >
        <div className="flex flex-col gap-x4">
          <div className="flex flex-wrap items-center justify-between gap-x4">
            <h2 className="t4-bold text-fg-neutral">{t("dashboard:summary.title")}</h2>
            <SegmentedControl
              aria-label={t("dashboard:summary.periodLabel")}
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              {PERIODS.map((option) => (
                <SegmentedControlItem key={option} value={option}>
                  {t(`dashboard:summary.period.${option}`)}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>

          {/*
            No `md:grid-cols-3`: at md the 240px sidebar appears, so the content column
            is narrower than it was at 767px and three Callouts would be ~149px each.
            2-up from sm, 3-up only once lg gives every card room.
          */}
          <div className="grid grid-cols-1 gap-x4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const direction = stat.change.startsWith("-") ? "down" : "up";
              return (
                <StatCard
                  key={stat.key}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  change={stat.change}
                  direction={direction}
                  caption={t("dashboard:summary.vsPrevious")}
                  changeLabel={t(
                    direction === "up"
                      ? "dashboard:summary.trendUp"
                      : "dashboard:summary.trendDown",
                    { change: stat.change.replace(/^[+-]/, "") },
                  )}
                />
              );
            })}
          </div>
        </div>
      </PageSection>

      <PageSection title={t("dashboard:list.title")}>
        <div className="flex flex-col gap-x4">
          <div className="flex flex-col gap-x3 sm:flex-row sm:items-center">
            {/*
              Radio, not buttons: the chip recipe expresses selection through
              `:is(:checked, [data-checked])`, which a plain <button> can never match, so
              swapping the `variant` prop only ever renders two unchecked styles. The radio
              primitive supplies `data-checked` and the single-select semantics the group has.
              No `flex-1`: the chips size to their content and `min-w-0` lets them scroll.
            */}
            <Chip.RadioRoot
              aria-label={t("dashboard:list.filterLabel")}
              value={filter}
              onValueChange={(value) => setFilter(value as Filter)}
              className="flex min-w-0 items-center gap-x2 overflow-x-auto py-x1"
            >
              {FILTERS.map((option) => (
                <Chip.RadioItem key={option} value={option} size="medium" variant="outlineWeak">
                  <Chip.Label>{t(`dashboard:list.filter.${option}`)}</Chip.Label>
                </Chip.RadioItem>
              ))}
            </Chip.RadioRoot>

            {/*
              Sized by this wrapper, not by the component: `TextField` forwards `className`
              to the inner input root, never to the outer field root that is the flex item,
              and that root carries a hard `width: 100%` from its recipe.
            */}
            <div className="w-full sm:min-w-0 sm:flex-1 lg:max-w-form">
              {/*
                The label is real but visually hidden: the chips beside it already say what
                the row filters, so a visible caption would only unbalance them. Passing it
                as a node rather than an `aria-label` on the input keeps SEED's own
                label-to-input association and silences its dev-only accessibility warning.
              */}
              <TextField label={<span className="sr-only">{t("dashboard:list.searchLabel")}</span>}>
                <TextFieldInput
                  type="search"
                  placeholder={t("dashboard:list.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </TextField>
            </div>
          </div>

          {visible.length === 0 ? (
            <StateMessage
              title={t("dashboard:list.empty.title")}
              description={t("dashboard:list.empty.description")}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-stroke-neutral-muted overflow-hidden rounded-r4 bg-bg-layer-default shadow-s1">
              {visible.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-x3 p-x4">
                  <div className="flex min-w-0 flex-col gap-x1">
                    <span className="truncate t4-medium text-fg-neutral">{item.title}</span>
                    <span className="t3-regular text-fg-neutral-muted">
                      {formatCurrency(item.price, language)}
                    </span>
                  </div>
                  <Tag tone={item.status === "completed" ? "neutral" : "brand"}>
                    {t(`dashboard:list.status.${item.status}`)}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageSection>
    </div>
  );
}
