# Ozon AI Worker — SEO, Competitive Position & Category Rank Capability Requirement

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: MANDATORY PRIMARY-GATE EXTENSION
Scope: Standard / non-Premium baseline, with entitlement-aware Premium boundaries.

## Gate policy

The previously defined 40-test gate is a baseline, not a hard ceiling.

Primary-gate size may grow when a newly identified commercially important capability is materially distinct from existing tests. It must not grow through cosmetic variants of the same data surface.

Principle:

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

All added tests must have persisted results and the same `NO_SKIP_ON_FAILURE` discipline as existing rows.

## Capability A — own-card SEO / semantic core

The AI worker must be able to evaluate a seller product using actual Ozon evidence rather than generic copywriting heuristics.

Target orchestration:

1. identify product/SKU;
2. read product/card metadata including current title/name;
3. read product description;
4. read product attributes;
5. read Ozon content rating/recommendations;
6. read the product's real buyer search-query evidence for a queryable period;
7. correlate query demand with title/description/attributes;
8. identify semantic gaps, weak/unused query clusters and over/under-coverage;
9. produce SEO/content recommendations without performing an Ozon write.

Confirmed current Bridge READ surfaces:

- `seller_product_info_list` -> `POST /v3/product/info/list`;
- `product_info_description` -> `POST /v1/product/info/description`;
- `seller_product_attributes` -> `POST /v4/product/info/attributes`;
- `product_content_rating` -> `POST /v1/product/rating-by-sku`;
- `product_queries` -> `POST /v1/analytics/product-queries`;
- `product_queries_details` -> `POST /v1/analytics/product-queries/details`.

The accepted entitlement snapshot classifies description, attributes and content rating as all-account reads. Live roles include `/v1/product/info/description`, `/v1/analytics/product-queries` and `/v1/analytics/product-queries/details`.

Recent search-query data is subject to the freshness/data-readiness limitation discovered in STD-05; the worker must choose a queryable period rather than treating provider 403 as no entitlement.

## Capability B — competitor SEO / public-card benchmark

The worker should compare the seller's product with relevant Ozon competitors where evidence exists.

Current Bridge has competitor-related pricing surfaces:

- `pricing_strategy_competitors` -> competitor list for pricing strategies;
- `pricing_strategy_product_info` -> for a product in a pricing strategy, provider can return competitor price and a competitor product link.

These surfaces do not guarantee a complete organic competitor set for every product. They are a possible discovery source, not proof of market completeness.

For public competitor-card content, the AI may use public web access after a competitor product URL/name has been identified. The public comparison may inspect observable title, description/content, attributes, price positioning and other public card elements.

Required boundary:

- private seller data comes through Bridge;
- competitor public-page evidence comes through public web;
- do not claim competitor sales or private metrics unless an Ozon API explicitly exposes them;
- clearly distinguish direct Ozon evidence from public-page observations and inference.

A useful commercial answer should identify, where evidence permits:

- query/semantic clusters competitors cover and seller does not;
- title/attribute/content differences;
- price-position differences;
- opportunities to add missing buyer terminology without keyword stuffing;
- whether a content issue is likely SEO, conversion, price, availability or another factor.

## Capability C — category/search position and category competitive context

The worker should answer questions such as:

- `На каком месте мой товар по запросам?`
- `Какое у меня место в категории?`
- `Кто выше меня и почему?`
- `Моя доля/позиция растёт или падает?`

Current evidence shows mixed availability:

1. `product_queries` / `product_queries_details` can provide own-product search-query evidence; Standard response may be partial and recent data have a readiness window.
2. Seller Analytics metric `position_category` is currently classified as Premium Plus/Pro-restricted in the accepted contract. Therefore direct category-position analytics must not be assumed available to Standard.
3. Marketplace-wide search query endpoints `/v1/search-queries/top` and `/v1/search-queries/text` are classified Premium Pro in the accepted entitlement snapshot.
4. The live API-key `roles` response includes `/v1/analytics/category/comparison`.
5. The current accepted Bridge operation registry does **not** expose an allowlisted operation for `/v1/analytics/category/comparison`.

This creates a concrete coverage gap:

`PROVIDER_ROLE_EXPOSES_CATEGORY_COMPARISON_BUT_BRIDGE_REGISTRY_DOES_NOT`

The Sol baseline should record this as a Bridge capability-coverage finding, not silently pretend that category comparison is unavailable from Ozon itself.

## Required new primary-gate tests

Add at least these distinct rows after the originally frozen CAP-20 baseline:

### CAP-21 — SEO / semantic core of own card

Business intent example:

`Разбери SEO этой карточки: по каким реальным запросам её находят, какие запросы не покрыты названием/описанием/характеристиками и что стоит изменить в семантическом ядре?`

Must exercise description + attributes + content rating + search-query evidence, not only one endpoint.

### CAP-22 — competitor SEO / positioning benchmark

Business intent example:

`Найди релевантных конкурентов этого товара на Ozon и сравни их карточки с моей: семантика, заголовок, описание, характеристики и цена. Что у них сделано лучше и что стоит перенять без копирования?`

Must distinguish Bridge private evidence from public competitor-page evidence. Competitor discovery may use pricing-strategy competitor surfaces where relevant; public web may be required for card content.

### CAP-23 — category/search position and coverage boundary

Business intent example:

`Какое место занимает мой товар по ключевым запросам и в категории, кто выше и что мешает подняться?`

Must test entitlement and coverage honestly:

- use Standard-available own search data where possible;
- do not invent Premium-only `position_category`;
- discover/report the missing Bridge coverage for `/v1/analytics/category/comparison` if still absent;
- identify which answer components are Standard-live, Premium-gated, Bridge-missing or available via public evidence.

## Scoring additions

For SEO/competitive-position rows record additionally:

- `description_read`: PASS/PARTIAL/FAIL/NOT_NEEDED;
- `attributes_read`: PASS/PARTIAL/FAIL/NOT_NEEDED;
- `content_rating_read`: PASS/PARTIAL/FAIL/NOT_NEEDED;
- `search_query_evidence`: PASS/PARTIAL/FAIL/BLOCKED;
- `competitor_discovery`: PASS/PARTIAL/FAIL/NOT_NEEDED;
- `public_competitor_comparison`: PASS/PARTIAL/FAIL/NOT_NEEDED;
- `category_position_evidence`: PASS/PARTIAL/FAIL/BLOCKED;
- `entitlement_boundary_handled_correctly`: PASS/FAIL;
- `unsupported_claims`: NONE/PRESENT.

## Current checkpoint

`PRIMARY_GATE_EXPANDABLE_CAP_21_SEO_CAP_22_COMPETITOR_CAP_23_CATEGORY_POSITION_ADDED_NO_ARTIFICIAL_BLOAT`
