#!/usr/bin/env bash
# 시험 환경에서 clone 직후 한 번 실행한다.
# boilerplate의 개발 이력(.git, COMPLETED.md 등)을 지우고, 출처를 밝힌 baseline 커밋 하나로 시작한다.
# 사용법: git clone https://github.com/nailegg/web_boilerplate.git web && cd web && bash scripts/exam-init.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SOURCE="$(git remote get-url origin 2>/dev/null || echo "https://github.com/nailegg/web_boilerplate.git")"
REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

rm -rf .git COMPLETED.md BOILERPLATE_IMPROVEMENT_PLAN.md docs/MAINTAINING.md test-results playwright-report
printf '# 결정 기록\n\n| 시각 | 결정·가정 | 근거 | 검증 |\n|---|---|---|---|\n' > DECISIONS.md
[ -f .env ] || cp .env.example .env

# 시험 환경에 git 사용자 정보가 없어도 커밋되도록 한다.
GIT=(git)
git config user.email >/dev/null 2>&1 || GIT=(git -c user.name=examinee -c user.email=examinee@localhost)

# 상위 디렉터리가 이미 git 저장소(시험 워크스페이스)면 그 저장소에 커밋하고, 아니면 여기서 새로 만든다.
if ROOT="$(git -C .. rev-parse --show-toplevel 2>/dev/null)"; then
  "${GIT[@]}" -C "$ROOT" add -A "$PWD"
  "${GIT[@]}" -C "$ROOT" commit -q -m "baseline: web boilerplate from $SOURCE@$REV" && echo "baseline committed in $ROOT"
else
  git init -q && git add -A && "${GIT[@]}" commit -q -m "baseline: web boilerplate from $SOURCE@$REV" && echo "baseline committed in $PWD"
fi

if command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
elif command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1; then PNPM=pnpm
else PNPM="npx -y pnpm@10.33.0"; fi
echo "next: $PNPM install --frozen-lockfile && $PNPM bootstrap && $PNPM dev"
