#!/usr/bin/env bash
# 시험 환경에서 clone 직후 한 번 실행한다. 과제 루트(WS) 아래 web/에 clone되어 있다고 가정한다.
#   cd <과제 루트> && git clone https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh
# 하는 일 (git commit·push·init은 하지 않는다 — 시험 규정상 금지)
#   1. boilerplate 개발 이력·유지보수 문서 삭제 (web/.git, web/AGENTS.md 포함 → 과제 루트 AGENTS.md 하나만 남김)
#   2. 시험 중 필요 없는 안내 문서 삭제 (README.md, docs/ 중 FEATURE_TEMPLATE·ACCESS_POLICY_GUIDE 외)
#   3. 과제 루트 DECISIONS.md에 반입 출처 기록 (없으면 생성), web/.env 생성
set -euo pipefail
WEB="$(cd "$(dirname "$0")/.." && pwd)"
WS="$(dirname "$WEB")"
cd "$WEB"

# 위치 검사: <과제 루트>/web 바로 아래여야 한다. 이중 디렉터리(web/web_boilerplate)나 다른 이름이면 중단한다.
if [ "$(basename "$WEB")" != "web" ] || [ "$(basename "$WS")" = "web" ] || [ ! -f "$WS/AGENTS.md" ]; then
  echo "ERROR: 위치가 맞지 않다. 현재 boilerplate 위치: $WEB"
  echo "  과제 루트(README·AGENTS.md가 있는 곳)에서 다음처럼 clone해야 한다:"
  echo "    cd <과제 루트> && git clone https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh"
  echo "  과제 루트에 AGENTS.md가 없으면 먼저: cp ~/playbook/templates/AGENTS.md <과제 루트>/AGENTS.md"
  exit 1
fi
SOURCE="$(git remote get-url origin 2>/dev/null || echo "https://github.com/nailegg/web_boilerplate.git")"
REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

rm -rf .git AGENTS.md COMPLETED.md BOILERPLATE_IMPROVEMENT_PLAN.md test-results playwright-report
rm -f README.md docs/START_HERE.md docs/TASK_FIT.md docs/RUNTIME_SETUP.md docs/INTEGRATION_GUIDE.md
[ -f .env ] || cp .env.example .env
[ -f "$WS/DECISIONS.md" ] || printf '# 결정 기록\n\n' > "$WS/DECISIONS.md"
echo "- $(date +%H:%M) web/ 반입: $SOURCE@$REV (공개 boilerplate, 개발 이력 제거)" >> "$WS/DECISIONS.md"
echo "web/ 정리 완료, DECISIONS.md에 출처 기록"

if command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
elif command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
else PNPM="npx -y pnpm@10.33.0"; fi
echo "next: cd web && $PNPM install --frozen-lockfile && $PNPM bootstrap && bash scripts/check-placeholders.sh"
