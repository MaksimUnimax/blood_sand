# STD-13 post-repair Run 3 — FBO stock read transient 429

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Target supply order: `122149074` / `2000062599609`.

## Context

Run 1 established that the supply is no longer stuck before acceptance:

- order state: `ACCEPTANCE_AT_STORAGE_WAREHOUSE`;
- supply state: `ACCEPTED_AT_STORAGE_WAREHOUSE`;
- bundle: `019feae9-0fbe-75af-8f63-b9df1ca38840`.

Run 2 replayed the bundle through the current runtime and returned the same complete 9-SKU / 54-unit composition as the historical 2026-09-02 snapshot, with `has_next=false`.

Run 3 is intended to test whether those same 9 SKUs are currently represented in FBO stock after supply acceptance.

## Run 3 command

Operation: `fbo_stock_by_warehouse`
Params:

```json
{"skus":["2559748332","2559437928","1636048691","2183985513","2184234912","1640330072","1640251697","2326866320","1602717077"],"limit":100}
```

## Observed result

Request id: `0f7d35e7-b488-42e4-957b-85810878f764`
HTTP: `429`
Provider category: `rate_limit`
Provider code: `8`
External request executed: `true`
Logical/physical business requests: `1/1`
Automatic retry: `false`
Retry-After: `1`
Entitlement: `SUPPORTED_AND_ENTITLED`
Command transformed: `true`
Exact request preserved: `false`

No FBO business data was returned, so this is not a stock result and cannot be interpreted as zero stock or missing materialization.

## Recovery rule

The provider supplied an explicit `Retry-After: 1`. Under `NO_SKIP_ON_FAILURE`, STD-13 remains active and the same logical FBO read must be repeated after the provider cooldown. Do not switch to another business question and do not infer stock state from the 429.

The retry must preserve the exact logical SKU set and `limit=100`. The elapsed manual interaction time already exceeds the provider's one-second retry hint, so the next operator action is an immediate same-command replay.

## Reliability finding

Business answerability: `PENDING_RETRY`.
Provider/API incident: `TRANSIENT_429_WITH_EXPLICIT_RETRY_AFTER_1`.
Automatic recovery: `NO`.
Operator must continue the same business job: `YES`.

Checkpoint:
`STD_13_RUN3_FBO_TRANSIENT_429_RETRY_AFTER_1_SAME_LOGICAL_COMMAND_NEXT`
