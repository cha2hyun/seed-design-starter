import type { Language } from "@/shared/config";

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export function formatCurrency(amountInKrw: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE_BY_LANGUAGE[language], {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amountInKrw);
}

export function formatRelativeTime(isoDate: string, language: Language): string {
  const formatter = new Intl.RelativeTimeFormat(LOCALE_BY_LANGUAGE[language], { numeric: "auto" });
  const elapsedMs = new Date(isoDate).getTime() - Date.now();

  const units = [
    { unit: "day", ms: 86_400_000 },
    { unit: "hour", ms: 3_600_000 },
    { unit: "minute", ms: 60_000 },
  ] as const;

  for (const { unit, ms } of units) {
    if (Math.abs(elapsedMs) >= ms) {
      return formatter.format(Math.round(elapsedMs / ms), unit);
    }
  }

  return formatter.format(Math.round(elapsedMs / 1000), "second");
}
