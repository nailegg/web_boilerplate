#!/usr/bin/env bash
# 시험 환경에서 clone 직후 한 번 실행한다. 과제 루트(WS) 아래 web/에 clone되어 있다고 가정한다.
#   cd <과제 루트> && git clone https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh
# 하는 일 (git commit·push·init은 하지 않는다 — 시험 규정상 금지)
#   1. boilerplate 개발 이력·유지보수 문서 삭제 (web/.git, web/AGENTS.md 포함 → 과제 루트 AGENTS.md 하나만 남김)
#   2. 과제 루트 DECISIONS.md에 반입 출처 기록 (없으면 생성), web/.env 생성
set -euo pipefail
WEB="$(cd "$(dirname "$0")/.." && pwd)"
WS="$(dirname "$WEB")"
cd "$WEB"
SOURCE="$(git remote get-url origin 2>/dev/null || echo "https://github.com/nailegg/web_boilerplate.git")"
REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

rm -rf .git AGENTS.md COMPLETED.md BOILERPLATE_IMPROVEMENT_PLAN.md test-results playwright-report
[ -f .env ] || cp .env.example .env
[ -f "$WS/DECISIONS.md" ] || printf '# 결정 기록\n\n' > "$WS/DECISIONS.md"
echo "- $(date +%H:%M) web/ 반입: $SOURCE@$REV (공개 boilerplate, 개발 이력 제거)" >> "$WS/DECISIONS.md"
echo "web/ 정리 완료, DECISIONS.md에 출처 기록"

[ -f "$WS/AGENTS.md" ] || echo "WARN: 과제 루트에 AGENTS.md가 없다. ~/playbook/templates/AGENTS.md를 복사한다."

if command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
elif command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
else PNPM="npx -y pnpm@10.33.0"; fi
echo "next: cd web && $PNPM install --frozen-lockfile && $PNPM bootstrap && bash scripts/check-placeholders.sh"
