#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 prepare_test_tree.py
node --test --experimental-test-coverage tests/*.test.js
python3 build_release.py --source ozon-bridge-v0.1.5-extension --output ozon-bridge-v0.1.5-extension.zip
