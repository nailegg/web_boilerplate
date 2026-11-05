# 에이전트 작업 규칙 (시험 모드)

이 디렉터리는 시험 중 clone한 웹서비스 boilerplate다. **과제 README와 과제가 제공한 파일이 이 문서보다 항상 우선한다.**

## 우선순위

1. 과제 README·제공 데이터·제공 스타터 코드
2. 사용자(응시자)의 직접 지시
3. 이 문서와 `docs/`

과제가 다른 언어·프레임워크·스타터 코드를 지정하면 이 boilerplate를 쓰지 않는다. 필요한 패턴(`lib/auth`, `withAuth`)만 참고한다.

## 진행 방식

- 막히지 않는다. 결과를 바꾸는 치명적 모호함만 질문하고, 나머지는 합리적 가정을 `DECISIONS.md`에 한 줄로 기록한 뒤 진행한다.
- 하나의 수직 흐름(로그인 → 입력 → 서버 검증 → 저장/계산 → 결과 화면)을 먼저 끝낸다. 디자인·리팩터링·부가 기능은 그 뒤다.
- 과제 코드는 feature 디렉터리에 둔다: `app/(app)/<feature>/`, `app/api/<feature>/`, `server/<feature>/`. 첫 리소스는 `docs/FEATURE_TEMPLATE.md`를 복사해 시작한다.
- 보호 API는 `withAuth(handler, { role })`, 보호 화면은 `app/(app)/` 아래에 두고 역할 제한 화면은 `requirePageUser("ADMIN")`을 호출한다. 권한은 항상 서버에서 검사한다.
- 몇 초 안에 끝나는 계산은 API 요청 안에서 동기로 실행한다. Job/Worker는 오래 걸리는 작업에만 쓴다.
- 새 의존성 설치는 꼭 필요할 때만 한다. 설치가 5분 넘게 막히면 표준 기능으로 대체한다.
- 데이터 파일 전체를 출력하지 않는다. 헤더·샘플·통계만 확인한다.

## 검증

- 핵심 단계에서만 `pnpm build`, `pnpm test:e2e`를 실행한다. Chromium을 설치할 수 없으면 서버를 띄운 뒤 `bash scripts/smoke.sh`를 실행한다.
- 완료를 보고할 때는 실제 실행한 명령과 결과를 붙인다. 실행하지 않은 것은 "미검증"으로 표시한다.
- 개발 서버는 `pnpm dev`(0.0.0.0:3000)로 실행하고 터미널을 닫지 않는다.

## 기록

- `DECISIONS.md`: 가정, 선택 이유, 버린 대안, 검증 결과. 짧게 유지한다.
- 안정된 마일스톤마다 git commit. `git push`는 하지 않는다.
- 관리자 시드 계정: `admin@example.com` / `.env`의 `SEED_ADMIN_PASSWORD`. 다른 역할이 필요하면 `pnpm db:promote <email>`을 쓰거나 `prisma/seed.ts`를 수정한다.
