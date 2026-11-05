#!/usr/bin/env bash
# 브라우저 없이 인증·RBAC 핵심 흐름을 확인한다. 서버가 실행 중이어야 한다.
# 사용법: bash scripts/smoke.sh            (기본 http://127.0.0.1:3000)
#        BASE_URL=http://127.0.0.1:3001 bash scripts/smoke.sh
set -u
BASE="${BASE_URL:-http://127.0.0.1:3000}"
ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-admin12345}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILED=0

check() { # 이름 기대코드 curl 인자...
  local name="$1" expected="$2"; shift 2
  local actual
  actual="$(curl -s -o "$TMP/body" -w '%{http_code}' "$@")"
  if [ "$actual" = "$expected" ]; then echo "PASS $name ($actual)"; else echo "FAIL $name (expected $expected, got $actual): $(head -c 200 "$TMP/body")"; FAILED=1; fi
}

EMAIL="smoke-$(date +%s)@example.com"
JSON=(-H 'content-type: application/json')

check "비로그인 /api/auth/me"        401 "$BASE/api/auth/me"
check "회원가입"                     201 -c "$TMP/user" "${JSON[@]}" -d "{\"email\":\"$EMAIL\",\"password\":\"password123\",\"name\":\"smoke\"}" "$BASE/api/auth/register"
check "로그인 사용자 /api/auth/me"   200 -b "$TMP/user" "$BASE/api/auth/me"
check "일반 사용자 관리자 API"       403 -b "$TMP/user" "$BASE/api/admin/users"
check "잘못된 JSON"                  400 -b "$TMP/user" "${JSON[@]}" -d 'not-json' "$BASE/api/jobs"
check "관리자 로그인"                200 -c "$TMP/admin" "${JSON[@]}" -d "{\"email\":\"admin@example.com\",\"password\":\"$ADMIN_PASSWORD\"}" "$BASE/api/auth/login"
check "관리자 API"                   200 -b "$TMP/admin" "$BASE/api/admin/users"

# 과제 기능의 smoke는 아래에 같은 형식으로 추가한다.
# check "항목 생성" 201 -b "$TMP/user" "${JSON[@]}" -d '{"title":"x"}' "$BASE/api/items"

exit $FAILED
