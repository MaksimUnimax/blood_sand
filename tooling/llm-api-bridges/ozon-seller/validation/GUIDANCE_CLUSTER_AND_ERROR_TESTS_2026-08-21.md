# Ozon Bridge — Guided Command Discovery

## Cluster and local-error acceptance tests

**Artifact under test**: `OZON_BRIDGE_v0.1.19_GUIDED_COMMAND_DISCOVERY_2026-08-21.zip`  
**Branch / commit**: `feature/ozon-guided-command-discovery-2026-08-21` / `465183b0074265ea0cfe59b5200b64203ed49264`  
**Archive SHA-256**: `8886a8e4b3170095ea6eadae331bcc0494fce0442591c60bcef06d05de848b44`  
**Scope**: only the new local guided-command-discovery feature: cluster detection, `OZON_HELP_V1`, and local handling of invalid Ozon command attempts.  
**Explicitly out of scope**: Autorun, Manual button lifecycle, Work composer controls, delivery watcher, worker reset, Ozon timings, and normal business-operation testing. Those have separate test documents.

## What must happen

When an AI writes a wrong or invented `OZON_API_V1` command, the bridge must preserve the original local validation error and add safe local guidance. It must never repair, replace, or execute that invalid command.

There are only four permitted outcomes:

| Outcome | Meaning |
|---|---|
| `cluster_identified` | The attempted command strongly identifies one cluster. Return only that cluster’s allowed commands. |
| `cluster_required` | The attempt is unclear. Ask the AI to select one of the six clusters with `OZON_HELP_V1`. |
| `cluster_selected` | A valid `OZON_HELP_V1` selection was supplied. Return only commands in that cluster. |
| `unsupported_or_blocked` / `guidance_error` | The attempt is blocked, security-sensitive, malformed, or has an invalid help selection. It stays local. |

Every test in this document is local-only. Expected in every result:

- `OZON_GUIDANCE_RESULT_V1` is present;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- no capability probe, provider request, token request, quota use, retry, or pagination;
- no Ozon business data is claimed as retrieved.

## Fixed cluster inventory

| Cluster ID | What it covers | Only allowed operations in its result |
|---|---|---|
| `sales_analytics` | Revenue, ordered units, period/product analytics | `analytics_data` |
| `stock_inventory` | Current product stock | `stocks_current` |
| `search_visibility` | Buyer search queries and SKU search details | `product_queries`, `product_queries_details` |
| `fulfillment_supply` | FBO posting lists and supply orders | `posting_fbo_list`, `supply_order_get`, `supply_order_details` |
| `advertising_performance` | Read-only ad campaigns and statistics | `performance_campaigns`, `performance_expense`, `performance_daily`, `performance_campaign_product` |
| `account_access` | Seller credential roles | `roles` |

Never offer:

- `posting_fbs_get` — may expose customer PII;
- any advertising mutation: campaign create/enable/disable, bids, product additions/removals, or settings changes;
- arbitrary URL, host, method, headers, credentials, or token controls.

## How to run a case

1. Ask the AI to return the exact test text in one assistant code block, without changing it.
2. Run that exact assistant block through the extension’s ordinary Ozon action.
3. Copy the complete bridge result.
4. Compare it to the expected result below.
5. Append one row to the execution log. Never overwrite an earlier result.

Do not repeat a failed case automatically. Record the first failure with its complete result first.

## Preparation

| ID | Check | Expected | Status |
|---|---|---|---|
| P1 | Verify loaded archive hash. | Equals `8886a8e4b3170095ea6eadae331bcc0494fce0442591c60bcef06d05de848b44`. | NOT RUN |
| P2 | Run one deliberately invalid guidance case below and retain the entire output format. | It includes the original error and `OZON_GUIDANCE_RESULT_V1`; it makes zero requests. | NOT RUN |

## A. Recognize a clear cluster from an invalid AI attempt

Each case must preserve the original error and return the named cluster. No provider call is allowed.

