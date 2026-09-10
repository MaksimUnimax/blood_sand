# Ozon mixed HELP/API live evidence — 2026-09-10

Status: LIVE VALIDATION IN PROGRESS. This document records only observed post-install evidence. It does not promote the repair to LIVE PASS by itself.

## Tested artifact authority

- repair: mixed HELP/API ordered discovery + startup prompt
- runtime version observed in live result: `0.1.19`
- pre-handoff executable source commit: `037235b773d571c0fab7c8146e6bd441601e4c98`
- exact pre-handoff artifact: `OZON_BRIDGE_v0.1.19_MIXED_HELP_API_STARTUP_PROMPT_20260910.zip`
- exact pre-handoff artifact SHA-256: `1e88cd72f86ca0b4cda63033297e0bb5ca841def13909563e0774c7340e84abf`

The live result proves runtime behavior compatible with the patched v0.1.19 contract. Exact installed-byte identity is not independently observable from the returned batch result and therefore is not inferred here beyond the operator's use of the supplied test package.

## LIVE TEST 01 — HELP then API in one assistant response

### Input

```text
OZON_HELP_V2
{"cluster":"catalog_products"}

OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}
```

### Observed aggregate

- result envelope: `OZON_BATCH_RESULT_V1`
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery mode: `sequential_batch_single_delivery`
- result count: `2`
- capability probe performed: `false`
- query planner status: `complete`
- logical business result count: `1`
- physical business request count: `1`
- coalesced group count: `0`

### Observed result 1 — HELP

- result type: `OZON_GUIDANCE_RESULT_V2`
- status: `cluster_selected`
- cluster: `catalog_products`
- section: `null`
- external request executed: `false`
- physical business request count: `0`
- error: `null`
- guidance choices were returned for catalog sections

### Observed result 2 — API

- result type: `OZON_RESULT_V1`
- request ID: `35a8d157-5571-4cdb-8733-7af261fe5f2e`
- operation: `seller_product_list`
- logical command fingerprint: `9d82cd2e`
- physical command fingerprint: `9d82cd2e`
- command transformed: `false`
- external request executed: `true`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- HTTP status: `200`
- elapsed: `1433 ms`
- pagination metadata: `null`
- rate-limit metadata: `null`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- provider returned one item in this bounded response and reported total `76`
- fresh continuation value observed: `last_id=WzEwODI4NDgzNzUsMTA4Mjg0ODM3NV0=`; it is recorded as evidence only and MUST NOT be consumed except by a new explicit pagination command if such a test is intentionally selected

### Verdict

`LIVE TEST 01 = PASS`

This test directly proves the repaired failing boundary for the `HELP → API` ordering:

1. HELP and API coexist in one admitted assistant source.
2. Source order is preserved in the delivered aggregate.
3. HELP terminates locally with zero physical provider requests.
4. Exactly one API command produces exactly one physical business request.
5. The API request reaches Ozon and returns HTTP 200.
6. Logical and physical fingerprints match and `command_transformed=false`.
7. No hidden second business request is visible in aggregate accounting.

## LIVE TEST 02 — API then HELP in one assistant response

### Input

```text
OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}

OZON_HELP_V2
{"cluster":"stocks_inventory"}
```

### Observed aggregate

- result envelope: `OZON_BATCH_RESULT_V1`
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery mode: `sequential_batch_single_delivery`
- result count: `2`
- capability probe performed: `false`
- query planner status: `complete`
- coalesced group count: `0`
- coalesced logical count: `0`
- logical business result count: `1`
- physical business request count: `1`

### Observed result 1 — API

- result type: `OZON_RESULT_V1`
- request ID: `ad608ce5-e362-413d-bc44-11b491d03836`
- operation: `seller_product_list`
- command fingerprint: `9d82cd2e`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- external request executed: `true`
- HTTP status: `200`
- elapsed: `1398 ms`
- capability probe executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- logical command fingerprint: `9d82cd2e`
- physical command fingerprint: `9d82cd2e`
- command transformed: `false`
- provider returned one bounded item and reported total `76`
- returned `last_id=WzEwODI4NDgzNzUsMTA4Mjg0ODM3NV0=`; it is evidence only and is not consumed automatically

