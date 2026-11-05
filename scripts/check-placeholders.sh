#!/usr/bin/env bash
# 제출 전 교체되지 않은 boilerplate 예시 코드를 찾는다. 0건이어야 한다.
cd "$(dirname "$0")/.."
HITS="$(grep -rn "BOILERPLATE-PLACEHOLDER" app components lib server worker prisma tests 2>/dev/null)"
LEFTOVER="$(grep -n "^model Item " prisma/schema.prisma; ls -d server/items app/api/items "app/(app)/items" 2>/dev/null)"
if [ -n "$LEFTOVER" ]; then HITS="$HITS${HITS:+$'\n'}$LEFTOVER  # FEATURE_TEMPLATE의 Item 이름이 남아 있음"; fi
if [ -z "$HITS" ]; then echo "OK: 남은 placeholder 없음"; exit 0; fi
echo "$HITS"
echo "FAIL: $(echo "$HITS" | wc -l | tr -d ' ')건. BOILERPLATE.md의 '반드시 교체·삭제할 것'을 따른다."
exit 1
