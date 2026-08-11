import { expect, test } from "@playwright/test";

const expectedColumns: Record<string, number> = {
  "base-320": 1,
  "sm-480": 2,
  "md-768": 2,
  "lg-1280": 3,
  "xl-1440": 3,
};

test("renders the responsive shell at the exact SEED breakpoints", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const sideNavigation = page.getByRole("navigation", { name: "사이드 메뉴" });
  const mobileMenuButton = page.getByRole("button", { name: "메뉴 열기", exact: true });
  const headerAccount = page.locator("header").getByRole("button", { name: /계정 메뉴 열기$/ });
  const sidebarAccount = sideNavigation.getByRole("button", { name: /계정 메뉴 열기$/ });
  const desktop =
    testInfo.project.name.startsWith("md-") ||
    testInfo.project.name.startsWith("lg-") ||
    testInfo.project.name.startsWith("xl-");

  if (desktop) {
    await expect(sideNavigation).toBeVisible();
    await expect(mobileMenuButton).toBeHidden();
    await expect(headerAccount).toBeHidden();
    await expect(sidebarAccount).toBeVisible();
  } else {
    await expect(sideNavigation).toBeHidden();
    await expect(mobileMenuButton).toBeVisible();
    await expect(headerAccount).toBeVisible();

    await mobileMenuButton.click();
    await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeHidden();
    await expect(mobileMenuButton).toBeFocused();
  }

  const productGrid = page.locator("main ul").filter({
    has: page.locator('a[href^="/products/"]'),
  });
  await expect(productGrid).toBeVisible();
  const columns = await productGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
  );
  expect(columns).toBe(expectedColumns[testInfo.project.name]);

  const headerName = headerAccount.getByText("당근이");
  if (testInfo.project.name === "base-320") {
    await expect(headerName).toBeHidden();
  } else if (testInfo.project.name === "sm-480") {
    await expect(headerName).toBeVisible();
  }

  const sidebarEmail = sidebarAccount.getByText("karrot@example.com");
  if (testInfo.project.name === "xl-1440") {
    await expect(sidebarEmail).toBeVisible();
  } else if (desktop) {
    await expect(sidebarEmail).toBeHidden();
  }

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await testInfo.attach(`home-${testInfo.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("closes an account menu when its responsive owner becomes hidden", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "base-320", "One resize path covers both menu owners.");

  await page.goto("/");
  const headerAccount = page.locator("header").getByRole("button", { name: /계정 메뉴 열기$/ });
  await headerAccount.click();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(headerAccount).toBeHidden();
  await expect(page.getByRole("menu")).toHaveCount(0);

  const sidebarAccount = page
    .getByRole("navigation", { name: "사이드 메뉴" })
    .getByRole("button", { name: /계정 메뉴 열기$/ });
  await sidebarAccount.click();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.setViewportSize({ width: 480, height: 900 });
  await expect(sidebarAccount).toBeHidden();
  await expect(page.getByRole("menu")).toHaveCount(0);

  const mobileMenuButton = page.getByRole("button", { name: "메뉴 열기", exact: true });
  await mobileMenuButton.click();
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();

  const smHeaderAccount = page.locator("header").getByRole("button", { name: /계정 메뉴 열기$/ });
  await smHeaderAccount.click();
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toHaveCount(0);
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(smHeaderAccount).toBeFocused();

  await smHeaderAccount.click();
  await page.getByRole("menuitem", { name: "프로필 보기" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(smHeaderAccount).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toHaveCount(0);
});