### Observed result 2 — HELP

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `cluster_selected`
- cluster: `stocks_inventory`
- section: `null`
- external request executed: `false`
- physical business request count: `0`
- error: `null`
- stock/inventory guidance choices were returned

### Verdict

`LIVE TEST 02 = PASS`

This test proves the reverse `API → HELP` ordering on the installed runtime:

1. API and HELP coexist in one admitted assistant source.
2. Source order is preserved in the aggregate output.
3. The API is executed exactly once and reaches Ozon with HTTP 200.
4. HELP remains local and contributes zero provider business requests.
5. Aggregate accounting remains exactly one logical business result and one physical business request.
6. No coalescing or hidden additional provider business request is reported.
7. The API logical and physical fingerprints match and `command_transformed=false`.

Together, LIVE TEST 01 and LIVE TEST 02 live-prove both basic mixed orderings required by the repaired source-ordered typed-envelope batch contract.

## LIVE TEST 03 — malformed HELP then valid API

### Input

```text
OZON_HELP_V2 nope
OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}
```

This input exactly mirrors the malformed-HELP isolation shape used by the authoritative pre-handoff regression.

### Observed aggregate

- result envelope: `OZON_BATCH_RESULT_V1`
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery mode: `sequential_batch_single_delivery`
- result count: `2`
- capability probe performed: `false`
- query planner status: `complete`
- coalesced group count: `0`
- coalesced logical count: `0`
- logical business result count: `1`
- physical business request count: `1`

### Observed result 1 — malformed HELP isolated locally

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `guidance_error`
- cluster: `null`
- section: `null`
- external request executed: `false`
- physical business request count: `0`
- error: `HELP_JSON_REQUIRED`
- descriptor error code: `INVALID_COMMAND`
- fallback guidance choices were returned

### Observed result 2 — later independent API survives

- result type: `OZON_RESULT_V1`
- request ID: `3be07ab6-23cc-4e44-b7d3-6286cc9b1246`
- operation: `seller_product_list`
- command fingerprint: `9d82cd2e`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- external request executed: `true`
- HTTP status: `200`
- elapsed: `1398 ms`
- capability probe executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- logical command fingerprint: `9d82cd2e`
- physical command fingerprint: `9d82cd2e`
- command transformed: `false`
- provider returned one bounded item and reported total `76`
- returned `last_id=WzEwODI4NDgzNzUsMTA4Mjg0ODM3NV0=`; it is evidence only and is not consumed automatically

### Verdict

`LIVE TEST 03 = PASS`

This test live-proves malformed HELP isolation without poisoning a later independent API envelope:

1. The malformed HELP is represented as its own local guidance error rather than aborting the complete source.
2. The malformed HELP performs zero provider business requests.
3. The exact expected error `HELP_JSON_REQUIRED` is surfaced.
4. The later independent API remains discoverable and is executed exactly once.
5. The API reaches Ozon with HTTP 200.
6. Aggregate accounting remains exactly one logical business result and one physical business request.
7. No coalescing, retry, or hidden second provider business request is visible.

## LIVE TEST 04 — malformed API then valid HELP

### Input

```text
OZON_API_V1
{"operation":"seller_product_list","args":{}}
OZON_HELP_V2
{"cluster":"finance"}
```

This input exactly mirrors the malformed-API isolation shape used by the authoritative pre-handoff regression.

### Observed aggregate

- result envelope: `OZON_BATCH_RESULT_V1`
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery mode: `sequential_batch_single_delivery`
- result count: `2`
- capability probe performed: `false`
- capability status: `not_resolved`
- query planner status: `pending`
- coalesced group count: `0`
- coalesced logical count: `0`
- logical business result count: `0`
- physical business request count: `0`

### Observed result 1 — malformed API isolated locally

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `cluster_suggested`
- cluster: `catalog_products`
- section: `null`
- external request executed: `false`
- physical business request count: `0`
- error: `UNKNOWN_TOP_LEVEL_FIELD`
- descriptor error code: `UNKNOWN_TOP_LEVEL_FIELD`
- descriptor intent operation: `seller_product_list`
- fallback catalog guidance choices were returned

