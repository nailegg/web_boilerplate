# Feature 템플릿 (검증된 CRUD 수직 흐름)

과제의 첫 리소스를 만들 때 아래 코드를 복사하고 `Item`/`item`/`items`를 과제 리소스 이름으로 바꾼다.
이 코드는 boilerplate에서 실제로 `pnpm build`와 브라우저 테스트를 통과한 뒤 문서로 옮겼다. 도메인 예시가 아니라 형식 예시다.

접근 정책은 **개인 데이터(소유자 + ADMIN 전체)** 기준이다. 공유 데이터나 관리자만 변경하는 리소스라면 [접근 정책 설계](ACCESS_POLICY_GUIDE.md)에 맞춰 `service.ts`의 조건만 바꾼다.

| 파일 | 역할 |
|---|---|
| `prisma/schema.prisma` | 모델 추가 + `User`에 역관계 추가 |
| `server/items/validation.ts` | 입력 검증, 실패 시 `HttpError(400)` |
| `server/items/service.ts` | 접근 정책과 업무 규칙, 404/403 |
| `app/api/items/route.ts`, `[id]/route.ts` | `withAuth` + 검증 + 서비스 호출만 |
| `app/(app)/items/page.tsx` | 로딩·빈 상태·오류 상태를 가진 목록/생성/수정/삭제 화면 |
| `scripts/smoke.sh` 하단 | 성공 흐름 1개 + 권한·입력 오류 1개 (curl, 브라우저 불필요) |

반영 후 `pnpm db:push` → **개발 서버 재시작** → `pnpm build && bash scripts/smoke.sh`. 브라우저 E2E(`pnpm test:e2e`)는 시험 중 쓰지 않는다. 내비게이션 링크는 `app/(app)/layout.tsx`에 추가한다.

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

## scripts/smoke.sh 하단에 추가

`$TMP/user`는 smoke 앞부분에서 가입한 일반 사용자 쿠키다. 다른 사용자 데이터 차단을 보려면 사용자를 하나 더 가입시킨다.

```bash
check "항목 생성"                 201 -b "$TMP/user" "${JSON[@]}" -d '{"title":"smoke item"}' "$BASE/api/items"
ITEM_ID="$(sed -E 's/.*"id":"([^"]+)".*/\1/' "$TMP/body")"
check "항목 목록"                 200 -b "$TMP/user" "$BASE/api/items"
check "빈 제목은 400"             400 -b "$TMP/user" "${JSON[@]}" -d '{"title":""}' "$BASE/api/items"
check "비로그인 생성은 401"        401 "${JSON[@]}" -d '{"title":"x"}' "$BASE/api/items"
check "다른 사용자 가입"           201 -c "$TMP/other" "${JSON[@]}" -d "{\"email\":\"other-$EMAIL\",\"password\":\"password123\"}" "$BASE/api/auth/register"
check "다른 사용자 항목 조회 403"  403 -b "$TMP/other" "$BASE/api/items/$ITEM_ID"
```
