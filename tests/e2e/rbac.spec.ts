import { expect, test, type APIRequestContext } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: process.env.SEED_ADMIN_PASSWORD ?? "admin12345" };

async function registerUser(request: APIRequestContext, prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, password: "password123", name: prefix } });
  expect(response.status()).toBe(201);
  return email;
}

test("비로그인 401, 일반 사용자 403, 관리자 200으로 관리자 API를 구분한다", async ({ playwright, page }) => {
  const anonymous = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  expect((await anonymous.get("/api/admin/users")).status()).toBe(401);
  await anonymous.dispose();

  await registerUser(page.request, "user");
  expect((await page.request.get("/api/admin/users")).status()).toBe(403);

  const admin = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  expect((await admin.post("/api/auth/login", { data: ADMIN })).status()).toBe(200);
  expect((await admin.get("/api/admin/users")).status()).toBe(200);
  await admin.dispose();
});

test("일반 사용자는 관리자 화면에 들어갈 수 없고 관리자 링크도 보이지 않는다", async ({ page }) => {
  await registerUser(page.request, "user");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: "관리자" })).toHaveCount(0);
});

test("관리자는 사용자 관리 화면에서 역할을 변경한다", async ({ page, playwright }) => {
  const other = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  const email = await registerUser(other, "target");
  await other.dispose();

  await page.goto("/login");
  await page.getByLabel("이메일").fill(ADMIN.email);
  await page.getByLabel("비밀번호").fill(ADMIN.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.getByRole("link", { name: "관리자" }).click();
  await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible();

  const responsePromise = page.waitForResponse((response) => response.url().includes("/api/admin/users/") && response.request().method() === "PATCH");
  await page.getByLabel(`${email} 역할`).selectOption("ADMIN");
  expect((await responsePromise).status()).toBe(200);
});

test("다른 사용자의 Job은 조회할 수 없다", async ({ page, playwright }) => {
  const owner = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  await registerUser(owner, "owner");
  const created = await owner.post("/api/jobs", { data: { type: "example" } });
  const { job } = await created.json();
  await owner.dispose();

  await registerUser(page.request, "intruder");
  expect((await page.request.get(`/api/jobs/${job.id}`)).status()).toBe(403);
});

test("로그아웃하면 로그인 화면으로 이동하고 보호 화면이 다시 막힌다", async ({ page }) => {
  await registerUser(page.request, "logout");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
