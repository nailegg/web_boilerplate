import { expect, test, type APIRequestContext } from "@playwright/test";

async function registerUser(request: APIRequestContext, prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  expect((await request.post("/api/auth/register", { data: { email, password: "password123", name: prefix } })).status()).toBe(201);
}

test("다른 사용자의 Job은 조회할 수 없다", async ({ page, playwright }) => {
  const owner = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  await registerUser(owner, "owner");
  const created = await owner.post("/api/jobs", { data: { type: "example" } });
  const { job } = await created.json();
  await owner.dispose();

  await registerUser(page.request, "intruder");
  expect((await page.request.get(`/api/jobs/${job.id}`)).status()).toBe(403);
});
