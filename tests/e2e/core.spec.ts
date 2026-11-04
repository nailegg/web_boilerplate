import { expect, test } from "@playwright/test";

test("회원가입 후 보호된 작업공간에 접근한다", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const register = await page.request.post("/api/auth/register", { data: { email, password: "password123", name: "E2E User" } });
  expect(register.status()).toBe(201);

  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "작업공간" })).toBeVisible();
});

test("비로그인 사용자는 작업공간으로 이동할 수 없다", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
