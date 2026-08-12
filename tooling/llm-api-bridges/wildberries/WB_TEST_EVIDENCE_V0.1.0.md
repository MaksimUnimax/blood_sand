# Wildberries Bridge v0.1.0 — source test evidence

Date: **2026-08-12**

## Fresh source suite

Final source run before GitHub commit / production packaging:

- tests: **365**
- pass: **365**
- fail: **0**
- cancelled/skipped/todo: **0**

## Operation execution matrix

All **157 production aliases** execute through the real `wb_contract.js` + `wb_provider.js` test runtime.

For every alias, the test asserts:

- fixed origin/path/method;
- required query/path/body construction;
- representative body for every body-required operation;
- Bearer Authorization generated locally rather than supplied by command;
- exactly **one** mock `fetch`;
- `WB_RESULT_V1`/response metadata;
- no hidden retry.

All **53 body-required operations** have explicit fixtures. Adding another body-required alias without a fixture makes the suite fail.

## Lifecycle/emulator coverage

Covered contours include manual mode, autorun, conversation binding, stale owner/run/conversation, Pause/Resume/Stop, command duplicate/single-flight, 50-way concurrency, request ownership, delivery commit/confirmation/reconciliation, restart recovery, controlled provider errors, 429, network failure, credential import/export/checksum, popup failure paths, status-card dismiss, writing-block capture and source/reference guards.

## Raw V8 executable-line gate

Coverage is computed from raw V8 ranges per independent test process. Range coverage is OR-combined per compatible production source instance; zero ranges from one synthetic process are never allowed to override a positive range from another process. `service_worker.js` coverage is accepted only when its V8 source length matches the current production source. Content emulator timer substitutions are equal-length test-only literal replacements, preserving all production function offsets; the export hook is appended at the closing IIFE.

Final result:

- executable production lines: **6775**
- covered executable production lines: **6775**
- uncovered: **0**
- line gate: **100.0%**

The exact coverage report is retained as build evidence during packaging.

## Acceptance boundary

This evidence is **AUTOMATED TESTED** only. It does not claim a real Wildberries seller-token/account request or user-side Chrome acceptance.
