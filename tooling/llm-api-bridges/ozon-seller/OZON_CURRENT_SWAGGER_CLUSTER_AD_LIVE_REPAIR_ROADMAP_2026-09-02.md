# Ozon Current Swagger / Clustering V2 / Advertising — live repair checkpoint

Date: 2026-09-02

Repository: `MaksimUnimax/blood_sand`

Working branch: `repair/ozon-current-swagger-refresh-2026-09-01`

Branch HEAD before this checkpoint: `04d5fd1019a3d9656e57bf895c42f5c9919637a2`

Production patch commit under test: `7893073206d162296a1afd7ea31240482fa99a21`

Published candidate commit: `04d5fd1019a3d9656e57bf895c42f5c9919637a2`

Candidate artifact:

```text
OZON_BRIDGE_v0.1.19_CURRENT_SWAGGER_CLUSTER_AD_CANDIDATE_2026-09-01.zip
SHA-256: f72804389267d78d0db804bd44e3128c545065a219ecb70e8a170952848993d3
```

This file is the persistent authority for the repair work that follows the live test pass. Do not rely on chat-only state. Update this document after every completed roadmap step.

---

## 1. Scope and invariants

Only the Ozon Seller / Performance Bridge is in scope.

Out of scope:

- popup UI;
- Manual/Autorun UI;
- ChatGPT composer controls;
- microphone/send-button behavior;
- unrelated repositories or extensions.

Non-negotiable runtime invariant:

```text
ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST
```

The repair must not introduce:

- automatic retries;
- hidden pagination loops;
- fan-out;
- polling;
- secondary provider detail calls;
- implicit provider chaining;
- capability probes for these non-Premium operations.

Provider errors remain terminal and must not trigger automatic repeat requests.

---

## 2. Live-test evidence already collected

### 2.1 PASS — broad Performance campaigns bounded response

Command:

```text
OZON_API_V1
{
  "operation": "performance_campaigns",
  "params": {}
}
```

Request ID: `87b6b244-3580-4fa5-850d-9b96248f49a6`

Observed:

```text
HTTP 200
physical_business_request_count = 1
provider_page = 1
provider_page_size = 100
provider_items_received = 100
items_returned_to_ai = 100
total = 1128
hidden_pagination_requests = 0
automatic_retry_requests = 0
```

The previous model-visible response of all 1128 campaigns is no longer returned in broad mode.

### 2.2 PASS — explicit next page

Request ID: `4e8e9e7b-5d92-4b59-91b2-a816b1951ad4`

Observed:

```text
HTTP 200
physical_business_request_count = 1
provider_page = 2
provider_page_size = 100
provider_items_received = 100
items_returned_to_ai = 100
hidden_pagination_requests = 0
automatic_retry_requests = 0
```

Page 2 returned a different campaign set from page 1.

### 2.3 PASS — active campaigns refinement

Request ID: `6efaaa6c-295f-40c9-af00-3769794c6a00`

Observed:

```text
HTTP 200
physical_business_request_count = 1
total active campaigns = 369
all returned states = CAMPAIGN_STATE_RUNNING
provider_page = 1
provider_page_size = 100
hidden_pagination_requests = 0
automatic_retry_requests = 0
command_transformed = true
```

### 2.4 PASS — local sort by `createdAt`

Request ID: `385ff200-df80-47e3-b52d-6fe2138d99fc`

Observed:

```text
HTTP 200
physical_business_request_count = 1
provider_items_received = 1128
items_returned_to_ai = 100
result_bounded = true
local_sort.field = createdAt
local_sort.direction = DESC
local_sort.scope = single_full_provider_response
local_sort.additional_provider_requests = 0
hidden_pagination_requests = 0
automatic_retry_requests = 0
```

### 2.5 PASS — local sort by `updatedAt`

Request ID: `fa2a0918-1753-46bf-9f15-cba80944fa63`

Observed:

```text
HTTP 200
physical_business_request_count = 1
provider_items_received = 1128
items_returned_to_ai = 100
result_bounded = true
local_sort.field = updatedAt
local_sort.direction = DESC
local_sort.scope = single_full_provider_response
local_sort.additional_provider_requests = 0
hidden_pagination_requests = 0
automatic_retry_requests = 0
```

### 2.6 FAIL — `performance_campaigns` with `campaignIds`

Command:

```text
OZON_API_V1
{
  "operation": "performance_campaigns",
  "params": {
    "campaignIds": ["37130644"],
    "page": 1,
    "pageSize": 100
  }
}
```

