# Feature 템플릿 (검증된 CRUD 수직 흐름)

과제의 첫 리소스를 만들 때 아래 코드를 복사하고 `Item`/`item`/`items`를 과제 리소스 이름으로 바꾼다.
이 코드는 boilerplate에서 실제로 `pnpm build`와 E2E를 통과한 뒤 문서로 옮겼다. 도메인 예시가 아니라 형식 예시다.

접근 정책은 **개인 데이터(소유자 + ADMIN 전체)** 기준이다. 공유 데이터나 관리자만 변경하는 리소스라면 [접근 정책 설계](ACCESS_POLICY_GUIDE.md)에 맞춰 `service.ts`의 조건만 바꾼다.

| 파일 | 역할 |
|---|---|
| `prisma/schema.prisma` | 모델 추가 + `User`에 역관계 추가 |
| `server/items/validation.ts` | 입력 검증, 실패 시 `HttpError(400)` |
| `server/items/service.ts` | 접근 정책과 업무 규칙, 404/403 |
| `app/api/items/route.ts`, `[id]/route.ts` | `withAuth` + 검증 + 서비스 호출만 |
| `app/(app)/items/page.tsx` | 로딩·빈 상태·오류 상태를 가진 목록/생성/수정/삭제 화면 |
| `tests/e2e/items.spec.ts` | 성공 흐름 1개 + 권한·입력 오류 1개 |

반영 후 `pnpm db:push && pnpm build && pnpm test:e2e`. 내비게이션 링크는 `app/(app)/layout.tsx`에 추가한다.

## prisma/schema.prisma

`model User`에 `items Item[]` 한 줄을 추가하고, 아래 모델을 추가한다.

```prisma
model Item {
  id        String   @id @default(cuid())
  title     String
  status    String   @default("OPEN")
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
}
```

## server/items/validation.ts

```ts
import { HttpError } from "@/lib/http";

export const ITEM_STATUSES = ["OPEN", "DONE"] as const;

export function parseItemInput(body: Record<string, unknown>, partial = false) {
  const data: { title?: string; status?: string } = {};
  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? "").trim();
    if (!title || title.length > 100) throw new HttpError(400, "title은 1~100자여야 합니다.");
    data.title = title;
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!ITEM_STATUSES.includes(status as (typeof ITEM_STATUSES)[number])) throw new HttpError(400, `status는 ${ITEM_STATUSES.join(", ")} 중 하나여야 합니다.`);
    data.status = status;
  }
  return data;
}
```

## server/items/service.ts

```ts
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";

// 접근 정책: 개인 데이터. 소유자만 접근, ADMIN은 전체 접근.
// 공유 데이터라면 where 조건을 제거하고 변경 함수에서만 역할을 검사한다.
export function listItems(user: User) {
  return db.item.findMany({ where: user.role === "ADMIN" ? undefined : { ownerId: user.id }, orderBy: { createdAt: "desc" } });
}

export async function getItem(id: string, user: User) {
  const item = await db.item.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "항목을 찾을 수 없습니다.");
  if (user.role !== "ADMIN" && item.ownerId !== user.id) throw new HttpError(403, "접근 권한이 없습니다.");
  return item;
}

export function createItem(user: User, data: { title?: string; status?: string }) {
  return db.item.create({ data: { title: data.title!, status: data.status, ownerId: user.id } });
}

export async function updateItem(id: string, user: User, data: { title?: string; status?: string }) {
  await getItem(id, user);
  return db.item.update({ where: { id }, data });
}

export async function deleteItem(id: string, user: User) {
  await getItem(id, user);
  await db.item.delete({ where: { id } });
}
```

## app/api/items/route.ts

```ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/require-user";
import { readJson } from "@/lib/http";
import { createItem, listItems } from "@/server/items/service";
import { parseItemInput } from "@/server/items/validation";

export const GET = withAuth(async (_request, user) => NextResponse.json({ items: await listItems(user) }));

export const POST = withAuth(async (request, user) => {
  const item = await createItem(user, parseItemInput(await readJson(request)));
  return NextResponse.json({ item }, { status: 201 });
});
```

## app/api/items/[id]/route.ts

```ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/require-user";
import { readJson } from "@/lib/http";
import { deleteItem, getItem, updateItem } from "@/server/items/service";
import { parseItemInput } from "@/server/items/validation";

type Context = { params: Promise<{ id: string }> };

export const GET = withAuth<Context>(async (_request, user, { params }) => NextResponse.json({ item: await getItem((await params).id, user) }));

export const PATCH = withAuth<Context>(async (request, user, { params }) => {
  const item = await updateItem((await params).id, user, parseItemInput(await readJson(request), true));
  return NextResponse.json({ item });
});

export const DELETE = withAuth<Context>(async (_request, user, { params }) => {
  await deleteItem((await params).id, user);
  return new NextResponse(null, { status: 204 });
});
```

## app/(app)/items/page.tsx

```tsx
"use client";

import { FormEvent, useEffect, useState } from "react";

type Item = { id: string; title: string; status: string };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/items");
    if (response.ok) setItems((await response.json()).items);
    setLoading(false);
  }
  async function request(url: string, init: RequestInit) {
    const response = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
    if (!response.ok) return setError((await response.json()).error ?? "요청 실패");
    setError("");
    await load();
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    await request("/api/items", { method: "POST", body: JSON.stringify({ title }) });
    setTitle("");
  }
  useEffect(() => { void load(); }, []);

  return (
    <main>
      <div className="card">
        <h1>항목</h1>
        {error && <p role="alert">{error}</p>}
        <form onSubmit={create}><input aria-label="제목" placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} required /><button type="submit">추가</button></form>
        {loading ? <p>불러오는 중…</p> : items.length === 0 ? <p>항목이 없습니다.</p> : (
          <table>
            <thead><tr><th>제목</th><th>상태</th><th></th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td><button type="button" className="secondary" onClick={() => void request(`/api/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: item.status === "OPEN" ? "DONE" : "OPEN" }) })}>{item.status}</button></td>
                  <td><button type="button" onClick={() => void request(`/api/items/${item.id}`, { method: "DELETE" })}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
```

## tests/e2e/items.spec.ts

```ts
import { expect, test } from "@playwright/test";

test("항목을 생성·상태 변경·삭제한다", async ({ page }) => {
  const email = `items-${Date.now()}@example.com`;
  expect((await page.request.post("/api/auth/register", { data: { email, password: "password123", name: "Items" } })).status()).toBe(201);

  await page.goto("/items");
  await page.getByLabel("제목").fill("첫 항목");
  await page.getByRole("button", { name: "추가" }).click();
  await expect(page.getByRole("cell", { name: "첫 항목" })).toBeVisible();
  await page.getByRole("button", { name: "OPEN", exact: true }).click();
  await expect(page.getByRole("button", { name: "DONE", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("항목이 없습니다.")).toBeVisible();
});

test("다른 사용자의 항목은 403, 잘못된 입력은 400", async ({ page, playwright }) => {
  const owner = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3000" });
  await owner.post("/api/auth/register", { data: { email: `owner-${Date.now()}@example.com`, password: "password123" } });
  const { item } = await (await owner.post("/api/items", { data: { title: "비공개" } })).json();
  await owner.dispose();

  await page.request.post("/api/auth/register", { data: { email: `other-${Date.now()}@example.com`, password: "password123" } });
  expect((await page.request.get(`/api/items/${item.id}`)).status()).toBe(403);
  expect((await page.request.post("/api/items", { data: { title: "" } })).status()).toBe(400);
});
```
