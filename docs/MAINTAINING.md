# Boilerplate 유지보수 규칙

이 문서는 boilerplate 자체를 개선할 때만 적용한다. 시험 중에는 `scripts/exam-init.sh`가 이 문서와 `COMPLETED.md`를 삭제한다.

- 공통 기반(인증·세션·DB·권한·Job)만 넣는다. 특정 도메인 모델·화면은 넣지 않는다. 형식 예시는 `docs/FEATURE_TEMPLATE.md`에 둔다.
- 템플릿 코드를 바꾸면 실제 feature로 만들어 `pnpm build`와 `pnpm test:e2e`를 통과시킨 뒤 문서로 옮긴다.
- 의존성은 정확한 버전으로 고정하고 `pnpm-lock.yaml`을 함께 갱신한다.
- 구현이 끝난 사항은 `COMPLETED.md`에 최신 항목이 가장 위에 오도록 기록한다.
- `AGENTS.md`는 시험 중 Codex가 읽는 문서다. boilerplate 개발 규칙을 그곳에 다시 넣지 않는다.
