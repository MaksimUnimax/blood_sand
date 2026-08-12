#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
python prepare_test_tree.py
node --test --experimental-test-coverage \
  tests/contract.test.js \
  tests/worker_preexec.test.js \
  tests/content_controlflow.test.js \
  tests/package_consistency.test.js
