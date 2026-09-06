# CAP-22 — Competitor SEO / positioning benchmark — FINAL

Date: 2026-09-06
Status: `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY`

Canonical job:

`Найди релевантных конкурентов моего товара SKU 1636048691 на Ozon и сравни их карточки с моей: семантика, заголовок, описание, характеристики и цена. Используй конкурентов только после доказанного Ozon-дискавери; private seller evidence держи отдельно от public competitor-card evidence; не приписывай конкурентам продажи, конверсию или другие private metrics и не заявляй полноту рынка.`

Target own product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`
- own-card SEO/content authority: completed CAP-21.

## Discovery chain completed

### Run 01 — direct product competitor info
Operation: `pricing_strategy_product_info`
Result: HTTP 200, but target product had no usable pricing-strategy competitor linkage:
- `strategy_id = ""`
- `is_enabled = false`
- `strategy_product_price = 0`
- `strategy_competitor_id = 0`
- `strategy_competitor_product_url = ""`

Conclusion: no concrete competitor product discovered.

### Run 02 — product -> pricing strategy IDs
Operation: `pricing_strategy_ids_by_product_ids`
Request ID: `7150e242-422d-4f58-9510-2d6f9524b332`
Result: provider HTTP 403 / `auth_or_permission`, code `7`.

Conclusion:
- real provider execution occurred;
- 403 is not an empty strategy mapping and must not be converted into `no strategy`;
- live provider behavior contradicts the Bridge's static `SUPPORTED_AND_ENTITLED / all_accounts` projection for this endpoint.

### Run 03 — alternate strategy list
Operation: `pricing_strategy_list`
Request ID: `11fc310e-9c07-468b-9148-fe63bcdf3d9d`
Result: HTTP 200, 2 enabled strategies:

1. `3abf9219-eb93-4cd1-b483-05c2290e3614`
   - `Следовать за самой выгодной ценой`
   - type `MIN_EXT_PRICE`
   - `products_count = 0`
   - `competitors_count = 31`

2. `15a59f43-0fde-4eb7-b046-be26670f6739`
   - `Самый дешёвый на Ozon`
   - type `COMP_PRICE`
   - `products_count = 0`
   - `competitors_count = 1`

Conclusion:
- strategy topology is readable;
- neither visible strategy proves linkage to target product because both provider records report `products_count=0`;
- competitor counts are strategy-local counts, not unique target-product competitors.

### Run 04 — competitor-source directory
Operation: `pricing_strategy_competitors`
Request ID: `00dedc06-2e6b-491a-bc1e-81fe6764c4bc`
Result: HTTP 200, `total=31`, page 1 returned 20 records.

Returned objects are source/site definitions such as:
- `market.yandex.ru`
- `wildberries.ru ...`
- `ozon.ru`
- `citilink.ru`
- `dns-shop.ru`
- other retailer domains.

Conclusion:
- this is a competitor-source directory, not a concrete competitor-product list;
- the records contain source IDs/names, not target-product competitor URLs/cards;
- reading the remaining directory page cannot by itself establish target-product linkage.

## Final capability conclusion

No current Bridge/Ozon evidence in the tested seller context produced a concrete Ozon-proven competitor product URL/card for seller product `1119965443`.

Therefore CAP-22 must close at the explicit boundary:

`COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY`

The benchmark MUST NOT be rescued by manually picking an Ozon product from public search, because that would violate the frozen evidence rule and would falsely convert manual market research into a proven Bridge capability.

## What is proven

- the Bridge can read pricing-strategy product info;
- the Bridge can read pricing-strategy topology;
- the Bridge can read the pricing-strategy competitor-source directory;
- the worker preserved provider 403 as a permission/coverage boundary rather than interpreting it as a business zero;
- the worker did not hand-pick a competitor or claim private competitor metrics.

## What is not proven

- automatic discovery of a concrete relevant competitor product for SKU `1636048691`;
- a competitor product URL for public-card inspection;
- competitor-card semantic/title/description/attribute/price benchmark;
- competitor sales, conversion, search rank, advertising metrics or any private competitor evidence;
- complete market coverage.

## Commercial-value significance

CAP-22 provides negative-but-material commercial evidence.

The product has useful competitor-related topology/diagnostic access, but in the tested Standard seller context it did not prove the end-to-end sellable job `find my concrete competitors and benchmark their cards automatically`.

This lowers the defensible commercial claim for automated competitor SEO analysis unless a later Bridge/provider capability can produce a concrete target-product competitor linkage. The correct product promise today is narrower: pricing-strategy competitor-source awareness plus explicit discovery-boundary handling, not full autonomous competitor-card discovery for every SKU.

## CAP scoring

- `capability_recognition`: PASS
- `operation_or_cluster_selection`: PASS
- `discovery_help_usage_when_needed`: NOT_NEEDED
- `multi_run_orchestration`: PASS
- `business_answer`: PARTIAL
- `operator_intervention_required`: NO
- `bridge_guidance_gap`: ENTITLEMENT_AND_COVERAGE
- `description_read`: NOT_NEEDED
- `attributes_read`: NOT_NEEDED
- `content_rating_read`: NOT_NEEDED
- `search_query_evidence`: NOT_NEEDED
- `competitor_discovery`: PARTIAL
- `public_competitor_comparison`: NOT_RUN_NO_PROVEN_COMPETITOR
- `category_position_evidence`: NOT_NEEDED
- `entitlement_boundary_handled_correctly`: PASS
- `unsupported_claims`: NONE

Checkpoint: `CAP_22_PARTIAL_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY_CAP_23_READY`