### Observed result 2 — later independent HELP survives

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `cluster_selected`
- cluster: `finance`
- section: `null`
- external request executed: `false`
- physical business request count: `0`
- error: `null`
- finance guidance choices were returned

### Verdict

`LIVE TEST 04 = PASS`

This test live-proves malformed API isolation without poisoning a later independent HELP envelope:

1. The malformed API becomes its own local guidance result with `UNKNOWN_TOP_LEVEL_FIELD`.
2. The malformed API performs zero provider business requests.
3. The later independent HELP remains discoverable and is processed in source order.
4. HELP remains local and performs zero provider business requests.
5. Aggregate accounting reports zero logical business results and zero physical business requests.
6. No provider request, automatic retry, hidden pagination, polling, or fan-out is evidenced.
7. Together with LIVE TEST 03, both malformed-envelope directions are now live-proved.

## LIVE TEST 05 — disabled alias remains fail-closed in mixed source

### Input

```text
OZON_HELP_V2
{"cluster":"finance"}

OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}

OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}
```

This input mirrors the authoritative disabled-alias mixed regression sequence: HELP → disabled API alias → enabled API positive control.

### Observed aggregate

- result envelope: `OZON_BATCH_RESULT_V1`
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- delivery mode: `sequential_batch_single_delivery`
- result count: `3`
- capability probe performed: `false`
- capability status: `not_needed`
- query planner status: `complete`
- coalesced group count: `0`
- coalesced logical count: `0`
- logical business result count: `1`
- physical business request count: `1`

### Observed result 1 — HELP remains local

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `cluster_selected`
- cluster: `finance`
- external request executed: `false`
- physical business request count: `0`
- error: `null`

### Observed result 2 — disabled API remains blocked before provider execution

- result type: `OZON_GUIDANCE_RESULT_V2`
- guidance version: `2`
- status: `cluster_suggested`
- cluster: `finance`
- external request executed: `false`
- physical business request count: `0`
- error: `OPERATION_BLOCKED`
- descriptor error code: `OPERATION_BLOCKED`
- descriptor intent operation: `finance_transaction_list_v3`
- descriptor parameter keys: `filter`, `page`, `page_size`

### Observed result 3 — later enabled API survives

- result type: `OZON_RESULT_V1`
- request ID: `8accd21c-89d5-4409-892a-8e36df380a0a`
- operation: `seller_product_list`
- command fingerprint: `9d82cd2e`
- external request executed: `true`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- HTTP status: `200`
- elapsed: `1416 ms`
- capability probe executed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- logical command fingerprint: `9d82cd2e`
- physical command fingerprint: `9d82cd2e`
- command transformed: `false`
- provider returned one bounded item and reported total `76`
- returned `last_id=WzEwODI4NDgzNzUsMTA4Mjg0ODM3NV0=`; it is evidence only and is not consumed automatically

### Verdict

`LIVE TEST 05 = PASS`

This test live-proves the disabled-alias fail-closed boundary inside the repaired mixed source path:

1. All three envelopes are preserved in source order.
2. HELP remains local and contributes zero provider business requests.
3. `finance_transaction_list_v3` remains blocked as `OPERATION_BLOCKED` and does not reach the provider.
4. Blocking the disabled alias does not poison the later independent enabled API envelope.
5. `seller_product_list` is the only provider business request, reaches Ozon, and returns HTTP 200.
6. Aggregate accounting is exactly one logical business result and one physical business request.
7. The enabled API request is preserved exactly and is not transformed.
8. No coalescing, hidden retry, pagination, polling, fan-out, or second provider business request is evidenced.

## Current live validation cursor

- TEST-01 HELP→API: PASS
- TEST-02 API→HELP: PASS
- TEST-03 malformed HELP→valid API: PASS
- TEST-04 malformed API→valid HELP: PASS
- TEST-05 disabled alias mixed fail-closed: PASS
- malformed-envelope isolation both directions: PASS
- five selected mixed patch live cases: PASS
- startup prompt live observation: NOT RUN
- formal LIVE-GATE-01..05 certification: OPEN
