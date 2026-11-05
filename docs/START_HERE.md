# 시작하기

이 저장소는 특정 제품을 이어서 개발하는 프로젝트가 아니라, 인증이 필요한 웹서비스의 핵심 기능을 빠르게 시작하기 위한 기반이다.

## 시험 환경 반입 (약 3분)

과제 README를 먼저 읽고 [과제 적합성 판단](TASK_FIT.md)에서 "사용하지 않는 경우"에 해당하지 않을 때만 반입한다.

```bash
git clone https://github.com/nailegg/web_boilerplate.git web
cd web
bash scripts/exam-init.sh        # 개발 이력 제거, DECISIONS.md·.env 생성, baseline 커밋
pnpm install --frozen-lockfile   # pnpm이 없으면 exam-init.sh가 출력한 명령 사용
pnpm bootstrap
pnpm dev                         # 0.0.0.0:3000
```

과제 폴더 루트가 아니라 `web/` 하위에 clone한다. 과제 README·데이터와 boilerplate 파일이 섞이지 않게 하기 위해서다.

설치 확인 기준: `pnpm install` 또는 Prisma 엔진 다운로드가 5분 넘게 막히면 boilerplate를 포기하고 과제가 허용하는 가장 단순한 스택으로 전환한다.

## 에이전트가 처음 수행할 확인

1. 과제 README와 `AGENTS.md`를 읽는다.
2. 과제에 인증·역할·DB·Job이 필요한지 분류한다.
3. 로그인 화면, 관리자 화면(`/admin`), `bash scripts/smoke.sh` 결과를 확인한다.
4. 첫 리소스는 [Feature 템플릿](FEATURE_TEMPLATE.md)을 복사해 만든다.
5. 핵심 흐름을 먼저 연결한 뒤 build와 E2E를 실행한다.

## 기본 제공 화면

| 경로 | 접근 | 내용 |
|---|---|---|
| `/login`, `/register` | 공개 | 로그인·회원가입 |
| `/dashboard` | 로그인 | 작업공간 (과제 시작 화면으로 교체) |
| `/jobs` | 로그인 | Job 실행 예시 |
| `/admin` | ADMIN | 사용자 목록과 역할 변경 |

`app/(app)/` 아래 화면에는 상단 내비게이션(사용자명·역할·로그아웃·관리자 링크)과 로그인 검사가 자동으로 적용된다.
