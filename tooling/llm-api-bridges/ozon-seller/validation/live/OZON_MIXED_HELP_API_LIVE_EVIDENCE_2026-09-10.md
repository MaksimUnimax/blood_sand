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

It does NOT by itself prove reverse ordering, malformed-envelope isolation in live runtime, disabled-alias behavior in a mixed live source, startup-prompt UI materialization, or the complete LIVE-GATE-01..05 set.

## Current live validation cursor

- TEST-01 HELP→API: PASS
- reverse API→HELP: NOT RUN
- malformed-envelope isolation: NOT RUN
- disabled alias mixed fail-closed: NOT RUN
- startup prompt live observation: NOT RUN
- final live certification: OPEN