Request ID: `a8f534d9-f9bb-4c70-98a8-5e8d3512d86f`

Observed:

```text
logical_business_result_count = 0
physical_business_request_count = 0
external_request_executed = false
http_status = 0
automatic_retry = false
error.code = INVALID_RESULT_VALUE
error.message = refinement_choices[].command.params.campaignIds: циклический provider result.
```

This is a real Bridge bug and a release blocker. The Bridge advertises `specific_campaign_ids` as an executable refinement, but the generated/direct command fails before the Ozon network request.

The failure is localized to the `performance_campaigns` result/refinement path, because the same `campaignIds` parameter type works in neighboring Performance operations.

### 2.7 PASS — campaign products refinement

Request ID: `9700b84e-9f41-4fab-9063-72776683744b`

Observed:

```text
operation = performance_campaign_products
campaignId = 37130644
HTTP 200
physical_business_request_count = 1
external_request_executed = true
12 products returned
```

### 2.8 PASS — campaign product statistics refinement

Request ID: `c1262118-941c-4513-9713-50740e917963`

Observed:

```text
operation = performance_campaign_product
campaignIds = [37130644]
HTTP 200
physical_business_request_count = 1
external_request_executed = true
```

### 2.9 PASS — SKU statistics refinement

First request with an invalid historical date range correctly reached Ozon once and returned provider HTTP 400 without retry.

Corrected request ID: `ccd8cf9f-8e46-4808-9288-0a48efed0612`

Observed:

```text
operation = performance_sku_statistics
campaignIds = [37130644]
dateFrom = 2026-09-01
dateTo = 2026-09-01
HTTP 200
physical_business_request_count = 1
external_request_executed = true
12 SKU rows returned
```

Therefore `campaignIds` itself is not generically broken.

### 2.10 PASS — new Seller READ `description_category_dependent_attributes`

Live calls used real and documented category/type combinations, including:

```text
description_category_id = 87515080
type_id = 93733
```

Request IDs:

- `36600e8b-dc47-4c6b-8c14-f879e9a77487`
- `01de9ae8-6c06-408f-b295-65ef0a8e3b8a`
- `73e92e67-fa63-4c94-91db-38bd5ffbd265`

All observed:

```text
HTTP 200
physical_business_request_count = 1
external_request_executed = true
automatic_retry = false
result = []
```

An empty result is a valid provider result. Alias, fixed method/path, request normalizer and transport are working.

However, entitlement telemetry showed:

```text
entitlement.status = ENTITLEMENT_UNKNOWN
entitlement.reason = entitlement_rule_unknown
```

### 2.11 BLOCKED, not FAIL — new Seller READ `description_category_dependent_attribute_values`

A valid live call requires a real `parent_attribute_id + child_attribute_id` pair. The tested categories returned no dependent-attribute pairs, so no valid live fixture was available.

Do not mark this endpoint failed. Add deterministic non-live regression coverage for its registry entry, normalizer, fixed method/path, required fields, bounded limit/cursor handling and no hidden pagination. A later live test may be added when a real fixture is available.

The fresh contract requires:

```text
parent_attribute_id
child_attribute_id
```

and supports:

```text
description_category_id
type_id
limit: 1..1000, default 100
cursor
```

### 2.12 PASS — retired current guidance surface

`OZON_HELP_V2 {"cluster":"stocks_inventory","section":"warehouse_fbs"}` returned:

```text
fbs_stock_by_warehouse present
fbs_stock_by_warehouse_v1 absent
physical_business_request_count = 0
external_request_executed = false
```

`OZON_HELP_V2 {"cluster":"orders_postings","section":"assembly_carriage"}` returned:

```text
fbs_carriage_available_list absent
carriage_delivery_list_v2 present
physical_business_request_count = 0
external_request_executed = false
```

### 2.13 PASS — Seller regression smoke

Request ID: `426e89cf-4ebb-4b7f-85f9-aa6b58d6d761`

Observed:

```text
operation = stocks_current
product_id = 1082848375
HTTP 200
physical_business_request_count = 1
external_request_executed = true
capability_probe_executed = false
total = 1
```

Performance transport regression is already covered by the multiple GET/POST Performance calls above.

---

## 3. Required production changes

### Change A — fix cyclic/shared-reference failure for `specific_campaign_ids`

Target behavior:

```text
performance_campaigns + params.campaignIds
must execute exactly one Performance API request
must return HTTP/provider result normally
must not fail result validation because of refinement_choices
```

Implementation requirements:

