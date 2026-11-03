# Web Service Boilerplate

웹서비스의 핵심 기능 구현을 바로 시작할 수 있도록 인증, 권한, 데이터베이스, ORM, 기본 UI, CRUD API, 장시간 작업 실행 기반을 미리 구성한 스타터 세트다.

이 저장소를 복제한 뒤 기존 기능을 학습하거나 순서대로 이어가는 것이 목적이 아니다. 인증과 데이터 접근 같은 반복 작업을 건너뛰고, 새 서비스의 핵심 도메인과 화면 구현에 바로 착수하는 것이 목적이다.

## 포함된 기반 기능

- 이메일·비밀번호 회원가입, 로그인, 로그아웃
- HttpOnly 세션 쿠키와 DB 세션 저장
- `USER`·`ADMIN` 역할 기반 서버 권한 검사
- Prisma ORM과 SQLite 데이터베이스
- 로그인 사용자의 소유권을 적용한 CRUD API
- 브라우저에서 확인할 수 있는 로그인·회원가입·CRUD·Job 화면
- DB 기반 단일 Worker와 Job 상태 관리
- 실패 Job 자동 재시도와 수동 재시도
- Playwright 브라우저 테스트

기본 예제의 `Record` 모델과 화면은 CRUD 연결 방식을 보여주는 참고 구현이다. 새 프로젝트에서는 핵심 도메인 모델과 API를 이 구조에 맞춰 교체하거나 추가한다.

## 기술 스택과 버전

`pnpm-lock.yaml`에 고정된 현재 설치 버전은 다음과 같다.

| 영역 | 패키지 | 버전 | 역할 |
|---|---|---:|---|
| Runtime | Node.js | 20+ | 서버 실행 |
| Package manager | pnpm | 10+ | 의존성 설치와 스크립트 실행 |
| Web | Next.js | 15.5.28 | App Router, 화면, API Route Handler |
| UI runtime | React / React DOM | 19.3.1 | 화면 구성 |
| ORM | Prisma / `@prisma/client` | 6.19.3 | 스키마, DB 접근, schema push |
| Language | TypeScript | 5.9.3 | 타입 검사와 빌드 |
| Worker runtime | tsx | 4.23.15 | TypeScript Worker 실행 |
| Browser test | `@playwright/test` | 1.64.1 | Chromium E2E 테스트 |
| Database | SQLite | 로컬 파일 | 기본 데이터 저장소 |

버전을 변경할 때는 `package.json`과 `pnpm-lock.yaml`을 함께 갱신하고 `pnpm build`, `pnpm test:e2e`를 다시 실행한다.

## 복제 후 로컬 실행

필요한 것은 Node.js 20 이상과 pnpm이다. 기본 구성은 SQLite 파일을 사용하므로 PostgreSQL, Redis, Docker가 없어도 실행된다.

```bash
git clone <repository-url>
cd WebService_Boilerplate
pnpm install
cp .env.example .env
pnpm db:push
pnpm db:seed
pnpm dev
```

브라우저에서 <http://localhost:3000>을 연다.

- 비로그인 상태의 `/`: `/login`으로 이동
- 로그인 상태의 `/`: `/records`로 이동
- 로그인 후 `/jobs`에서 Job을 생성할 수 있음

Job을 실제로 처리하려면 별도 터미널에서 Worker를 실행한다.

```bash
cd WebService_Boilerplate
pnpm worker
```

SQLite 파일은 `prisma/dev.db`에 생성된다. `.env`의 기본값은 다음과 같다.

```env
DATABASE_URL="file:./dev.db"
SEED_ADMIN_PASSWORD="admin12345"
```

`.env`는 로컬 비밀값과 환경별 설정을 위한 파일이며 커밋하지 않는다.

`pnpm db:seed`는 `admin@example.com`을 `ADMIN`으로 만들고 `SEED_ADMIN_PASSWORD`를 관리자 비밀번호로 설정한다. 개발용 기본 비밀번호는 `admin12345`이며, 실제 환경에서는 `.env`에서 변경한다. 일반 사용자로 가입한 계정을 관리자로 승격하려면 다음을 실행한다.

```bash
pnpm db:promote user@example.com
```

## Docker 환경에서 실행할 때

현재 기본 스타터 세트는 Docker를 요구하지 않는다. Docker 기반 실행 환경에서 저장소를 clone한 경우에도 컨테이너 안에 Node.js 20 이상과 pnpm이 준비되어 있다면 위의 `pnpm install`부터 같은 절차를 실행하면 된다.

기본 SQLite 방식에서는 다음을 확인한다.

- `prisma/dev.db`가 컨테이너 내부에서 유지되도록 볼륨을 연결한다.
- 컨테이너를 다시 만들었을 때 DB가 사라지지 않도록 `prisma` 디렉터리를 영속 볼륨으로 둔다.
- 웹 컨테이너와 Worker 컨테이너는 같은 SQLite 파일을 공유해야 한다.

