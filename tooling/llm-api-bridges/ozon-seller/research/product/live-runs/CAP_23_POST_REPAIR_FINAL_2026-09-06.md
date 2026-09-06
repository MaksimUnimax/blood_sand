# CAP-23 — Category/search position & coverage boundary — FINAL

Date: 2026-09-06
Status: `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES`

Canonical job:
`Какое место занимает мой товар по ключевым запросам и в категории, кто выше и что мешает подняться?`

Target own-product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`

## Evidence used

### 1. Standard own-product search evidence — available but partial
CAP-23 Run 01 executed `product_queries` for the proven-ready day `2026-08-29` with explicit `sort_by=BY_POSITION` and `sort_dir=ASCENDING`.

Observed:
- HTTP `200`;
- exact request preserved;
- no command transformation;
- `unique_search_users = 4876`;
- `gmv = 1244 RUB`;
- `position = null`;
- `unique_view_users = null`;
- `view_conversion = null`.

Therefore:
- factual own-product search demand is available;
- exact own-product search rank is not available from this Standard response;
- `null` is not rank zero and cannot be converted into any numeric position.

CAP-21 already preserved the same-day 15 factual query rows and own-card semantic/content evidence. They are reused here rather than generating redundant provider traffic.

### 2. Category-position metric boundary
The accepted capability/entitlement requirement for CAP-23 classifies Seller Analytics `position_category` as Premium Plus/Pro restricted. CAP-23 is a Standard/non-Premium baseline and therefore does not fabricate or substitute this metric.

No Standard-live category rank is claimed.

### 3. Category-comparison Bridge coverage gap
The persisted CAP-23 requirement authority records that the live API-key roles include provider endpoint `/v1/analytics/category/comparison`.

Current active-branch Bridge registry inspection finds no allowlisted operation for `/v1/analytics/category/comparison`.

Coverage finding:
`PROVIDER_ROLE_EXPOSES_CATEGORY_COMPARISON_BUT_BRIDGE_REGISTRY_DOES_NOT`

This is a Bridge capability-coverage boundary, not evidence that Ozon itself lacks the provider method. Runtime patching is not performed in this test.

### 4. Marketplace-wide search and competitor boundary
The accepted requirement classifies marketplace-wide search-query endpoints `/v1/search-queries/top` and `/v1/search-queries/text` as Premium Pro for this baseline.

CAP-22 also closed without a target-product-specific Ozon competitor product: pricing-strategy surfaces exposed strategy/source topology but not a defensibly linked competitor card for SKU `1636048691`.

Therefore CAP-23 cannot truthfully answer `кто выше` by manually selecting a marketplace card or by pretending the pricing-strategy source directory is an organic ranking result.

## Business answer supported by evidence

For SKU `1636048691`, the Bridge can currently support a useful Standard SEO/search-demand diagnostic:
- own-product demand on the proven-ready day: `4876` unique search users;
- own-product GMV: `1244 RUB`;
- factual query terms and semantic/content gaps are preserved by CAP-21.

It cannot currently support an exact numeric answer to:
- exact rank for the product's key queries from the tested Standard `product_queries` response;
- exact category rank;
- complete list of products above the seller in category/search;
- category-market position trend.

Those components are blocked by a combination of partial Standard fields, subscription-gated analytics, and a provider-role/Bridge-registry coverage gap.

## Commercial-value significance

CAP-23 narrows the truthful commercial claim of Ozon Seller Bridge:
- strong value: authenticated own-product demand/content/search diagnostics without manual cabinet export;
- bounded value: exact rank/category competitor tracking is not currently proven for Standard through the active Bridge contract;
- product opportunity: exposing the provider-supported category-comparison surface could materially increase competitive-positioning value, but that is a separate authorized product/patch decision, not something this benchmark may silently implement.

This boundary itself is commercially important because it prevents over-selling the Bridge as a complete marketplace rank tracker while preserving the capabilities it actually proves.

## Scoring

- `capability_recognition`: PASS
- `operation_or_cluster_selection`: PASS
- `multi_run_orchestration`: PASS
- `business_answer`: PASS_WITH_BOUNDARIES
- `operator_intervention_required`: NO
- `bridge_guidance_gap`: COVERAGE
- `description_read`: NOT_NEEDED_REUSED_CAP21
- `attributes_read`: NOT_NEEDED_REUSED_CAP21
- `content_rating_read`: NOT_NEEDED_REUSED_CAP21
- `search_query_evidence`: PASS_PARTIAL_RESPONSE
- `competitor_discovery`: PARTIAL_REUSED_CAP22
- `public_competitor_comparison`: NOT_AVAILABLE_NO_TARGET_LINK
- `category_position_evidence`: BLOCKED
- `entitlement_boundary_handled_correctly`: PASS
- `unsupported_claims`: NONE

Final classification:
`PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES`

Checkpoint: `CAP_23_CLOSED_CAP_24_SKU_MONTHLY_UNIT_ECONOMICS_NEXT`
