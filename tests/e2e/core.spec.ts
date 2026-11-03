import { expect, test } from "@playwright/test";

test("회원가입 후 Record를 생성하고 삭제한다", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const register = await page.request.post("/api/auth/register", { data: { email, password: "password123", name: "E2E User" } });
  expect(register.status()).toBe(201);

  await page.goto("/records");
  await expect(page.getByRole("heading", { name: "Records" })).toBeVisible();
  await page.getByLabel("제목").fill("E2E Record");
  await page.getByLabel("설명").fill("브라우저 검증");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page.getByText("E2E Record")).toBeVisible();
  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("E2E Record")).toHaveCount(0);
});

test("비로그인 사용자는 Record를 볼 수 없다", async ({ page }) => {
  await page.goto("/records");
  await expect(page.locator("p[role=alert]")).toContainText("로그인이 필요합니다.");
});
