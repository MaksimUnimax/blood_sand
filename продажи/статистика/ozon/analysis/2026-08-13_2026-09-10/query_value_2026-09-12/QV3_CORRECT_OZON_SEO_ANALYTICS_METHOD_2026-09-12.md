# Ozon query value — QV3 correct non-circular SEO / analytics method — 2026-09-12

## Status

`QV3 = COMPLETE__METHOD_REBUILT`

This method supersedes the invalid interpretation in which queries already associated by Ozon with our own SKU were treated as the primary source of new SEO semantics.

## Core causal rule

Do **not** do:

`own SKU query report → phrase exists near SKU → phrase is a new SEO candidate`

That is circular. Ozon has already associated the query with the SKU.

Do:

`independent marketplace demand → factual relevance to assortment → current-card gap → own monetary evidence / paid evidence → change or test decision`

The saved own-product query report is retained as a valuable secondary evidence layer, not discarded.

## 1. Build product truth before keyword research

Authority: canonical 76-SKU assortment plus the repaired product-card snapshot.

For each SKU retain factual product identity:

- product type;
- motif / symbol / zodiac sign / named entity;
- material;
- format;
- placement / use case;
- variant;
- brand / model where factual;
- category and structured attributes.

This layer defines what a query is allowed to mean for the product. It is not demand evidence.

## 2. Build an independent marketplace query universe

Use Seller API marketplace-query reads, not the report tied to our own SKUs:

### `marketplace_search_queries_text`

`POST /v1/search-queries/text`

Current Bridge: exposed, READ_SAFE, Premium Pro gated.

Use factual family/entity seeds such as:

- `оберег`;
- `оберег в машину`;
- `подвеска в машину`;
- `четки`;
- `славянский оберег`;
- `знак зодиака`;
- factual motif names such as `велес`, `громовик`, `коловрат`, etc.

Seeds may come from product truth, but returned demand rows are marketplace-level and independent of whether our SKU already ranks for them.

### `marketplace_search_queries_top`

`POST /v1/search-queries/top`

Use as a broad marketplace-demand layer and to discover adjacent query families that seed-by-text may miss.

Current response fields include:

- `query`;
- `client_count` — marketplace query popularity / buyer count;
- `add_to_cart`;
- `conversion_to_cart`;
- `avg_price`;
- `items_views`;
- `sellers_count`.

These are market-demand and competition signals. They do not prove that our exact SKU is relevant.

## 3. Relevance gate before economics

Every independent query must be mapped to:

- `EXACT_SKU_RELEVANT`;
- `FAMILY_RELEVANT`;
- `GENERIC_RELEVANT`;
- `NEIGHBOR_PRODUCT`;
- `CONFLICTING_PRODUCT_TYPE`;
- `CONFLICTING_MATERIAL_VARIANT_USE_CASE`;
- `AMBIGUOUS_HOLD`;
- `IRRELEVANT`.

Hard conflicts beat demand and GMV. A high-demand phrase for another product type must never enter the card merely because Ozon once attributed money to it.

## 4. Market opportunity layer

Do not invent a universal Ozon SEO score or unsupported ranking weights.

Keep independent market signals as separate dimensions:

- `client_count` — breadth of demand;
- `add_to_cart` — commercial engagement;
- `conversion_to_cart` — marketplace intent quality;
- `avg_price` — price context;
- `items_views` — visibility/engagement context;
- `sellers_count` — competition context.

A query with high demand and high seller count is not automatically better than a smaller precise query. Preserve the dimensions for review.

## 5. Current-card semantic coverage

Only after independent relevance passes, inspect the current card:

- category/type;
- structured attributes;
- title/name;
- long description / 4191;
- rich content where available.

Coverage states:

- `FACT_EXPLICITLY_PRESENT`;
- `SEMANTICALLY_PRESENT`;
- `PARTIAL_FACTUAL_GAP`;
- `REAL_FACTUAL_GAP`;
- `NOT_APPLICABLE`;
- `CONFLICTING_WITH_CARD_FACTS`.

Ozon's own query-analytics example is the correct pattern: if buyers use a factual material query such as «расчёски из дерева», put the material in the relevant characteristic and explain it naturally in the description. Do not paste query lists.

## 6. Overlay our own Ozon query evidence

Use `product_queries_details` only now, after independent discovery/relevance.

Useful secondary evidence:

- Ozon-attributed query×SKU GMV;
- unique search users where populated;
- current average position where populated;
- view / conversion fields only where Ozon actually returns them.

Current QV1 authority provides:

- 162 monetized `SKU × query` pairs;
- 146 unique monetized phrases;
- 131,393.07 RUB attributed GMV.

This answers: **which already-associated query relationships have produced money?**

It does not answer: **what complete set of new keywords should the card contain?**

## 7. Overlay paid advertising evidence

### Phrase layer

For eligible CPC search-query reports:

- phrase;
- impressions;
- clicks;
- CTR.

