# CAP-21 — Own-card SEO / semantic core — FINAL

Status: `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP`

Date: 2026-09-06

Canonical job:

`Собери семантическое ядро для моей карточки SKU 1636048691 и покажи, какие поисковые запросы я недопокрываю. Используй только фактический контент моей карточки и Ozon query/search analytics; не придумывай рыночные запросы, не делай конкурентный benchmark и не заявляй точную поисковую позицию там, где Seller API её не доказывает.`

## Product identity

- own SKU: `1636048691`;
- Seller product_id: `1119965443`;
- offer_id: `Печать Велеса`;
- title: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`;
- current Seller status preserved from product info: selling/available.

## Mandatory evidence surfaces completed

1. Product identity/title/info: PASS.
2. Exact product description: PASS via `product_info_description` after resolving SKU -> Seller product_id.
3. Structured attributes: PASS via `seller_product_attributes`, request `dd220558-e4d5-4060-b528-27ead3aa42d8`.
4. Content rating: PASS by preserved CAP-03 authority. SKU `1636048691` is not one of the two 82/100 exceptions and therefore belongs to the remaining 74 cards at `87.5/100`, whose common text gap is missing Rich content.
5. Own-product query summary: PASS on the proven-ready day `2026-08-29`, request `e456355c-63ec-435d-84bc-5d57cf8dbf9c`.
6. Own-product query details: PASS with explicit two-page pagination on the same proven-ready day, requests `e206b707-2fa7-4ad1-8262-5bda4d59b8ee` and `e05fdb77-de37-441d-9527-c7d93309b024`.

## Freshness/data-readiness boundary

The initially requested recent window (`2026-08-07`..`2026-09-05`) returned provider HTTP 403/code 7 for both `product_queries` and `product_queries_details`.

Current `/v1/roles` proves both endpoints are present in the API key's `Admin read only` method set. `seller_info` shows the cabinet is non-Premium, but that fact alone does not prove a paywall denial.

Controlling branch-specific STD-05 evidence had already shown a newer day returning 403 while `2026-08-29` returned 200 on the same account/key. CAP-21 reproduced that control on the current live state:

- `product_queries` on `2026-08-29`: HTTP 200, same fingerprint and same business values as STD-05;
- `product_queries_details` on `2026-08-29`: HTTP 200.

Therefore the strongest supported classification is:

`RECENT_DATA_FRESHNESS_OR_DATA_READINESS_RESTRICTION_STRONGLY_SUPPORTED / EXACT_BOUNDARY_NOT_PROVEN`

Do not relabel the recent 403s as a subscription denial and do not treat them as zero demand.

## Factual query evidence for the ready day

Summary for SKU `1636048691`:
- `unique_search_users = 4876`;
- `gmv = 1244 RUB`;
- `position = null`;
- `unique_view_users = null`;
- `view_conversion = null`.

Provider detail returned exactly 15 query rows across two explicit pages:

1. `подвеска` — 2486 unique search users;
2. `в машину` — 474;
3. `подвеска в машину` — 234;
4. `подвеска в машину на зеркало` — 223;
5. `оберег` — 168;
6. `от сглаза` — 105;
7. `амулет` — 101;
8. `талисман` — 96;
9. `магия` — 94;
10. `оберег для дома` — 92;
11. `эзотерика` — 77;
12. `оберег от сглаза и порчи` — 65;
13. `коловрат` — 59;
14. `оберег от сглаза` — 49;
15. `велес` — 47.

Do not sum these user counts into a unique audience estimate because users can overlap across query rows.

For detail rows the Standard/partial response exposes `position = null`, `unique_view_users = null`, `view_conversion = null`; query-level `gmv` and `order_count` are zero while the summary row reports `gmv = 1244`. Therefore exact query-level monetization/conversion and exact search position are not proven and must not be inferred from those detail zeros.

## Evidence-backed semantic core

### Strongly covered core

The highest-demand car-pendant cluster is already strongly represented in the title, description and/or structured tags:
- `подвеска`;
- `в машину`;
- `подвеска в машину`;
- `подвеска в машину на зеркало`.

The protection/amulet cluster is also materially represented in description/tags:
- `оберег`;
- `от сглаза`;
- `амулет`;
- `талисман`;
- `оберег от сглаза и порчи`;
- `оберег от сглаза`.

Additional evidenced secondary semantics already exist in the card:
- `магия`;
- `эзотерика`;
- `велес` / `Печать Велеса`;
- home-use wording is present in the description, supporting the `оберег для дома` adjacency as a secondary use case if that use is genuinely intended.

### Defensible gaps / opportunities

1. **Rich-content gap is proven.** Preserved Ozon content rating is `87.5/100` for this card class with the common text gap caused by missing Rich content. The best content action is not keyword stuffing but adding structured Rich content that naturally reinforces the already factual high-demand clusters: car mirror pendant, protective amulet/talisman, Velес identity, materials/size and intended use.

2. **Protection semantics are present but mostly secondary.** `от сглаза`, `оберег от сглаза и порчи`, and `оберег от сглаза` all have factual demand evidence and are supported by the current description/tags. They may be emphasized once, naturally, in Rich content or a concise factual benefit block. There is no evidence that aggressively rewriting the title around them would improve ranking because position/views/conversion are unavailable.

3. **Home-use wording is weaker than the automobile use case.** Query `оберег для дома` is evidenced, and the description says the item may be used as home decor. If this is a real intended use, expose it in a secondary structured block rather than displacing the primary automobile intent from the title.

4. **Do not add `коловрат` merely because it appears as a query.** The selected product is `Печать Велеса`; neither title nor product identity proves that it is a Kolovrat item. Treat `коловрат` as adjacent/broad Slavic-symbol demand unless separate product evidence proves otherwise. Adding it would create semantic pollution rather than an evidence-backed gap fix.

5. **Remove/verify unrelated symbol tags.** The structured tag attribute currently contains `триглав`, while the product title/offer identifies `Печать Велеса`. If `Триглав` is not an actual property of this item, remove it from semantic tags rather than widening the card with unrelated symbol names.

6. **Reconcile product-form terminology.** The description repeatedly switches from `подвеска` to `чётки`. The title and dominant real queries are centered on `подвеска`. Verify the physical product form and make terminology internally consistent; do not retain `чётки` merely for keyword coverage if that is not the actual item type.

## What is NOT proven

- exact organic rank for any query — `position` is null;
- query-level views or conversion — fields are null;
- exact query-level orders/GMV — detail zeros conflict with non-zero summary GMV and are not sufficient authority;
- marketplace-wide keyword volume beyond this own-product query evidence;
- competitor semantics, price or private metrics — reserved for CAP-22;
- category position — reserved for CAP-23.

## Product / Bridge findings

1. The Bridge exposes the necessary own-card SEO surfaces, but recent query readiness is not represented cleanly in preflight: concrete recent requests were marked `SUPPORTED_AND_ENTITLED` and then provider-rejected with 403. The product needs explicit machine-readable date-readiness guidance (`WAIT_FOR_DATA_WINDOW` / `USE_OLDER_QUERYABLE_DATE`) rather than making the worker diagnose this through live failures.
2. Identifier typing is weak-model-hostile: SKU/product_id arrays require string-form int64 in operations where the semantic docs/setup initially made numeric identity easy to confuse. Local guidance prevented provider waste, but clearer recipes/types are needed.
3. `product_queries_details` is transformed (`exact_request_preserved=false`) even on successful reads; this was tolerated because the provider result matched the requested day/SKU/page, but the transformation should remain auditable.
4. Detail pagination was correctly discoverable from provider `page_count=2` and was completed explicitly with one physical request per page.

## CAP scoring

- `capability_recognition`: PASS
- `operation_or_cluster_selection`: PASS
- `discovery_help_usage_when_needed`: NOT_NEEDED
- `multi_run_orchestration`: PASS
- `business_answer`: PASS
- `operator_intervention_required`: NO
- `bridge_guidance_gap`: RECOVERY
- `description_read`: PASS
- `attributes_read`: PASS
- `content_rating_read`: PASS
- `search_query_evidence`: PASS
- `competitor_discovery`: NOT_NEEDED
- `public_competitor_comparison`: NOT_NEEDED
- `category_position_evidence`: BLOCKED
- `entitlement_boundary_handled_correctly`: PASS
- `unsupported_claims`: NONE

Notes: the row passed because a factual semantic core and defensible recommendations were produced from own-card + Ozon own-query evidence while preserving readiness, partial-response and position boundaries. Recovery cost was materially higher than ideal because of identifier typing and readiness guidance gaps.

Checkpoint: `CAP_21_PASS_CAP_22_READY`
