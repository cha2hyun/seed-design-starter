import { describe, expect, it } from "vitest";

import { formatCurrency, formatRelativeTime } from "./format";

describe("formatCurrency", () => {
  it("formats KRW without decimals in both languages", () => {
    expect(formatCurrency(2_800_000, "ko")).toBe("₩2,800,000");
    expect(formatCurrency(2_800_000, "en")).toBe("₩2,800,000");
  });

  it("keeps zero and negative amounts intact", () => {
    expect(formatCurrency(0, "ko")).toContain("0");
    expect(formatCurrency(-1000, "ko")).toContain("1,000");
  });
});

describe("formatRelativeTime", () => {
  /** Anchored to `Date.now()` at call time, so the input is built relative to it. */
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

  it("picks the largest unit that fits", () => {
    expect(formatRelativeTime(ago(3 * 86_400_000), "en")).toBe("3 days ago");
    expect(formatRelativeTime(ago(5 * 3_600_000), "en")).toBe("5 hours ago");
    expect(formatRelativeTime(ago(7 * 60_000), "en")).toBe("7 minutes ago");
  });

  it("falls through to seconds rather than rounding a fresh timestamp up", () => {
    expect(formatRelativeTime(ago(5_000), "en")).toBe("5 seconds ago");
    expect(formatRelativeTime(new Date().toISOString(), "en")).toBe("now");
  });

  it("localises the unit", () => {
    expect(formatRelativeTime(ago(3 * 86_400_000), "ko")).toContain("3");
  });
});
