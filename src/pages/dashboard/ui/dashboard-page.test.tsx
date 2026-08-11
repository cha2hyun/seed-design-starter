import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { changeLanguage } from "@/shared/i18n";

import { DashboardPage } from "./dashboard-page";

const setup = () => ({ user: userEvent.setup(), ...render(<DashboardPage />) });

/** The transaction list, not the filter chips — both render as lists. */
const rowTitles = () =>
  screen
    .queryAllByRole("listitem")
    .map((li) => li.textContent ?? "")
    .filter((text) => /₩/.test(text));

const search = () => screen.getByRole("searchbox", { name: /제목 검색|Search by title/ });

describe("DashboardPage", () => {
  it("gives the search field an accessible name without a visible caption", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1, name: "대시보드" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "핵심 지표 요약" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "최근 거래" })).toBeInTheDocument();
    // The only TextField that lacked a `label`, which made SEED log an accessibility
    // warning on every render. The label is real but visually hidden.
    expect(search()).toBeInTheDocument();
  });

  it("filters by status", async () => {
    const { user } = setup();
    expect(rowTitles()).toHaveLength(4);

    await user.click(screen.getByRole("radio", { name: "판매 중" }));
    expect(rowTitles()).toHaveLength(2);
    expect(rowTitles().every((row) => row.includes("판매중"))).toBe(true);
  });

  it("exposes the filter as a single-select group, not three toggles", () => {
    setup();
    // `Chip.Button` + `aria-pressed` reported three independent toggles and could never
    // reach the recipe's checked state, so the active filter rendered at 1.11:1.
    const group = screen.getByRole("radiogroup", { name: /거래 상태 필터/ });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(within(group).getByRole("radio", { name: "전체" })).toBeChecked();
  });

  it("shows an empty state rather than an empty box when nothing matches", async () => {
    const { user } = setup();
    await user.type(search(), "존재하지않는상품");
    expect(rowTitles()).toHaveLength(0);
    expect(screen.getByText(/조건에 맞는 거래가 없어요/)).toBeInTheDocument();
  });

  it("changes the figures when the period changes", async () => {
    const { user } = setup();
    expect(screen.getByText("₩2,870,000")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "월간" }));
    expect(screen.getByText("₩12,450,000")).toBeInTheDocument();
  });

  it("renders a down trend, so the tile's negative branch is reachable", () => {
    setup();
    expect(screen.getByText("-1.8%")).toBeInTheDocument();
  });

  describe("in English", () => {
    beforeEach(() => {
      changeLanguage("en");
    });

    it("translates the rows and lets an English term match them", async () => {
      const { user } = setup();
      // The titles were hard-coded Korean: an English user saw Korean rows and every
      // English search term dropped the list into its empty state.
      expect(rowTitles().some((row) => row.includes("iPhone 15 Pro"))).toBe(true);

      await user.type(search(), "iphone");
      expect(rowTitles()).toHaveLength(1);
      expect(within(screen.getByRole("list", { name: "" })).queryByText(/아이폰/)).toBeNull();
    });
  });
});