| ID | Exact assistant block | Expected guidance status and cluster | Status |
|---|---|---|---|
| A1 | `OZON_API_V1 {"method":"performance/v2/order","params":{"date_from":"2026-08-10","date_to":"2026-08-17"}}` | `cluster_identified`, `sales_analytics`; offers `analytics_data` only. | NOT RUN |
| A2 | `OZON_API_V1 {"operation":"get_orders_performance","args":{"date_from":"2026-08-10","date_to":"2026-08-17"}}` | `sales_analytics` guidance or, only if confidence is intentionally insufficient, `cluster_required`; never execution. | NOT RUN |
| A3 | `OZON_API_V1 {"path":"/v1/analytics/data","params":{"date_from":"2026-08-10","date_to":"2026-08-17"}}` | `cluster_identified`, `sales_analytics`; `analytics_data` only. | NOT RUN |
| A4 | `OZON_API_V1 {"path":"/v4/product/info/stocks","params":{"product_id":["1082848375"]}}` | `cluster_identified`, `stock_inventory`; `stocks_current` only. | NOT RUN |
| A5 | `OZON_API_V1 {"path":"/v1/analytics/product-queries/details","params":{"skus":[1602711278]}}` | `cluster_identified`, `search_visibility`; only the two product-query operations. | NOT RUN |
| A6 | `OZON_API_V1 {"path":"/v3/posting/fbo/list","params":{}}` | `cluster_identified`, `fulfillment_supply`; only the three FBO/supply operations. | NOT RUN |
| A7 | `OZON_API_V1 {"path":"/v3/supply-order/get","params":{"order_ids":[1]}}` | `cluster_identified`, `fulfillment_supply`; only the three FBO/supply operations. | NOT RUN |
| A8 | `OZON_API_V1 {"path":"/api/client/statistics/expense/json","params":{"date_from":"2026-08-10","date_to":"2026-08-17"}}` | `cluster_identified`, `advertising_performance`; only the four advertising read operations. | NOT RUN |
| A9 | `OZON_API_V1 {"path":"/v1/roles","params":{}}` | `cluster_identified`, `account_access`; `roles` only. | NOT RUN |

## B. Require a cluster choice when the attempt is ambiguous

These cases must not be assigned to a cluster merely because of a weak word. They must return `cluster_required` and list all six fixed cluster IDs with brief descriptions.

| ID | Exact assistant block | Expected result | Status |
|---|---|---|---|
| B1 | `OZON_API_V1 {"operation":"get_data","params":{}}` | `cluster_required`; six clusters; zero requests. | NOT RUN |
| B2 | `OZON_API_V1 {"operation":"order","params":{}}` | `cluster_required`; do not guess sales or fulfilment. | NOT RUN |
| B3 | `OZON_API_V1 {"operation":"report","params":{"date_from":"2026-08-10"}}` | `cluster_required`; do not invent an analytics operation. | NOT RUN |
| B4 | `OZON_API_V1 {"operation":"unknown","params":{}}` | `cluster_required`; zero requests. | NOT RUN |
| B5 | `OZON_API_V1 {"operation":` | Original malformed-JSON error plus `cluster_required`; zero requests. | NOT RUN |

## C. Select every cluster with `OZON_HELP_V1`

For each test, the result must be `cluster_selected`. It must include only the listed cluster’s operations and no operation from another cluster.

| ID | Exact assistant block | Allowed operations in result | Status |
|---|---|---|---|
| C1 | `OZON_HELP_V1 {"cluster":"sales_analytics"}` | `analytics_data` only. | NOT RUN |
| C2 | `OZON_HELP_V1 {"cluster":"stock_inventory"}` | `stocks_current` only. | NOT RUN |
| C3 | `OZON_HELP_V1 {"cluster":"search_visibility"}` | `product_queries`, `product_queries_details` only. | NOT RUN |
| C4 | `OZON_HELP_V1 {"cluster":"fulfillment_supply"}` | `posting_fbo_list`, `supply_order_get`, `supply_order_details` only. | NOT RUN |
| C5 | `OZON_HELP_V1 {"cluster":"advertising_performance"}` | `performance_campaigns`, `performance_expense`, `performance_daily`, `performance_campaign_product` only. | NOT RUN |
| C6 | `OZON_HELP_V1 {"cluster":"account_access"}` | `roles` only. | NOT RUN |

