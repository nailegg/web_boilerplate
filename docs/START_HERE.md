# 시작하기

이 저장소는 특정 제품을 이어서 개발하는 프로젝트가 아니라, 인증이 필요한 웹서비스의 핵심 기능을 빠르게 시작하기 위한 기반이다.

## 시험 환경 반입

전체 절차와 프롬프트는 playbook의 `EXAM_RUNBOOK.md`를 따른다. 요약:

```bash
cd <과제 루트>                                   # 과제 README·데이터가 있는 곳
git clone https://github.com/nailegg/web_boilerplate.git web
bash web/scripts/exam-init.sh                     # web/AGENTS.md 삭제, DECISIONS.md, baseline 커밋
cd web && pnpm install --frozen-lockfile && pnpm bootstrap
```

- 과제 루트에는 `AGENTS.md`(playbook 템플릿)가 하나만 있다. `web/`에는 `AGENTS.md`가 없고 `BOILERPLATE.md`가 기반 코드 안내를 맡는다.
- 설치나 Prisma 엔진 다운로드가 5분 넘게 막히면 boilerplate를 포기하고 과제가 허용하는 가장 단순한 스택으로 전환한다.
- 교체해야 할 예시 코드는 `BOILERPLATE.md`의 표와 `bash scripts/check-placeholders.sh`로 확인한다.

## 기본 제공 화면

| 경로 | 접근 | 내용 |
|---|---|---|
| `/login`, `/register` | 공개 | 로그인·회원가입 |
| `/dashboard` | 로그인 | 작업공간 (과제 시작 화면으로 교체) |
| `/jobs` | 로그인 | Job 실행 예시 |
| `/admin` | ADMIN | 사용자 목록과 역할 변경 |

`app/(app)/` 아래 화면에는 상단 내비게이션(사용자명·역할·로그아웃·관리자 링크)과 로그인 검사가 자동으로 적용된다.
