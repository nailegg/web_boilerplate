# 기능 추가 방법

## 기본 원칙

공통 기반은 인증·세션·DB 연결·권한 검사·Job 실행처럼 여러 과제에서 반복되는 기능만 제공한다. 과제별 업무 규칙은 feature 디렉터리에 둔다.

```text
app/<feature>/page.tsx
app/api/<feature>/route.ts
app/api/<feature>/[id]/route.ts
server/<feature>/service.ts
server/<feature>/validation.ts
tests/e2e/<feature>.spec.ts
```

## 수직 흐름 우선

새 기능은 다음 흐름 하나를 먼저 끝낸다.

```text
로그인
→ 핵심 입력
→ 서버 검증
→ 저장 또는 작업 실행
→ 결과 조회
```

이 흐름이 브라우저에서 동작한 뒤 검색, 필터, 통계, 고급 UI를 추가한다.

## 데이터 모델 추가

1. `prisma/schema.prisma`에 필요한 모델과 관계를 추가한다.
2. `pnpm db:push`로 로컬 DB에 반영한다.
3. `server/<feature>/validation.ts`에 입력 규칙을 둔다.
4. `server/<feature>/service.ts`에 업무 규칙을 둔다.
5. Route Handler는 인증·입력 검증·서비스 호출·응답 변환만 담당한다.
6. 화면은 API와 연결하고 로딩·빈 상태·오류 상태를 처리한다.

## Job 추가

시간이 오래 걸리는 작업은 요청에서 직접 계산하지 않고 Job을 생성한다.

1. Job 입력 형식을 정의한다.
2. `server/jobs/registry.ts`에 handler를 등록한다.
3. Job 결과와 실패 형식을 정의한다.
4. Worker를 실행해 상태 변화를 확인한다.
5. 성공·실패·재시도 E2E를 추가한다.

## 검증

```bash
pnpm build
pnpm test:e2e
```

기능마다 최소 한 개의 성공 흐름과 한 개의 권한 또는 입력 오류 흐름을 남긴다.
