# 완료된 구현

## 시험 모드 전환과 관리자 기반 보강 — 2026-11-05

- `AGENTS.md`를 시험 모드로 교체: 과제 README 우선, 가정은 `DECISIONS.md`에 기록하고 진행, boilerplate 개발 규칙은 `docs/MAINTAINING.md`로 이동
- `scripts/exam-init.sh`: 개발 이력 제거, 출처 명시 baseline 커밋, `.env`·`DECISIONS.md` 생성, pnpm 부재 시 대체 명령 안내
- `withAuth`·`requirePageUser`·`HttpError`·`readJson` 추가, 기존 API를 래퍼로 전환
- `app/(app)` 공통 layout: 로그인 검사, 내비게이션, 로그아웃
- `/admin` 사용자 관리 화면과 역할 변경 API (`PATCH /api/admin/users/:id`, 자기 자신 변경 차단)
- `docs/FEATURE_TEMPLATE.md`: 실제 build·E2E를 통과한 CRUD 수직 흐름 코드
- RBAC E2E 5개와 브라우저 없는 `scripts/smoke.sh` 추가
- 의존성 정확한 버전 고정, `packageManager` 지정, dev 서버 `0.0.0.0` 바인딩, Next dev 표시기 비활성화
- `pnpm build`, `pnpm test:e2e` 7개, `pnpm smoke` 7개 통과

## 도메인 placeholder 제거와 공통 기반 정리 — 2026-11-05

- `Record` 모델, 화면, API, 도메인 E2E 제거
- 로그인 후 이동하는 도메인 중립 작업공간 추가
- 공통 인증·작업공간 E2E로 테스트 교체
- Prisma 기본 모델을 User·Session·Job 중심으로 정리
- 불필요한 Docker Compose 확장 설정 제거
- 문서 구조와 실제 디렉터리 구조 교차 대조
- `pnpm db:push --accept-data-loss`, `pnpm db:seed`, `pnpm build`, `pnpm test:e2e` 통과


## 범용 과제 적용 문서화 — 2026-11-05

- 특정 도메인 없이 과제 적합성 판단 기준 문서 추가
- clone 후 실행과 에이전트의 초기 확인 절차 문서 추가
- feature 단위 이식 방식과 수직 흐름 구현 절차 문서 추가
- 개인·공유·관리자·조직 데이터 접근 정책 문서 추가
- SQLite, Worker, Docker 확장 경로 문서 추가
- README에서 도메인 placeholder 중심 설명을 제거하고 문서 링크 연결
- `bootstrap`, `qa:build`, `qa:e2e`, `qa` 명령 추가
- `pnpm build` 통과


## 관리자 테스트 계정과 승격 명령 — 2026-11-02

- seed가 `admin@example.com`을 `ADMIN`으로 만들고 `SEED_ADMIN_PASSWORD`로 비밀번호 설정
- `pnpm db:promote email`로 기존 사용자를 `ADMIN`으로 승격
- 관리자 API와 사용자 API의 역할 검사 테스트 절차를 README에 추가
- seed, 승격 명령, production build 통과


## 스타터 세트 README 개편 — 2026-11-02

- README를 복제 후 바로 핵심 기능을 구현하는 스타터 세트 기준으로 재작성
- 실제 lockfile 기준 라이브러리·패키지 버전과 역할 명시
- SQLite 기본 환경, Docker 선택 환경, 설치·seed·개발·Worker 절차 명시
- 인증·RBAC·Prisma CRUD·Job Worker 확장 방법 설명
- 기존 3시간 구현 워크플로 설명 제거
- 배포 전 `PLAN.md` 제거 및 환경 파일 정리 규칙 명시


## 메인 인증 진입 흐름 — 2026-11-02

- 메인 페이지에서 세션 유무에 따라 `/login` 또는 `/records`로 이동
- 로그인 UI 추가
- 회원가입 UI 추가
- 3시간 웹앱 구현 워크플로와 도메인 교체 절차를 README에 추가
- `pnpm build` 및 `pnpm test:e2e` 통과


