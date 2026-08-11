import { expect, test } from "@playwright/test";

function runOnceAtMd(projectName: string) {
  test.skip(projectName !== "md-768", "Core flows only need one real-browser viewport.");
}

test("keeps logout and remembered login consistent across reloads", async ({ page }, testInfo) => {
  runOnceAtMd(testInfo.project.name);

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "사이드 메뉴" })
    .getByRole("button", {
      name: "당근이 계정 메뉴 열기",
    })
    .click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { level: 1, name: "로그인" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "로그인" })).toBeVisible();

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("이메일").fill("karrot@example.com");
  await page.getByLabel("비밀번호").fill("browser-test-password");
  await page.getByRole("button", { name: "로그인하기" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { level: 1, name: "프로필" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "프로필" })).toBeVisible();

  await testInfo.attach("remembered-login", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("creates a product and opens its cache-backed detail", async ({ page }, testInfo) => {
  runOnceAtMd(testInfo.project.name);

  const title = "브라우저 테스트 상품";
  await page.goto("/products/new");
  await expect(page.getByRole("heading", { level: 1, name: "상품 등록" })).toBeVisible();

  await page.getByRole("textbox", { name: "제목", exact: true }).fill(title);
  await page.getByRole("textbox", { name: "가격", exact: true }).fill("18000");
  await page
    .getByRole("textbox", { name: "설명", exact: true })
    .fill("등록 직후 상세 캐시로 이동하는 상품이에요.");
  await page.getByRole("button", { name: "등록하기" }).click();

  await expect(page).toHaveURL(/\/products\/p-/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("상품을 등록했어요.")).toBeVisible();

  await testInfo.attach("created-product-detail", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
