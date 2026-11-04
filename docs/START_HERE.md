# 시작하기

이 저장소는 특정 제품을 이어서 개발하는 프로젝트가 아니라, 인증이 필요한 웹서비스의 핵심 기능을 빠르게 시작하기 위한 기반이다.

## 복제 후 실행

```bash
git clone <repository-url>
cd <repository-directory>
pnpm install
cp .env.example .env
pnpm bootstrap
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열고 로그인 화면을 확인한다. Job을 사용하는 과제라면 별도 터미널에서 Worker를 실행한다.

```bash
pnpm worker
```

## 에이전트가 처음 수행할 확인

1. `AGENTS.md`를 읽는다.
2. 이 문서와 `TASK_FIT.md`를 읽는다.
3. 과제에 인증·권한·DB·Job이 필요한지 분류한다.
4. `.env`, DB 초기화, 로그인 화면, 보호된 API를 확인한다.
5. 과제별 코드는 공통 기반을 수정하지 않고 새 feature 디렉터리에 추가한다.
6. 핵심 흐름을 먼저 연결한 뒤 build와 E2E를 실행한다.

## 기본 실행 기준

- 기본 DB는 SQLite 파일이다.
- 기본 Worker는 단일 프로세스다.
- 외부 서비스 없이 웹 앱과 인증 기반을 먼저 실행할 수 있다.
- 동시성이나 외부 인프라가 필요한 경우에만 스택을 확장한다.
