# Boilerplate 사용 안내 (시험 중 에이전트용)

이 디렉터리(`web/`)는 과제 구현을 위해 clone한 기반 코드다. **작업 규칙은 과제 루트의 `AGENTS.md`와 `CONTRACT.md`를 따른다.** 이 문서는 기반 코드가 무엇을 제공하고, 무엇을 교체해야 하는지만 설명한다.

## 이미 있는 것 (다시 만들지 않는다)

| 기능 | 위치 |
|---|---|
| 회원가입·로그인·로그아웃, DB 세션, `USER`/`ADMIN` | `lib/auth/`, `app/api/auth/` |
| API 가드: `withAuth(handler, { role })` → 401/403, `HttpError` → JSON | `lib/auth/require-user.ts`, `lib/http.ts` |
| 화면 가드: `requirePageUser("ADMIN")`. `app/(app)/` 아래는 로그인 검사·내비게이션 자동 | `app/(app)/layout.tsx` |
| 관리자 사용자 목록·역할 변경 | `app/(app)/admin/`, `app/api/admin/users/` |
| CRUD 수직 흐름 코드 (model·validation·service·API·화면·smoke) | `docs/FEATURE_TEMPLATE.md` |
| 장시간 작업 Job/Worker | `server/jobs/`, `worker/` |
| 브라우저 없는 권한 smoke | `scripts/smoke.sh` |

## 반드시 교체·삭제할 것

코드에 `BOILERPLATE-PLACEHOLDER` 주석이 붙은 곳이다. 제출 전 `bash scripts/check-placeholders.sh`가 0건이어야 한다.

| 위치 | 처리 |
|---|---|
| `app/layout.tsx` 제목 | 과제 서비스 이름으로 교체 |
| `app/(app)/dashboard/page.tsx` | 과제의 첫 화면(역할별 진입 화면)으로 교체 |
| `app/(app)/layout.tsx` 내비게이션 | 과제 화면 링크로 교체 |
| Jobs 화면·예시 handler | Job이 필요 없으면 `node scripts/prune-jobs.mjs`로 일괄 삭제. 필요하면 예시 handler를 과제 handler로 교체 |
| `prisma/seed.ts` | 과제 데이터·역할에 맞는 시드로 교체 (관리자 계정은 유지 가능) |

`FEATURE_TEMPLATE.md`의 `Item`은 형식 예시다. 과제 리소스 이름과 필드로 바꿔서 쓰고, `Item`이라는 이름을 그대로 남기지 않는다.

## 확장 규칙

- 내부 Browser에서 로그인이 반복되면 `.env`에 `COOKIE_SAMESITE="none"`, `COOKIE_SECURE="true"`를 넣고 서버를 재시작한다.
- 시험 규정상 `git commit`·`git push` 등 git 쓰기 명령은 쓰지 않는다. `web/`에는 `.git`이 없다.
- 과제 코드 위치: `app/(app)/<feature>/`, `app/api/<feature>/`, `server/<feature>/`. 검증은 `scripts/smoke.sh` 하단에 check를 추가한다(브라우저 E2E는 반입 시 삭제됨)
- 접근 정책은 `server/<feature>/service.ts`에서, 역할 검사는 `withAuth`의 `role`로 한다. 화면에서 버튼만 숨기는 것으로 권한을 구현하지 않는다.
- 몇 초 안에 끝나는 계산은 API 요청 안에서 동기로 실행하고 결과를 DB에 저장한다. Job은 수십 초 이상 걸릴 때만 쓴다.
- 제공 데이터는 `prisma/seed.ts` 또는 import 스크립트에서 **파일을 읽어** 적재한다. 값을 코드에 하드코딩하지 않는다.
- 새 역할이 필요하면 `lib/auth/require-user.ts`의 `Role` 타입, `app/api/admin/users/[id]/route.ts`의 `ROLES`, 관리자 화면 선택지(`RoleSelect`)를 함께 바꾼다. `withAuth(handler, { role })`와 `requirePageUser(role)`는 그 역할이거나 `ADMIN`일 때만 통과시킨다.
- route를 지우거나 이름을 바꾼 뒤 build가 `.next/types/... Cannot find module`로 실패하면 `rm -rf .next/types` 후 다시 build한다(dev 서버는 계속 돈다).

## 화면 규칙

- 스타일은 `app/globals.css`의 변수와 클래스로 만든다. Tailwind 같은 CSS 프레임워크나 UI 라이브러리를 새로 설치하지 않는다. 필요한 클래스가 없으면 이 파일에 추가하고, 화면마다 인라인 스타일을 길게 쓰지 않는다.
- 한 화면의 순서는 제목 줄(`.page-head`: 제목과 주요 버튼), 핵심 숫자(`.grid` 안에 `.kpi`), 본문(`.card` 안에 표나 폼)이다. 넓은 표가 있으면 `<main className="wide">`를 쓴다.
- 상태는 글자만 쓰지 않고 `.badge`로 표시한다. 정상은 기본, 주의 `warn`, 위험·실패 `danger`, 대기·해당 없음 `neutral`, 진행·정보 `info`. 상태 이름은 과제 README의 표기를 그대로 쓴다.
- 표의 숫자 칸은 `className="num"`, 비율은 `.bar`(`style={{ "--v": 72 } as React.CSSProperties}`), 데이터가 없으면 `.empty`, 요청 실패는 `role="alert"`로 보여 준다.
- 버튼은 기본(주요 동작), `secondary`(보조), `danger`(삭제·반려)만 쓴다. 한 줄 필터·검색 폼은 `form.inline`이다.
- 꾸미기는 필수 AC가 통과한 뒤에 한다.

## 명령

```bash
pnpm install --frozen-lockfile
pnpm bootstrap                    # db push + seed
pnpm dev                          # 0.0.0.0:3000
pnpm worker                       # Job을 쓸 때만, 별도 터미널. 없으면 Job이 PENDING에 머문다
pnpm db:push                      # schema 변경 후. 이후 개발 서버 재시작 필수(안 하면 새 모델 API가 500)
pnpm build                        # .next-build에 출력 → 실행 중인 dev 서버(.next)를 깨뜨리지 않는다
bash scripts/smoke.sh             # 서버 실행 중, Chromium 불필요
bash scripts/check-placeholders.sh
```

시드 관리자: `admin@example.com` / `.env`의 `SEED_ADMIN_PASSWORD`(기본 `admin12345`).
