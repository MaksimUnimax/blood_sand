# Ozon Performance Step 8 — formal acceptance v2

**Status:** `ACCEPTED`

## Accepted scope

- Performance authority: `48 / 48` terminal operations.
- Current production Performance reads: `21`.
- Source-terminal non-current operations: `27`.
- New runtime implementations required: `0`.
- Unknown / pending / unresolved: `0 / 0 / 0`.
- Combined current-read surface entering Step 9: `245 Seller + 21 Performance = 266`.

## Verification

- Fresh partition and terminal outputs reproduced from repository sources.
- Existing Performance matrix and read-coverage regressions passed.
- Linux and Windows outputs are byte-identical.
- Fresh repository reproduction equals the downloaded Linux artifact byte-for-byte.
- Independent out-of-CI reverification remains PASS.

## Canonical protection

- Canonical branch: `repair/ozon-v2-b1-stocks-warehouse-2026-08-29`.
- Canonical commit: `8ee16f38bf2ec60e4b2e42192c2f41d87021b214`.
- Canonical modified: `false`.

## Next stage

`repair/ozon-step9-full-integration-266-reads-2026-09-01` — `STEP9_FULL_INTEGRATION_266_CURRENT_READS`.

## Markers

```text
PERFORMANCE_STEP8_48_EXHAUSTIVE_TERMINAL_MATRIX_PASS
PERFORMANCE_STEP8_CURRENT_READS_21_PRESERVED_PASS
PERFORMANCE_STEP8_REMAINING_TERMINAL_DECISIONS_27_PASS
PERFORMANCE_STEP8_NEW_RUNTIME_IMPLEMENTATION_0_PASS
PERFORMANCE_STEP8_UNKNOWN_0_PASS
PERFORMANCE_STEP8_PENDING_0_PASS
PERFORMANCE_STEP8_UNRESOLVED_0_PASS
PERFORMANCE_STEP8_EXISTING_MATRIX_REGRESSION_PASS
PERFORMANCE_STEP8_EXISTING_READ_COVERAGE_REGRESSION_PASS
PERFORMANCE_STEP8_LINUX_WINDOWS_BYTE_IDENTICAL_PASS
PERFORMANCE_STEP8_FRESH_REPOSITORY_FREEZE_PASS
OZON_PERFORMANCE_STEP8_INDEPENDENT_REVERIFICATION_PASS
OZON_PERFORMANCE_STEP8_FORMALLY_ACCEPTED
```