For every C-case, also confirm that each displayed recipe is a normal `OZON_API_V1` shape, contains no credentials, no URL/host/header controls, and does not claim it has executed.

## D. Invalid help marker and mixed-envelope protection

All cases remain local-only and must return `guidance_error` or another precise local rejection. They must not fall through to Ozon planning.

| ID | Exact assistant block | Expected result | Status |
|---|---|---|---|
| D1 | `OZON_HELP_V1 {"cluster":"does_not_exist"}` | Invalid cluster error plus the six-cluster selection question. | NOT RUN |
| D2 | `OZON_HELP_V1 {"cluster":"sales_analytics","extra":true}` | Extra top-level field rejected. | NOT RUN |
| D3 | `OZON_HELP_V1 {}` | Missing cluster rejected. | NOT RUN |
| D4 | `OZON_HELP_V1 {"cluster":1}` | Non-string cluster rejected. | NOT RUN |
| D5 | `OZON_HELP_V1 {"cluster":"sales_analytics"` | Malformed JSON rejected. | NOT RUN |
| D6 | Two help markers: `OZON_HELP_V1 {"cluster":"sales_analytics"}` followed by `OZON_HELP_V1 {"cluster":"stock_inventory"}` | Multiple help selections rejected; no partial selection. | NOT RUN |
| D7 | `OZON_HELP_V1 {"cluster":"sales_analytics"}` followed by `OZON_API_V1 {"operation":"roles","params":{}}` in the same assistant response. | Mixed HELP/API response rejected before all provider work; even the valid `roles` request must not run. | NOT RUN |

## E. Blocked and security-sensitive attempts

The bridge must preserve the security refusal, never offer the blocked action as a selectable command, and never make a provider request.

| ID | Exact assistant block | Expected result | Status |
|---|---|---|---|
| E1 | `OZON_API_V1 {"operation":"posting_fbs_get","params":{}}` | `unsupported_or_blocked`; `posting_fbs_get` never appears in options. | NOT RUN |
| E2 | `OZON_API_V1 {"operation":"performance_campaign_enable","params":{}}` | `unsupported_or_blocked`; no advertising mutation option. | NOT RUN |
| E3 | `OZON_API_V1 {"operation":"x","params":{"authorization":"secret-value"}}` | Security/transport rejection. The result and diagnostics must not echo `secret-value`. | NOT RUN |
| E4 | `OZON_API_V1 {"operation":"x","url":"https://example.invalid","params":{}}` | Transport-control rejection; no provider request. | NOT RUN |

## F. Preserve ordinary valid-command behavior

These are only routing checks, not new Ozon-operation tests. They prove the new guidance feature does not replace valid commands with help.

| ID | Exact assistant block | Expected result | External request | Status |
|---|---|---|---|---|
| F1 | `OZON_API_V1 {"operation":"stocks_current","params":{"filter":{"product_id":["1082848375"]},"limit":1}}` | Normal `OZON_RESULT_V1`, not `OZON_GUIDANCE_RESULT_V1`. | Yes, one | NOT RUN |
| F2 | One valid API marker plus one invalid API marker in the same assistant response. | Existing sequential API-batch behavior is preserved: invalid entry is local guidance/error; valid entry retains its original order and normal path. | One only for the valid entry | NOT RUN |
| F3 | A provider-originated HTTP 400 or 429 from an otherwise valid command, if it occurs naturally during separate normal testing. | It remains a provider error; the bridge must not append local cluster guidance and must not retry automatically. | Already occurred | NOT RUN |

## Acceptance rules

The new functionality passes only when:

1. P1–P2, A1–A9, B1–B5, C1–C6, D1–D7, E1–E4, and F1–F3 are recorded.
2. Every A–E local-only case has `external_request_executed=false` and `physical_business_request_count=0`.
3. Every C-case presents exactly its own cluster’s operations.
4. No blocked, mutation, PII, credential, URL, header, or arbitrary transport capability becomes selectable.
5. A valid command remains normal and is not replaced by guidance.
6. Any failure stays append-only below until a new artifact is supplied.

## Append-only execution log

| UTC time | Test ID | Result | `external_request_executed` / physical requests | Exact observed result / evidence | Next action |
|---|---|---|---|---|---|
