# Ozon Bridge v0.1.19 — live ordinary-account validation ledger

Date started: 2026-08-20
Repository: `MaksimUnimax/blood_sand`
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`
Installed/live bridge version: `0.1.19`
Account class observed by live capability probe: ordinary Seller account, `subscription_type=UNSPECIFIED`, `is_premium=false`.

## Scope and recording rules

This ledger records real logged-in Ozon behavior that local/Codex tests cannot prove without the operator's account, credentials, provider responses, subscription tier, or live ChatGPT delivery path.

- Positive Premium-only scenarios are not claimed because no Premium account is available.
- Restricted/Premium-dependent scenarios may be tested negatively on the ordinary account.
- Each provider/business result is classified from the actual returned evidence; no inferred PASS.
- Invalid test commands caused by the test author are recorded separately and are not product failures.
- Open provider/contract mismatches remain open until independently resolved.
- Every new live result from this sequence is appended/updated in this ledger.

## Summary

| ID | Surface | Scenario | Status |
|---|---|---|---|
| 2.1 | credentials | correct Client-Id + invalid Api-Key | PASS |
| 2.2 | credentials | invalid Client-Id + correct Api-Key | PASS |
| 2.3 | credentials | credentials from two different Seller accounts | NOT EXECUTED |
| 3.1 | analytics_data | recent universal `revenue` | PASS |
| 3.2 | cache | compatible `ordered_units` projection cache hit | PASS |
| 3.3 | analytics_data | live values compared with Seller cabinet | PASS |
| 3.4 | cache | intentional cache miss | PASS |
| 3.5 | quota | Seller analytics minimum interval | PASS |
| 3.6 | planner | two compatible logical analytics commands coalesced | PASS |
| 4.1 | entitlement | all-restricted metric `hits_view` | PASS |
| 4.2 | entitlement | mixed `revenue` + `hits_view` | PASS |
| 4.3 | entitlement | multiple all-restricted metrics | PASS |
| 4.4 | entitlement | restricted dimension `brand` | PASS |
| 4.5 | entitlement | restricted sort `hits_view` | PASS |
| 4.6 | entitlement | restricted filter `hits_view GT 0` | PASS |
| 4.7 | entitlement | analytics history older than 3 months | PASS |
| 5.1 | product_queries | recent request on ordinary account with real SKU | OPEN CONTRACT MISMATCH |
| 5.2 | capability | one batch with three restricted analytics commands | PASS |
| 5.3 | product_queries | history older than 1 month | PASS |
| 5.4 | product_queries_details | restricted `BY_VIEWS` sort | PASS |
| 6.1 | stocks_current | full stocks list | PASS |
| 6.2 | stocks_current | pagination page 1, limit 1 | PASS |
| 6.3 | stocks_current | pagination page 2 | PASS |
| 6.4a | stocks_current | pagination page 3 | PASS |
| 6.4b | stocks_current | pagination page 4 | PASS |
| 6.4c | stocks_current | pagination page 5 | PASS |
| 6.5 | stocks_current | filter by `offer_id` | PASS |
| 6.6 | stocks_current | filter by `product_id` | PASS |
| 6.7 | stocks_current | empty business result | PASS |
| 6.8 | stocks_current | attempted filter by `sku` | NEEDS INVESTIGATION |
| X1 | command discovery | guessed unsupported `product_info` | INVALID TEST COMMAND; bridge rejection PASS |
| X2 | command discovery | guessed unsupported `capabilities` | INVALID TEST COMMAND; bridge rejection PASS |
| X3 | command validation | `stocks_current` missing required `filter` | INVALID TEST COMMAND; bridge rejection PASS |

---

## Detailed live results

### 2.1 — correct Client-Id + invalid Api-Key — PASS

Operator confirmed expected authentication failure behavior. No successful business data was accepted from invalid credentials.

### 2.2 — invalid Client-Id + correct Api-Key — PASS

Operator confirmed expected authentication failure behavior. No successful business data was accepted from invalid credentials.

### 2.3 — mismatched credentials across two Seller accounts — NOT EXECUTED

No second-account credential pair was available/used in this sequence.

### 3.1 — recent universal analytics `revenue` — PASS

Command shape: `analytics_data`, dates `2026-08-18..2026-08-19`, dimension `day`, metric `revenue`, limit `1000`.

Observed:
- HTTP 200.
- Seller capability probe not needed.
- 1 physical business request.
- Prefetch profile `analytics_basic_metrics_v1` executed physical metrics `revenue` + `ordered_units` while logical result projected `revenue`.
- 2026-08-18 revenue: `45900`.
- 2026-08-19 revenue: `45866`.
- Total revenue: `91766`.

### 3.2 — compatible `ordered_units` cache projection — PASS

Same compatible analytics shape, logical metric `ordered_units`.

Observed:
- 0 physical business requests.
- `external_request_executed=false`.
- Cache hit sourced from the prior prefetch request.
- 2026-08-18 ordered units: `27`.
- 2026-08-19 ordered units: `28`.
- Total: `55`.

### 3.3 — cabinet factual comparison — PASS

Operator compared returned analytics values with the Seller cabinet and confirmed exact agreement for the checked values.

### 3.4 — intentional cache miss — PASS

Changed analytics `limit` to `999`.

Observed:
- New physical business request executed.
- HTTP 200.

### 3.5 — analytics quota scheduling — PASS

A further compatible request was made with `limit=998` shortly after the prior physical request.

Observed:
- Provider calls were separated by more than the configured 60-second minimum interval.
- Quota family: `seller.analytics_data.v1`.
- Minimum interval: `60000 ms`.
- `automatic_retry=false`.

Boundary: visible countdown UI was not separately proven by this result.

### 3.6 — compatible logical analytics coalescing — PASS

Two logical commands in one batch, same date/shape, `limit=997`, metrics `revenue` and `ordered_units`.

Observed:
- `result_count=2`.
- `coalesced_group_count=1`.
- `coalesced_logical_count=2`.
- `physical_business_request_count=1`.
- One physical request contained both universal metrics and two logical results were projected correctly.

### Live user-typing non-crash observation — PASS, narrowly scoped

Operator reported that a previously running bridge result was still delivered while the operator was typing in ChatGPT. This proves that concurrent typing did not crash/drop that result. It is not used to over-claim every composer-wait lifecycle invariant.

### 4.1 — restricted metric `hits_view` — PASS

Observed capability:
- `/v1/seller/info` HTTP 200.
- `subscription_type=UNSPECIFIED`.
- `is_premium=false`.

Planning/result:
- Reason `all_requested_metrics_unavailable`.
- `SUBSCRIPTION_REQUIRED`.
- 0 physical business requests.
- `external_request_executed=false` for the analytics business request.

### 4.2 — mixed `revenue` + `hits_view` — PASS

Observed:
- Capability known ordinary/non-entitled.
- Analytics business request HTTP 200.
- Universal `revenue` executed.
- Restricted `hits_view` explicitly omitted.
- `partial=true`.
- Restricted metric was not included in the physical analytics request.

### 4.3 — multiple all-restricted metrics — PASS

Metrics: `hits_view`, `returns`, `cancellations`.

Observed:
- `SUBSCRIPTION_REQUIRED`.
- 0 business requests.
- `external_request_executed=false`.

### 4.4 — restricted dimension `brand` — PASS

Observed:
- Reason `restricted_dimension_changes_grain`.
- `unavailable_dimensions=["brand"]`.
- `SUBSCRIPTION_REQUIRED`.
- 0 business requests.

### 4.5 — restricted sort `hits_view` — PASS

Observed:
- Reason `restricted_sort_changes_result_set`.
- `unavailable_sort_keys=["hits_view"]`.
- `SUBSCRIPTION_REQUIRED`.
- 0 business requests / no silent removal of the sort.

### 4.6 — restricted filter `hits_view GT 0` — PASS

Observed:
- Reason `restricted_filter_changes_result_set`.
- `unavailable_filter_keys=["hits_view"]`.
- `SUBSCRIPTION_REQUIRED`.
- 0 business requests.
- Filter was not silently stripped.

### 4.7 — analytics history older than 3 months — PASS

Dates: `2026-04-01..2026-04-02`, dimension `day`, metric `revenue`.

Observed:
- Reason `history_over_3_months`.
- Required tiers Premium Plus / Premium Pro.
- `SUBSCRIPTION_REQUIRED`.
- 0 business requests.

### 5.1 — recent `product_queries` on ordinary account with real SKU — OPEN CONTRACT MISMATCH

A real SKU was first obtained through live analytics rather than invented manually:
- SKU `1636048691`.
- Offer/product name observed: `Печать Велеса`.

Recent `product_queries` planning on the ordinary account reported:
- `partial=true`.
- `provider_data_scope=partial_by_subscription`.
- Reason `product_queries_response_scope`.
- Entitlement state `SUPPORTED_BUT_NOT_ENTITLED`.

The bridge then executed the business request, but Ozon returned:
- HTTP `403`.
- Provider code `"7"`.
- Category `auth_or_permission`.

Status is not PASS. The live provider behavior does not match the bridge assumption that a recent ordinary-account product-query request may execute with partial response scope. Possible subscription/permission/account-role causes remain to be resolved against the current Ozon contract before changing production logic.

### 5.2 — one capability resolution for three restricted analytics commands — PASS

One clicked batch contained:
1. restricted metric `hits_view`;
2. restricted dimension `brand`;
3. analytics history older than 3 months.

Observed:
- `result_count=3`.
- Batch capability performed and returned ordinary `UNSPECIFIED`, HTTP 200.
- 0 physical analytics business requests.
- Per-result reasons: `all_requested_metrics_unavailable`, `restricted_dimension_changes_grain`, `history_over_3_months`.
- All three returned `SUBSCRIPTION_REQUIRED`.

### 5.3 — `product_queries` history older than one month — PASS

Real SKU used; dates `2026-06-01..2026-06-02`.

Observed:
- Ordinary capability known.
- Reason `history_over_1_month`.
- Required tiers Premium / Premium Plus / Premium Pro.
- 0 physical business requests.
- `SUBSCRIPTION_REQUIRED`.

### 5.4 — `product_queries_details` restricted sort `BY_VIEWS` — PASS

Target result observed:
- Capability `UNSPECIFIED`.
- Reason `restricted_sort_not_entitled`.
- Required tiers Premium / Premium Plus.
- 0 physical business requests.
- `SUBSCRIPTION_REQUIRED`.

The same clicked input also contained a malformed sibling command which produced `INVALID_JSON` at `command_discovery` with no external request; the valid target sibling still produced its own result. This sibling-isolation fact is noted but not used to broaden the target PASS.

### 6.1 — full `stocks_current` — PASS

Command:
```text
OZON_API_V1
{"operation":"stocks_current","params":{"filter":{},"limit":100}}
```

Observed:
- Capability not needed.
- 1 physical business request.
- HTTP 200.
- `total=76`.
- Real non-empty cursor returned.
- Product rows included `product_id`, `offer_id`, FBO/FBS stock entries, `present`, `reserved`, `sku`, shipment type and warehouse IDs.

Checked example `Печать Велеса`:
- `product_id=1119965443`.
- `sku=1636048691`.
- FBO present `238`, reserved `0`.
- FBS present `50`, reserved `0`.

### 6.2 — stocks pagination page 1 — PASS

Command shape: `filter:{}`, `limit:1`.

Observed:
- HTTP 200.
- First `product_id=1082848375`.
- `total=76`.
- Cursor `WzEwODI4NDgzNzUsMTA4Mjg0ODM3NV0=`.

### 6.3 — stocks pagination page 2 — PASS

Used page-1 cursor.

Observed:
- HTTP 200.
- Next `product_id=1082848825`.
- No duplicate of page 1.
- `total=76`.
- Next cursor `WzEwODI4NDg4MjUsMTA4Mjg0ODgyNV0=`.
- `command_transformed=true`.

### 6.4a — stocks pagination page 3 — PASS

Observed:
- `product_id=1082852354`.
- `total=76`.
- Cursor `WzEwODI4NTIzNTQsMTA4Mjg1MjM1NF0=`.

### 6.4b — stocks pagination page 4 — PASS

Observed:
- `product_id=1082855228`.
- `total=76`.
- Cursor `WzEwODI4NTUyMjgsMTA4Mjg1NTIyOF0=`.

### 6.4c — stocks pagination page 5 — PASS

Observed:
- `product_id=1082862005`.
- `total=76`.
- Cursor `WzEwODI4NjIwMDUsMTA4Mjg2MjAwNV0=`.

Across the five-page chain there were no observed duplicates, total remained stable, and cursor advancement was forward.

### 6.5 — stocks filter by `offer_id` — PASS

Command filter: `offer_id=["Печать Велеса"]`, limit 10.

Observed:
- HTTP 200.
- `total=1`.
- `product_id=1119965443`.
- `sku=1636048691`.
- FBO `238`, FBS `50`.
- Values matched the full-list observation.
- `command_transformed=false`.

### 6.6 — stocks filter by `product_id` — PASS

Command filter: `product_id=[1119965443]`, limit 10.

Observed:
- HTTP 200.
- `total=1`.
- Same product and same observed FBO/FBS values as the full list.
- `command_transformed=false`.

### 6.7 — stocks empty business result — PASS

Filter used a non-existent `product_id=9999999999`.

Observed:
- HTTP 200.
- `items=[]`.
- `total=0`.
- `cursor=""`.
- External business request executed normally; no bridge/provider error.

### 6.8 — attempted stocks filter by `sku` — NEEDS INVESTIGATION

Command:
```text
OZON_API_V1
{"operation":"stocks_current","params":{"filter":{"sku":[1636048691]},"limit":10}}
```

Observed:
- HTTP 200.
- `physical_business_request_count=1`.
- `command_transformed=false`.
- Response reported `total=76` and returned the first ten rows of the ordinary full list instead of only SKU `1636048691`.

Status is not a filtering PASS and not yet classified as a bridge defect. Current possibilities include unsupported request field shape for `/v4/product/info/stocks`, pass-through of an unsupported field, or provider-side ignoring of the field. Contract verification is required.

---

## Invalid test-command incidents (not product failures)

### X1 — guessed `product_info`

Bridge returned:
- `UNSUPPORTED_OPERATION`.
- Stage `command_discovery`.
- `external_request_executed=false`.

The operation name was guessed by the test author and is not an allowed bridge operation. The bridge's fail-closed rejection itself behaved correctly.

### X2 — guessed `capabilities`

Bridge returned:
- `UNSUPPORTED_OPERATION`.
- Stage `command_discovery`.
- `external_request_executed=false`.

Again, the guessed operation was invalid; bridge rejection behaved correctly.

### X3 — `stocks_current` with missing required `filter`

Command contained `limit:1` but omitted `params.filter`.

Bridge returned:
- `INVALID_OPERATION_PARAMS`.
- Message: `params.filter обязателен по контракту Ozon.`
- Stage `command_discovery`.
- `external_request_executed=false`.

This is an invalid test command, not a product failure. Correct pagination with `filter:{}` had already passed in 6.2–6.4c.

---

## Open items

1. `product_queries` recent ordinary-account behavior: bridge predicts `partial_by_subscription`, but live Ozon returns HTTP 403/code 7 even for a real SKU.
2. `stocks_current filter.sku`: provider returned the unfiltered list; verify exact current request contract before defect classification.
3. Continue through actual implemented bridge operation aliases only; do not infer operation names from Ozon endpoint names or research-only registries.
4. Premium-positive cases remain NOT EXECUTED because this live environment has no Premium Seller account.
