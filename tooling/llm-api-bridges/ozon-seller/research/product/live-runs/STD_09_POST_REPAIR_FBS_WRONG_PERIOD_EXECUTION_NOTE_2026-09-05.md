# STD-09 post-repair — wrong-period FBS execution note — 2026-09-05

Status: EXECUTION_OPERATOR_ERROR / BRIDGE PASS / NOT VALID STD-09 EVIDENCE

## What happened

The active STD-09 business question is `Продажи за вчера по складам.` For this run, the target business date is `2026-09-04`.

After the FBS privacy gate was enabled, the assistant accidentally issued an FBS command for `2026-09-01` instead of `2026-09-04`:

```json
{"operation":"fbs_posting_list","params":{"filter":{"since":"2026-09-01T00:00:00Z","to":"2026-09-01T23:59:59Z"},"limit":100,"sort_dir":"ASC","translit":false,"with":{"analytics_data":true,"barcodes":false,"financial_data":false,"legal_info":false}}}
```

The Bridge executed that command correctly.

## Transport result

- request_id: `922711f6-d3a9-4fa3-a481-4ba4986c49f7`
- operation: `fbs_posting_list`
- HTTP: `200`
- external_request_executed: `true`
- exact_request_preserved: `true`
- command_transformed: `false`
- logical business result count: `1`
- physical business request count: `1`
- has_next: `false`
- cursor: empty

## Provider result for 2026-09-01

The provider returned four FBS postings from the requested wrong date. One is currently cancelled and three are non-cancelled. All are attributed to seller warehouse `Златоуст Чёт`.

These rows MUST NOT be merged into the current STD-09 result because the date is wrong.

## Classification

- Bridge/runtime: PASS
- FBS privacy gate after enabling setting: PASS
- STD-09 business evidence: INVALID_FOR_TARGET_PERIOD
- Root cause: assistant-issued wrong date, not an Ozon or Bridge defect

## Required continuation

Re-run the same FBS query for the correct target window:

`2026-09-04T00:00:00Z` through `2026-09-04T23:59:59Z`.

Checkpoint: `STD_09_FBS_PRIVACY_GATE_PASS_WRONG_PERIOD_DISCARDED_CORRECT_2026_09_04_RERUN_NEXT`