This answers whether actual paid search users reacted to the phrase/card pairing.

### Campaign / SKU layer

Use exposed Performance reads for:

- impressions;
- clicks;
- average CPC;
- expense;
- orders;
- attributed sales;
- DRR.

Derived:

- `CPC = expense / clicks`;
- `CVR_ad = orders / clicks`;
- `CPO = expense / orders`;
- `DRR = expense / sales`;
- `ROAS = sales / expense`.

If phrase clicks exist but phrase spend does not, use only the explicitly labelled estimate:

`estimated_phrase_spend = phrase_clicks × closest_matching_avg_CPC`

Never report it as exact spend.

## 8. Money-first decision matrix

A phrase can become a card-change candidate only when:

1. product relevance is defensible;
2. a real factual/semantic card gap exists;
3. at least one useful demand/economic signal exists.

Priority classes:

### `A__MONEY_PROVEN_GAP`

- exact/family relevance;
- real card gap;
- own Ozon attributed GMV > 0 and/or paid conversion evidence.

Highest review priority.

### `B__PAID_CLICK_GAP`

- exact/family relevance;
- real card gap;
- paid phrase clicks > 0;
- no exact phrase revenue attribution yet.

Candidate for controlled SEO test, not automatic mutation.

### `C__MARKET_DEMAND_GAP`

- exact/family relevance;
- real card gap;
- independent `client_count` / cart evidence;
- no own monetary proof yet.

Test candidate.

### `D__ALREADY_COVERED`

- relevant;
- strong demand or GMV may exist;
- card already expresses the intent correctly.

Do not stuff more keywords. Diagnose ranking/conversion via price, delivery, media, reviews, availability, ads, etc.

### `E__ECONOMIC_BUT_WRONG_INTENT`

- positive GMV/clicks may exist;
- product-type/material/variant/use-case conflict exists.

Reject as SEO content. Keep only as noise/cannibalization/ad-targeting evidence.

## 9. Put factual information in the right field

No claim is made here about secret Ozon ranking weights.

Use a factual placement rule:

- category/type → correct category/type field;
- material/size/color/variant/technical property → structured attribute when the category supports it;
- concise product identity → title only if current title is factually incomplete;
- verified synonym, scenario, explanation, compatibility context → natural description/rich content when appropriate;
- unverified brand compatibility, material, symbol variant or use case → never insert.

Ozon itself demonstrates the material example as `characteristic + explanation in description`, not keyword stuffing.

## 10. SEO is not only text

After relevance/coverage is correct, analyze non-text bottlenecks separately:

- price and price context;
- availability;
- delivery speed/geography;
- impressions → clicks / CTR;
- clicks → cart;
- cart → order;
- reviews/rating;
- media/card quality;
- advertising economics.

Ozon's own seller materials recommend looking beyond sales at card views and conversion, and current paid promotion uses relevance together with advertising economics rather than bid alone.

## 11. Before/after measurement

For any approved SEO edit:

1. persist the exact pre-change card;
2. persist target independent queries and their market metrics;
3. persist own-query GMV/position evidence where present;
4. persist advertising metrics where present;
5. make one bounded factual change set;
6. compare equal pre/post windows while recording major confounders: price, stock, delivery, ad campaign changes, promotions;
7. judge by query visibility + clicks/views + conversion + GMV/orders, not by rank alone.

## 12. Immediate execution plan for this assortment

### QV4 — independent market universe acquisition

Use `marketplace_search_queries_text/top` to collect marketplace demand for the actual product families/entities. This is the missing primary semantic layer.

### QV5 — economics join

Join independent market queries to:

- QV1 monetized own-query GMV;
- existing campaign/SKU Performance economics;
- paid phrase clicks/CTR if obtainable.

### QV6 — new SEO candidate authority

Only then produce:

`query → market demand → SKU relevance → current card gap → organic GMV → paid clicks/CPC estimate → decision → exact factual field change`

This becomes the real SEO change-set candidate authority.

## Source hierarchy

Highest trust:

1. Ozon Seller / Ozon help and current Seller/Performance OpenAPI;
2. our saved current API responses;
3. current Bridge operation contract;
4. third-party SEO material only for hypothesis generation — never for secret-factor weights.

Do not use internet claims such as exact percentage ranking weights unless Ozon itself publishes and the source can be verified.

## Official web sources reviewed

- `https://seller.ozon.ru/media/news/novaya-analitika-po-zaprosam-tovarov/`;
- `https://docs.ozon.uz/performance/product-ads/oplata-za-klik/results-of-campaign/`;
- `https://seller.ozon.ru/media/boost/dajdzhest-reklamnoj-platformy-noyabr-i-dekabr/`;
- `https://seller.ozon.ru/media/boost/kak-prodat-nelikvidnyj-tovar-sposoby-i-sovety/`;
- current Ozon Seller/Performance API specifications preserved in the project evidence.
