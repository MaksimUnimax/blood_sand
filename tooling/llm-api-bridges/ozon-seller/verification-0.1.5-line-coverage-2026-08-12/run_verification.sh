#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OZON_ROOT="$(cd "$HERE/.." && pwd)"
REF15="$OZON_ROOT/reference-0.1.5"
REF14="$OZON_ROOT/reference-0.1.4"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

python3 "$REF15/prepare_test_tree.py"
cp -a "$REF15/ozon-bridge-v0.1.5-extension" "$TMP/ozon-bridge-v0.1.5-extension"
cp -a "$REF15/tests" "$TMP/tests"
patch -d "$TMP" -p1 --forward --batch -i "$HERE/extra-line-coverage-tests.diff"
mkdir -p "$TMP/v8"
(
  cd "$TMP"
  NODE_V8_COVERAGE="$TMP/v8" node --test --experimental-test-coverage tests/*.test.js
)
python3 "$HERE/changed_line_execution_audit.py" \
  --base "$REF14/ozon-bridge-v0.1.4-extension" \
  --new "$TMP/ozon-bridge-v0.1.5-extension" \
  --coverage "$TMP/v8" \
  --tests "$TMP/tests"
