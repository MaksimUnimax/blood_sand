# Run 006 — Personal Data ON: explicit resubmit of all 13 gated reads

Date: 2026-09-01
Bridge: `ozon-llm-api-bridge` v0.1.19
Delivery mode: `sequential_batch_single_delivery`

## Status

`AUTHORIZED_EXPLICIT_RESUBMIT_13_ONE_REQUEST_EACH_PASS`

The owner explicitly resubmitted all 13 Personal-Data-gated operations after enabling the Personal Data setting.

Important: the owner message containing this batch result did **not** include the requested explicit `NO_REPLAY` attestation for the preceding setting transition, so the separate `enable_without_replay` check remains `UNCONFIRMED_BY_OWNER_MESSAGE` rather than being inferred.

## Batch envelope

- `result_count`: `13`
- `query_planner.status`: `complete`
- `logical_business_result_count`: `13`
- `physical_business_request_count`: `13`
- `coalesced_group_count`: `0`
- `coalesced_logical_count`: `0`
- capability probe: `performed=false`, `status=not_needed`

## Core invariant

- 13 explicit gated commands -> exactly 13 physical Ozon business requests: `PASS`
- every operation had `external_request_executed=true`: `PASS`
- no automatic retries were reported: `PASS`
- no capability probes were executed: `PASS`

## Per-operation outcome

| Operation | HTTP | Classification |
|---|---:|---|
| `arrival_pass_list` | 200 | `LIVE_PASS` |
| `rfbs_returns_get` | 400 | `PROVIDER_REQUEST_REJECTED_TEST_FIXTURE` |
| `conditional_cancellation_list` | 200 | `LIVE_PASS` |
| `finance_b2b_sales_json` | 200 | `LIVE_PASS` |
| `discount_task_list_v2` | 200 | `LIVE_PASS` |
| `fbp_archive_get` | 403 | `PROVIDER_PERMISSION_BLOCKED` |
| `fbp_archive_list` | 400 | `PROVIDER_REQUEST_REJECTED_TEST_FIXTURE` |
| `fbp_draft_get` | 403 | `PROVIDER_PERMISSION_BLOCKED` |
| `fbp_draft_list` | 400 | `PROVIDER_REQUEST_REJECTED_TEST_FIXTURE` |
| `fbp_order_get` | 403 | `PROVIDER_PERMISSION_BLOCKED` |
| `fbp_order_list` | 400 | `PROVIDER_REQUEST_REJECTED_TEST_FIXTURE` |
| `delivery_check` | 403 | `PROVIDER_PERMISSION_BLOCKED` |
| `delivery_checkout_v2` | 403 | `PROVIDER_PERMISSION_BLOCKED` |

## Outcome counts

- HTTP 200 successful business responses: `4/13`
- provider permission blocks (HTTP 403 / auth_or_permission code 7): `5/13`
- provider request rejections (HTTP 400 / provider_request code 3): `4/13`
- physical business requests: `13/13`
- automatic retries: `0`

The HTTP 400 cases used deliberately synthetic fixture identifiers/values from the frozen runtime contract (`return_id=1`, synthetic FBP supply/list inputs). They prove alias -> request builder -> correct live provider dispatch, but they are not promoted to successful business-semantic `LIVE_PASS` without a valid live entity.

Sensitive provider payloads, product names, SKUs and any potentially personal fields are intentionally not persisted in this repository record.