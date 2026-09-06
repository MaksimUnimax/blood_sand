# CAP-22 Run 03 — pricing_strategy_list — alternate strategy discovery success

Date: 2026-09-06
Status: `ALTERNATE_STRATEGY_DISCOVERY_PASS_CONTINUE`

Target own product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`

Operation: `pricing_strategy_list`
Request ID: `11fc310e-9c07-468b-9148-fe63bcdf3d9d`
Provider surface: Seller API `POST /v1/pricing-strategy/list`
Logical request: `page=1`, `limit=20`

Execution evidence:
- HTTP `200`
- external request executed: `true`
- capability probe: not needed / not executed
- logical business result count: `1`
- physical business request count: `1`
- exact request preserved: `false`
- command transformed: `true`
- logical command fingerprint: `83a25164`
- physical command fingerprint: `89a6968e`

Bridge entitlement metadata at execution time:
- status: `SUPPORTED_AND_ENTITLED`
- reason: `all_accounts`
- capability_required: `false`
- rule source: `reviewed-openapi-463-2026-08-19`

Provider result:
- total strategies: `2`

Strategy 1:
- id: `3abf9219-eb93-4cd1-b483-05c2290e3614`
- name: `Следовать за самой выгодной ценой`
- type: `MIN_EXT_PRICE`
- update_type: `strategyItemsListChanged`
- updated_at: `2021-07-16 12:20:13.258732+00`
- products_count: `0`
- competitors_count: `31`
- enabled: `true`

Strategy 2:
- id: `15a59f43-0fde-4eb7-b046-be26670f6739`
- name: `Самый дешёвый на Ozon`
- type: `COMP_PRICE`
- update_type: `strategyItemsListChanged`
- updated_at: `2023-03-30 12:28:53.56734+00`
- products_count: `0`
- competitors_count: `1`
- enabled: `true`

Interpretation:
- Run 03 proves that the active seller/API-key context can read pricing-strategy topology through `pricing_strategy_list`, despite the Run 02 HTTP 403 on direct product-to-strategy linkage;
- two enabled strategies are visible, so alternate strategy discovery is live and provider-backed;
- both returned strategies have `products_count=0`; therefore this run does NOT prove that either strategy is linked to target seller product `1119965443`;
- `competitors_count=31` and `competitors_count=1` prove strategy-local competitor counts only; they MUST NOT be summed or interpreted as 32 unique competitors because overlap, staleness, and target-product association are unproven;
- the old `updated_at` timestamps MUST NOT be interpreted as current use for the target product;
- `exact_request_preserved=false` and `command_transformed=true` are preserved as observed planner/transport behavior; this successful semantic result alone is not sufficient to classify that transformation as a defect;
- no competitor is selected manually and no target-product competitor is claimed from this run;
- CAP-22 remains open.

Commercial-value significance:
- the Bridge partially recovers competitor-analysis coverage through an alternate provider-backed pricing-strategy surface after direct own-product linkage was permission-blocked;
- this proves a useful discovery capability, but the commercially stronger capability — automatically identifying an Ozon-proven competitor specifically for the seller's target product — is still not proven;
- the next result determines whether the Bridge can surface provider-backed competitor candidates without manual competitor invention.

Frozen next step:
- probe `pricing_strategy_competitors` with explicit `page=1`, `limit=20`;
- inspect provider-returned competitor records and any available strategy/product association before making any target-specific claim;
- if pagination indicates additional records, continue only after evaluating page 1;
- if no alternate surface can prove a target-product competitor, close CAP-22 with `COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` rather than inventing or manually selecting a competitor.
