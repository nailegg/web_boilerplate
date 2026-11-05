# WebService Boilerplate 유지보수 규칙

이 파일은 boilerplate 자체를 개선할 때만 적용한다. 시험 환경에서는 `scripts/exam-init.sh`가 이 파일을 삭제하고, 과제 루트의 `AGENTS.md` 하나만 남긴다. 시험 중 에이전트용 안내는 `BOILERPLATE.md`에 둔다.

## 저장소 목적

3시간 내 AI 기반 E2E 구현 평가에서 빠르게 재사용할 수 있는 웹서비스 Boilerplate를 개발한다.
인증·RBAC, DB, UI, CRUD, Job 실행을 실행 가능한 MVP 수준으로 제공한다.

## 작업 규칙

- 프론트엔드와 백엔드는 분리된 서비스가 아니라 직접 통합해 구현한다.
- 공통 기반(인증·세션·DB·권한·Job)만 넣는다. 특정 도메인 모델·화면은 넣지 않고, 형식 예시는 `docs/FEATURE_TEMPLATE.md`에 둔다.
- 과제에서 반드시 교체·삭제해야 하는 예시 코드에는 `BOILERPLATE-PLACEHOLDER` 주석을 붙인다. `scripts/check-placeholders.sh`가 이 표시를 찾는다.
- 템플릿 코드를 바꾸면 실제 feature로 만들어 `pnpm build`와 `pnpm test:e2e`를 통과시킨 뒤 문서로 옮긴다.
- 의존성은 정확한 버전으로 고정하고 `pnpm-lock.yaml`을 함께 갱신한다.
- 매 작업마다 전체 QA를 반복하지 않고, 핵심 단계에서 빌드와 테스트를 수행한다.
- 구현이 완료된 사항은 `COMPLETED.md`에 최신 구현이 가장 위에 오도록 역순으로 기록한다.
- 요구사항이 모호하거나 기술적 선택이 필요하면 구현 전에 질문한다.