1. Inspect the `performance_campaigns` result transformation and `refinement_choices` builder.
2. Confirm the exact source of the shared/cyclic object graph; do not assume before code inspection.
3. Ensure every generated refinement command is a detached JSON-safe structure.
4. In particular, `campaignIds` placed into a generated command must not reuse an object/array reference that the result validator treats as cyclic/shared provider data.
5. Prefer explicit cloning through the project’s existing JSON-safe/deep-copy helper. If no suitable helper exists, use a minimal deterministic copy such as a new array of scalar IDs.
6. Do **not** weaken or disable cyclic-result validation.
7. Do **not** remove `specific_campaign_ids` from guidance merely to hide the failure.
8. Preserve all incoming filters when constructing valid next refinements where intended.
9. Preserve the one-command/one-request invariant.

Expected fixed live command:

```text
OZON_API_V1
{
  "operation": "performance_campaigns",
  "params": {
    "campaignIds": ["37130644"],
    "page": 1,
    "pageSize": 100
  }
}
```

Expected result:

```text
logical_business_result_count = 1
physical_business_request_count = 1
external_request_executed = true
HTTP 200
result.list contains only campaign 37130644
hidden_pagination_requests = 0
automatic_retry_requests = 0
no INVALID_RESULT_VALUE
```

### Change B — add executable generated-refinement regression

Current tests proved that checking only the presence/shape of `refinement_choices` is insufficient.

Required regression workflow:

```text
1. Produce a `performance_campaigns` result with refinement_choices.
2. Select `specific_campaign_ids`.
3. Substitute a valid campaign ID.
4. Feed that generated command through the same production command/normalizer/result pipeline.
5. Verify that it is JSON-safe and executable.
```

Required assertions:

```text
no cyclic/shared-reference validation error
generated command is JSON-serializable
operation = performance_campaigns
campaignIds preserved as scalar ID array
page = 1
pageSize = 100
one logical business result
one physical provider request in integration/live-mode fixture
zero hidden pagination
zero automatic retry
```

Also add a pure unit/invariant test that walks every advertising refinement object and verifies JSON-safe serialization without shared-provider-object rejection.

At minimum cover:

- `next_page`;
- `active_campaigns`;
- `latest_created`;
- `latest_updated`;
- `specific_campaign_ids`;
- `campaign_products`;
- `campaign_product_statistics`;
- `sku_statistics`.

### Change C — fix entitlement metadata for both new Seller READs

Affected operations:

```text
description_category_dependent_attributes
description_category_dependent_attribute_values
```

Current live telemetry for the first operation:

```text
ENTITLEMENT_UNKNOWN
entitlement_rule_unknown
```

Required behavior:

1. Add reviewed static entitlement metadata for both fixed Seller paths.
2. Use the same rule semantics as ordinary non-Premium Seller reads when the fresh OpenAPI contains no subscription restriction.
3. No capability probe should be required.
4. The request must remain exact and must not be rewritten.
5. Expected telemetry should be deterministic, normally:

```text
status = SUPPORTED_AND_ENTITLED
reason = all_accounts
capability_required = false
exact_request_preserved = true
```

6. If code inspection shows a different canonical non-Premium rule name in this codebase, use that existing canonical value rather than inventing a new one.
7. Add regression for both entitlement keys:

```text
POST /v1/description-category/dependent-attributes
POST /v1/description-category/dependent-attributes/values
```

### Change D — deterministic coverage for the blocked second Seller endpoint

No production semantic change is required solely because live fixture discovery returned no pairs.

Required test coverage:

- alias resolves;
- provider is `seller_api`;
- method is `POST`;
- fixed path is `/v1/description-category/dependent-attributes/values`;
- `parent_attribute_id` and `child_attribute_id` are required;
- `limit` is bounded to the documented range;
- `cursor` is passed only explicitly;
- no hidden cursor continuation;
- no retry/fan-out;
- entitlement metadata is no longer unknown.

A mocked provider response should verify safe pass-through of:

```text
cursor
result[].parent_value_id
result[].child_value_id
```

Use exact field names from the checked-in fresh Swagger/contract implementation.

---

## 4. Explicit non-changes / scope guards

Do not change these behaviors based on the current evidence:

- `result_bounded = false` for ordinary page-size-bounded `performance_campaigns` is not a blocker; no local truncation occurred.
- `command_transformed = false` when explicit `page/pageSize` already match the physical command is valid.
- local-sort mode may receive the full single provider response and then return only 100 items to AI, provided it remains exactly one provider request.
- do not add hidden page walking to local sort.
- do not re-enable retired legacy aliases in current guidance.
- do not alter popup/manual/composer code.
- do not change Bridge version solely for an unaccepted intermediate repair unless existing project release rules require it.

