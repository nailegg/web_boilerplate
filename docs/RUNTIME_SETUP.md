# 실행 환경

## 기본 환경

- Node.js 20 이상
- pnpm 10 이상
- SQLite
- Playwright Chromium

기본 실행은 Docker 없이 가능하다.

```bash
pnpm install
cp .env.example .env
pnpm bootstrap
pnpm dev
```

## 환경 변수

```env
DATABASE_URL="file:./dev.db"
SEED_ADMIN_PASSWORD="admin12345"
```

`.env`는 커밋하지 않는다. `SEED_ADMIN_PASSWORD`는 개발용 관리자 계정에만 사용한다.

## 주요 명령

```bash
pnpm bootstrap          # DB 반영과 seed
pnpm dev            # 개발 서버
pnpm worker         # 단일 Job Worker
pnpm build          # production build
pnpm test:e2e       # Playwright E2E
```

## Docker를 사용할 때

Docker는 기본 요구사항이 아니다. Docker 환경에서 실행할 경우 웹 앱과 Worker가 같은 SQLite 파일을 공유하도록 `prisma` 디렉터리를 영속 볼륨으로 연결한다.

여러 인스턴스나 높은 동시성이 필요하면 SQLite를 PostgreSQL로 바꾸고, Job을 분산 처리해야 할 때 Redis와 큐 시스템을 추가한다. 이 전환은 과제 요구사항이 확인된 뒤 진행한다.
