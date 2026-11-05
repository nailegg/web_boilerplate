#!/usr/bin/env bash
# 시험 환경에서 clone 직후 한 번 실행한다. 과제 루트(WS) 아래 web/에 clone되어 있다고 가정한다.
#   cd <과제 루트> && git clone https://github.com/nailegg/web_boilerplate.git web && bash web/scripts/exam-init.sh
# 하는 일
#   1. boilerplate 개발 이력·유지보수 문서 삭제 (web/AGENTS.md 포함 → 과제 루트 AGENTS.md 하나만 남김)
#   2. 과제 루트에 DECISIONS.md가 없으면 생성, web/.env 생성
#   3. 과제 루트를 git 저장소로 두고 web/만 출처를 밝힌 baseline 커밋 (과제 데이터는 추가하지 않음)
set -euo pipefail
WEB="$(cd "$(dirname "$0")/.." && pwd)"
WS="$(dirname "$WEB")"
cd "$WEB"
SOURCE="$(git remote get-url origin 2>/dev/null || echo "https://github.com/nailegg/web_boilerplate.git")"
REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

rm -rf .git AGENTS.md COMPLETED.md BOILERPLATE_IMPROVEMENT_PLAN.md test-results playwright-report
[ -f .env ] || cp .env.example .env
[ -f "$WS/DECISIONS.md" ] || printf '# 결정 기록\n\n| 시각 | 결정·가정 | 근거 | 검증 |\n|---|---|---|---|\n' > "$WS/DECISIONS.md"

GIT=(git -C "$WS")
git config user.email >/dev/null 2>&1 || GIT=(git -C "$WS" -c user.name=examinee -c user.email=examinee@localhost)
if [ "$(git -C "$WS" rev-parse --show-toplevel 2>/dev/null)" != "$WS" ]; then git -C "$WS" init -q; fi
"${GIT[@]}" add "$WEB"
for f in AGENTS.md CONTRACT.md DECISIONS.md; do [ -f "$WS/$f" ] && "${GIT[@]}" add "$WS/$f"; done
"${GIT[@]}" commit -q -m "baseline: web boilerplate from $SOURCE@$REV" && echo "baseline committed in $WS"

[ -f "$WS/AGENTS.md" ] || echo "WARN: 과제 루트에 AGENTS.md가 없다. ~/playbook/templates/AGENTS.md를 복사한다."

if command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
elif command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
else PNPM="npx -y pnpm@10.33.0"; fi
echo "next: cd web && $PNPM install --frozen-lockfile && $PNPM bootstrap && bash scripts/check-placeholders.sh"