여러 웹 인스턴스나 여러 Worker를 실행해야 한다면 SQLite 대신 PostgreSQL을 선택하고, Job 큐가 필요할 때 Redis와 BullMQ를 확장한다. 저장소에 있는 `docker-compose.yml`은 이 확장 경로를 위한 참고 설정이며 기본 실행 절차에는 필요하지 않다.

## 주요 명령

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | production 빌드와 타입 검사 |
| `pnpm start` | production 서버 실행 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:push` | Prisma schema를 현재 DB에 반영 |
| `pnpm db:migrate` | 마이그레이션 기반 개발 DB 갱신이 필요할 때 사용 |
| `pnpm db:seed` | 기본 관리자 레코드 생성 |
| `pnpm db:promote email` | 기존 사용자를 `ADMIN`으로 승격 |
| `pnpm worker` | DB 기반 단일 Job Worker 실행 |
| `pnpm test:e2e` | Playwright Chromium E2E 실행 |

Playwright 브라우저가 설치되지 않은 환경에서는 한 번 실행한다.

```bash
pnpm exec playwright install chromium
```

## 디렉터리 역할

```text
app/                    Next.js 화면과 API Route Handler
components/             공통 UI 컴포넌트 확장 위치
lib/db.ts               Prisma Client 싱글턴
lib/auth/               비밀번호, 세션, 권한 검사
server/                 도메인 서비스와 Job handler
worker/index.ts         단일 Job Worker 진입점
prisma/schema.prisma    데이터 모델과 관계
prisma/seed.ts          초기 데이터
tests/e2e/             브라우저 E2E 테스트
```

## 인증과 권한을 확장하는 방법

인증은 `lib/auth/password.ts`에서 Node 기본 `crypto` 기반으로 비밀번호를 해시하고, `lib/auth/session.ts`에서 Session 레코드와 HttpOnly 쿠키를 관리한다.

새로운 보호 API는 다음 흐름으로 만든다.

```ts
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
```

관리자 전용 API는 `requireAdmin()`을 사용한다. 역할을 추가하거나 권한 체계를 세분화할 때는 `User.role`과 `lib/auth/require-user.ts`를 함께 변경한다.

## DB와 CRUD를 확장하는 방법

1. `prisma/schema.prisma`에 새 모델과 User 관계를 추가한다.
2. `pnpm db:push`로 로컬 DB에 반영한다.
3. `app/api/<resource>/route.ts`에 목록·생성 API를 추가한다.
4. `app/api/<resource>/[id]/route.ts`에 상세·수정·삭제 API를 추가한다.
5. 소유권이 필요한 모델은 `ownerId`와 User relation을 추가하고, 조회·수정·삭제마다 현재 사용자의 소유권을 검사한다.
6. `app/<resource>/page.tsx`에 화면과 폼을 연결한다.
7. 해당 사용자 흐름을 `tests/e2e`에 추가한다.

기존 `Record` API는 이 패턴의 작동 예시다. 제품 도메인에서는 `Order`, `Reservation`, `Document`처럼 실제 핵심 명사로 모델과 라우트를 만든다.

## Job을 확장하는 방법

Job 입력은 `Job.payload`, 결과는 `Job.result`에 문자열 JSON으로 저장한다. 새 작업은 `server/jobs/registry.ts`에 handler를 등록한다.

```ts
const handlers = {
  optimize: async (payload, context) => {
    // 알고리즘, OR 최적화, 파일 처리, 외부 API 동기화
    return { ...payload, jobId: context.jobId };
  }
};
```

웹 API는 Job을 `PENDING`으로 저장하고, `pnpm worker`가 주기적으로 하나씩 가져가 실행한다. 실행 중에는 `RUNNING`, 성공 시 `SUCCEEDED`, 최대 재시도 후에는 `FAILED`가 된다.

기본 Worker는 단일 프로세스다. 병렬 실행이나 높은 처리량이 필요해지면 Job 저장소를 PostgreSQL로 바꾸고, Worker의 polling 부분을 Redis + BullMQ 같은 큐 구현으로 교체한다.

## 검증

핵심 변경 후 다음 순서로 확인한다.

```bash
pnpm db:push
pnpm build
pnpm test:e2e
```

현재 E2E에는 회원가입 후 CRUD를 수행하는 흐름과 비로그인 접근 차단 흐름이 포함되어 있다. Job 변경을 검증할 때는 `pnpm worker`를 별도 실행한 상태에서 API 또는 `/jobs` 화면을 확인한다.

## 배포 전 정리

- `.env`와 `prisma/dev.db`는 커밋하지 않는다.
- `README.md`, `AGENTS.md`, `COMPLETED.md`는 팀 규칙에 맞춰 유지하거나 프로젝트 문서로 옮긴다.
- 실제 배포에서 여러 인스턴스가 필요하면 SQLite의 파일 공유 한계를 확인하고 PostgreSQL로 전환한다.