## M6 E2E·문서화 — 2026-11-02

- Playwright Chromium E2E 설정 추가
- 회원가입 후 Record 생성·삭제 브라우저 시나리오 추가
- 비로그인 Record 접근 차단 시나리오 추가
- README에 SQLite 실행, Worker, build, E2E, 도메인 교체 방법 추가
- `pnpm test:e2e` 2개 테스트 통과
- `pnpm build` 통과


## M5 실패·재시도 — 2026-11-02

- Job `attempts`와 `maxAttempts` 필드 추가
- 실패 Job 자동 재시도 구현
- 최대 시도 횟수 도달 시 `FAILED` 확정
- 의도적 실패용 `failure` handler와 재시도 성공 검증용 `flaky` handler 추가
- 실패 Job 수동 재시도 API 추가 (`POST /api/jobs/:id`)
- 실제 자동 실패·최종 FAILED·수동 재시도 응답 확인
- SQLite schema push와 production build 통과


## M4 DB 기반 Job 실행 — 2026-11-02

- SQLite `Job` 모델과 상태 필드 추가
- Job 생성·목록·상세 조회 API 추가
- DB를 polling하는 단일 Worker 추가
- Handler registry와 `example` Job 추가
- `/jobs` 화면에서 실행과 상태 조회 지원
- `PENDING → RUNNING → SUCCEEDED/FAILED` 상태 흐름 구현
- SQLite schema push와 production build 통과
- 실제 Job 생성 후 Worker의 `SUCCEEDED` 결과 확인


## SQLite 전환 — 2026-11-02

- Prisma datasource를 PostgreSQL에서 SQLite로 변경
- SQLite에서 지원하지 않는 enum 역할 필드를 문자열 역할 필드로 변경
- `.env.example`과 로컬 환경변수를 `file:./dev.db`로 변경
- 기본 실행에서 Docker·PostgreSQL·Redis 의존성 제거
- README 실행 절차를 SQLite 기준으로 변경
- SQLite schema push, seed, production build 통과
- 기존 PostgreSQL·Redis 컨테이너 종료


## M3 CRUD — 2026-11-02

- Prisma `Record` 모델과 사용자 소유권 관계 추가
- 로그인 사용자용 Record 목록·생성 API 추가
- Record 상세 조회·수정·삭제 API 추가
- 일반 사용자는 자신의 Record만, 관리자는 전체 Record에 접근
- `/records` 브라우저 CRUD 화면 추가
- `db:push`, production build 통과
- 실제 생성·조회·수정·삭제 HTTP 흐름 확인


## M2 RBAC — 2026-11-02

- 현재 로그인 사용자 조회 API 추가
- `requireUser` / `requireAdmin` 서버 권한 검사 추가
- 관리자 전용 사용자 목록 API 추가
- 비로그인 관리자 API 요청 401, 관리자 요청 200 확인
- Next.js production build 통과


## M1 인증 기반 — 2026-11-02

- User와 Session Prisma 모델 추가
- Node 기본 crypto 기반 비밀번호 해싱·검증 추가
- HttpOnly 세션 쿠키 생성·조회·삭제 추가
- 회원가입·로그인·로그아웃 API 추가

검증 상태: 빌드 및 로컬 API 실행 확인 완료. 회원가입 201, 로그인 200 응답을 확인했다.

## M0 실행 기반 — 2026-11-02

- Next.js App Router + TypeScript 최소 앱 추가
- PostgreSQL과 Redis Docker Compose 구성
- Prisma PostgreSQL 스키마와 seed 스크립트 추가
- `.env.example` 및 로컬 `.env` 추가
- 기본 실행 명령을 `package.json` scripts에 등록
- M0 확인용 홈 화면 추가

검증 상태: `docker compose up -d postgres redis`, `pnpm db:push`, `pnpm db:seed`, `pnpm build` 통과.