---

## 5. Required seven-step roadmap

This is the execution order. Update the status table after every step and commit the document update so recovery never depends on chat history.

| Step | Work item | Status | Evidence required |
|---:|---|---|---|
| 1 | Fix cyclic/shared-reference bug in `specific_campaign_ids` | COMPLETE | production diff + focused tests |
| 2 | Add regression for actual executability of generated refinement | COMPLETE | test names/markers and PASS output |
| 3 | Fix entitlement metadata for both new Seller READs | COMPLETE | deterministic entitlement assertions |
| 4 | Build a new deterministic candidate | COMPLETE | artifact path, file count, SHA-256, fresh extraction verification |
| 5 | Repeat live test #6 with campaign ID `37130644` | COMPLETE | one physical request, HTTP 200, only requested campaign, no retry/pagination |
| 6 | Run short final Ozon-only regression | PENDING | focused PASS matrix below |
| 7 | Accept build only if all required checks pass | PENDING | final acceptance marker and accepted artifact identity |

### Step 6 short final Ozon-only regression

Run only the focused checks needed after the repair:

1. `performance_campaigns {}` — bounded page 1, refinement choices present.
2. `performance_campaigns` with `campaignIds=["37130644"]` — executable, one campaign only.
3. `performance_campaigns` with `local_sort=updated_at_desc, local_limit=100` — one provider request, local sort metadata, bounded AI output.
4. `description_category_dependent_attributes` — fixed Seller method/path, deterministic entitlement, one request.
5. Deterministic fixture test for `description_category_dependent_attribute_values` — fixed method/path, required fields, cursor/limit contract, deterministic entitlement.
6. `stocks_current` with `product_id=1082848375, limit=1` — Seller smoke.
7. Guidance check: `fbs_stock_by_warehouse_v1` absent, v2 replacement present.
8. Guidance check: `fbs_carriage_available_list` absent, `carriage_delivery_list_v2` present.

Global assertions for every applicable command:

```text
physical_business_request_count <= 1 per explicit command
automatic_retry = false
hidden_pagination_requests = 0
fan_out = 0
credentials absent from AI-visible result
```

---

## 6. Candidate acceptance criteria

A new candidate must not be accepted unless all of the following are true:

```text
specific_campaign_ids live retest PASS
no INVALID_RESULT_VALUE
one explicit command -> one physical Ozon request
generated refinement executable through production pipeline
both new Seller entitlement rules deterministic
new Seller endpoint #1 live PASS
new Seller endpoint #2 deterministic contract regression PASS
broad campaigns still bounded
local sorting still one provider request
retired aliases remain absent from current guidance
stocks_current Seller smoke PASS
automatic retry = 0
hidden pagination = 0
```

Required artifact evidence:

```text
new candidate filename
new artifact SHA-256
fresh extraction file count
fresh extraction byte/hash verification marker
production commit SHA
artifact publication commit/run identity
```

Final acceptance marker to record in this document only after all criteria pass:

```text
OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_ACCEPTED
```

The `specific_campaign_ids` blocker has passed its live retest. The candidate remains unaccepted until roadmap Steps 6 and 7 complete.

---

## 7. Current defect summary

| ID | Severity | Status | Summary |
|---|---|---|---|
| OZ-LIVE-AD-001 | BLOCKER | FIXED_LIVE_RETEST_PASS | `performance_campaigns + campaignIds` fails pre-network with cyclic provider result in generated refinements |
| OZ-LIVE-ENT-002 | MEDIUM | FIXED | both new dependent-attribute Seller reads lack deterministic entitlement metadata |
| OZ-LIVE-FIXTURE-003 | TEST GAP | DETERMINISTIC_REGRESSION_COVERED_LIVE_FIXTURE_PENDING | second dependent-attribute endpoint lacks live fixture; deterministic regression required |

No other release-blocking Ozon defect was found in this live pass.


<!-- OZON-ROADMAP-STEP-1-COMPLETE -->
### 2026-09-02 — Step 1: cyclic/shared-reference bug repaired

Status: **COMPLETE**

- Pre-repair failure reproduced from base 4447bb27a546140aa4c5892208f5c059b20a04ee.
- Production ozon_contract.js now creates a fresh scalar campaignIds array for every generated refinement command.
- Cycle/shared-reference validation remains enabled and unchanged.
- Focused marker: OZON_SPECIFIC_CAMPAIGN_IDS_REPAIR_PASS.
- Production file SHA-256: 90e27c430d86fe8dbc0bb1cf3df4e590923f851305d03ab6b3588452ca224898.
- Evidence: validation/live-repair-2026-09-02/STEP1_SPECIFIC_CAMPAIGN_IDS_REPAIR_RESULT.json.


