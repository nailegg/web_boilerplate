# 기능 추가 방법

## 기본 원칙

공통 기반은 인증·세션·DB 연결·권한 검사·Job 실행처럼 여러 과제에서 반복되는 기능만 제공한다. 과제별 업무 규칙은 feature 디렉터리에 둔다. 첫 리소스는 [Feature 템플릿](FEATURE_TEMPLATE.md)을 복사해 시작한다.

```text
app/(app)/<feature>/page.tsx          로그인 필요 화면 (내비게이션 자동 포함)
app/api/<feature>/route.ts
app/api/<feature>/[id]/route.ts
server/<feature>/service.ts
server/<feature>/validation.ts
tests/e2e/<feature>.spec.ts
```

## 인증·권한 도구

| 위치 | 도구 | 동작 |
|---|---|---|
| Route Handler | `withAuth(handler)` | 비로그인 401, `HttpError`를 JSON 응답으로 변환 |
| Route Handler | `withAuth(handler, { role: "ADMIN" })` | 일반 사용자 403 |
| Server Component | `requirePageUser()` / `requirePageUser("ADMIN")` | 비로그인은 `/login`, 역할 불일치는 `/dashboard`로 이동 |
| 서비스·검증 | `throw new HttpError(status, message)` | 400/403/404/409를 응답으로 변환 |
| 요청 본문 | `readJson(request)` | 잘못된 JSON은 400 |

```ts
export const GET = withAuth(async (_request, user) => NextResponse.json({ items: await listItems(user) }));
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request, user, { params }) => { ... }, { role: "ADMIN" });
```

새 역할이 필요하면 `Role` 타입과 `requireAdmin`/`requirePageUser`의 검사, 관리자 화면의 선택지를 함께 바꾼다.

## 수직 흐름 우선

```text
로그인 → 핵심 입력 → 서버 검증 → 저장 또는 계산 → 결과 조회
```

이 흐름이 브라우저에서 동작한 뒤 검색, 필터, 통계, 고급 UI를 추가한다.

## 계산과 Job

몇 초 안에 끝나는 계산(최적화 baseline, 집계 등)은 API 요청 안에서 동기로 실행하고 결과를 DB에 저장한다. Worker 터미널이 하나 더 필요하기 때문에 Job은 수십 초 이상 걸리거나 재시도가 필요할 때만 쓴다.

1. Job 입력 형식을 정의한다.
2. `server/jobs/registry.ts`에 handler를 등록한다.
3. `pnpm worker`를 실행해 상태 변화를 확인한다.

## 검증

```bash
pnpm build
pnpm test:e2e      # Chromium을 설치할 수 없으면 아래 smoke로 대체
bash scripts/smoke.sh
```

기능마다 최소 한 개의 성공 흐름과 한 개의 권한 또는 입력 오류 흐름을 남긴다. `scripts/smoke.sh` 하단에 과제 API 확인을 같은 형식으로 추가한다.
