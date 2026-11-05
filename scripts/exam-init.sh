#!/usr/bin/env bash
# 시험 환경에서 clone 직후 한 번 실행한다. 과제 루트(WS) 아래 web/에 clone되어 있다고 가정한다.
#   cd <과제 루트> && git clone --depth 1 https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh --install
# 하는 일 (git commit·push·init은 하지 않는다 — 시험 규정상 금지)
#   1. boilerplate 개발 이력·유지보수 문서 삭제 (web/.git, web/AGENTS.md 포함 → 과제 루트 AGENTS.md 하나만 남김)
#   2. 시험 중 쓰지 않는 파일 삭제 (README.md, docs/ 중 FEATURE_TEMPLATE·ACCESS_POLICY_GUIDE 외, 브라우저 E2E)
#   3. 과제 루트 DECISIONS.md에 반입 출처 기록 (없으면 생성), web/.env 생성
#   4. pnpm이 없으면 설치, --install이면 의존성 설치와 DB bootstrap까지 실행
set -euo pipefail
WEB="$(cd "$(dirname "$0")/.." && pwd)"
WS="$(dirname "$WEB")"
cd "$WEB"

# 위치 검사: <과제 루트>/web 바로 아래여야 한다. 이중 디렉터리(web/web_boilerplate)나 다른 이름이면 중단한다.
if [ "$(basename "$WEB")" != "web" ] || [ "$(basename "$WS")" = "web" ] || [ ! -f "$WS/AGENTS.md" ]; then
  echo "ERROR: 위치가 맞지 않다. 현재 boilerplate 위치: $WEB"
  echo "  과제 루트(README·AGENTS.md가 있는 곳)에서 다음처럼 clone해야 한다:"
  echo "    cd <과제 루트> && git clone --depth 1 https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh --install"
  echo "  과제 루트에 AGENTS.md가 없으면 먼저: cp ~/playbook/templates/AGENTS.md <과제 루트>/AGENTS.md"
  exit 1
fi

# 정리는 clone 직후 한 번만 한다(.git이 없으면 이미 정리된 상태). 설치 단계는 다시 실행해도 된다.
if [ -d .git ]; then
  SOURCE="$(git remote get-url origin 2>/dev/null || echo "https://github.com/nailegg/web_boilerplate.git")"
  REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  rm -rf .git AGENTS.md COMPLETED.md BOILERPLATE_IMPROVEMENT_PLAN.md test-results playwright-report tests playwright.config.ts
  rm -f README.md docs/START_HERE.md docs/TASK_FIT.md docs/RUNTIME_SETUP.md docs/INTEGRATION_GUIDE.md
  [ -f .env ] || cp .env.example .env
  [ -f "$WS/DECISIONS.md" ] || printf '# 결정 기록\n\n' > "$WS/DECISIONS.md"
  echo "- web/ 반입: $SOURCE@$REV (공개 boilerplate, 개발 이력 제거)" >> "$WS/DECISIONS.md"
  echo "web/ 정리 완료, DECISIONS.md에 출처 기록"
else
  echo "web/은 이미 정리되어 있다(정리 단계 건너뜀)"
fi

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  command -v pnpm >/dev/null 2>&1 || npm i -g pnpm@10.33.0 >/dev/null 2>&1 || true
fi
if command -v pnpm >/dev/null 2>&1; then PNPM=pnpm; else PNPM="npx -y pnpm@10.33.0"; echo "WARN: pnpm 설치 실패. 이후 'pnpm' 대신 '$PNPM'을 쓴다."; fi

if [ "${1:-}" = "--install" ]; then
  $PNPM install --frozen-lockfile
  $PNPM bootstrap
  echo "설치·bootstrap 완료. 다음: cd web && $PNPM dev   (서버는 하나만)"
else
  echo "next: cd web && $PNPM install --frozen-lockfile && $PNPM bootstrap"
fi