<!-- OZON-ROADMAP-STEP-2-COMPLETE -->
### 2026-09-02 — Step 2: generated refinement executability regression added and passing

Status: **COMPLETE**

- Step 1 production commit: 87afac858df47b61a041515ac6a09a725dd619ff.
- All eight advertising refinement objects are JSON trees without repeated object identity.
- Every generated command passes normalizeCommand and buildPerformanceRequest.
- Focused marker: OZON_GENERATED_REFINEMENT_EXECUTABILITY_PASS.
- Evidence: validation/live-repair-2026-09-02/STEP2_GENERATED_REFINEMENT_EXECUTABILITY_RESULT.json.


<!-- OZON-ROADMAP-STEP-3-COMPLETE -->
### 2026-09-02 — Step 3: entitlement metadata repaired for both new Seller reads

Status: **COMPLETE**

- Previous commit: af9712d545f1bcb4a34e76a53c57abdcc5346344.
- Both dependent-attribute entitlement keys resolve as ALL_ACCOUNTS without a capability probe.
- The second endpoint has deterministic required-field, limit, cursor, method/path and mocked-result coverage.
- Markers: OZON_DEPENDENT_ATTRIBUTE_ENTITLEMENTS_AND_CONTRACT_PASS and OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_REGRESSION_PASS.
- Production file SHA-256: c032baab0d6818b5cdbe5e962c7dffa07ad3d31b3e79760b4ac5a820bdb2dbc1.
- Evidence: validation/live-repair-2026-09-02/STEP3_DEPENDENT_ATTRIBUTE_ENTITLEMENT_RESULT.json.


<!-- OZON-ROADMAP-STEP-4-COMPLETE -->
### 2026-09-02 — Step 4: new deterministic candidate built and fresh-extraction verified

Status: **COMPLETE**

- Candidate source commit before artifact commit: 516ecf140538ad2838d39dcd01c7428efc1880d3.
- Artifact: OZON_BRIDGE_v0.1.19_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_CANDIDATE_2026-09-02.zip.
- SHA-256: 80d0b4eba7110dc2d69ef3fab40214a9a6c54e98cfd6820ab611ac7ba73b2c76.
- Size: 199684 bytes; installable file count: 21.
- Fresh extraction markers: OZON_LIVE_REPAIR_FRESH_EXTRACTION_21_FILES_PASS and OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_REGRESSION_PASS.
- Live Step 5 remains PENDING and must use campaign ID 37130644.


<!-- OZON-ROADMAP-STEP-5-COMPLETE -->
### 2026-09-02 — Step 5: live `specific_campaign_ids` retest passed

Status: **COMPLETE / PASS**

- Candidate: `OZON_BRIDGE_v0.1.19_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_CANDIDATE_2026-09-02.zip`.
- Candidate SHA-256: `80d0b4eba7110dc2d69ef3fab40214a9a6c54e98cfd6820ab611ac7ba73b2c76`.
- Artifact commit: `13b14811c36694c8d47c17c0eca8176cc0b57950`.
- Live request ID: `61fce8c2-0002-4e6e-87cc-6ac848e46385`.
- Command: `performance_campaigns` with `campaignIds=["37130644"]`, `page=1`, `pageSize=100`.
- HTTP 200; `logical_business_result_count=1`; `physical_business_request_count=1`; `external_request_executed=true`.
- Provider returned exactly one campaign and it was `id=37130644`; `total="1"`.
- `provider_items_received=1`; `items_returned_to_ai=1`; `provider_page=1`; `provider_page_size=100`.
- `hidden_pagination_requests=0`; `automatic_retry_requests=0`; capability probe was not performed.
- All eight refinement choices were returned successfully. Generated `next_page`, `active_campaigns`, `latest_created`, and `latest_updated` commands preserved a detached `campaignIds=["37130644"]` array without triggering repeated-reference validation.
- No `INVALID_RESULT_VALUE`; no `циклический provider result`.
- Verdict: the previous release-blocking cyclic/shared-reference failure is fixed in the installed candidate.
- Evidence: `validation/live-repair-2026-09-02/STEP5_LIVE_TEST_RESULT.json`.
- Next: roadmap Step 6 short final Ozon-only regression.
