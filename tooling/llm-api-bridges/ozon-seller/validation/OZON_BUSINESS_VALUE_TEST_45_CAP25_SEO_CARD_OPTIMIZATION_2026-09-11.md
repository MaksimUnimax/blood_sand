# Ozon Bridge business-value test 45 / CAP-25 — SEO optimization of Ozon product cards

Date opened: 2026-09-11  
Status: **IN_PROGRESS — DATA COLLECTION FIRST**  
Product: `ozon-llm-api-bridge` v0.1.19

## Position in the business-value series

This is the next business-value scenario after the previously accumulated STD/CAP series ending at `CAP-24`.

Serial number: **45**.  
Capability id: **CAP-25**.

This is a seller business-value test, not a technical PATCH/LIVE-GATE. Technical defects are investigated only if they block trustworthy execution of this business scenario.

## Seller problem

A seller needs to optimize Ozon product cards for internal marketplace search, but a useful semantic core cannot be built reliably from title text or external search demand alone.

The Bridge must prove that it can assemble an evidence base for product-card SEO from Ozon-owned data and current product content.

## Capability under test

### Phase A — monthly Ozon search-query evidence

For the seller's current assortment:

1. collect the available monthly search-query detail for each SKU through `product_queries_details`;
2. preserve the exact analytics period, `request_id`, Bridge version, SKU, query rank/text and returned metrics;
3. repeat the collection monthly;
4. append new periods without overwriting prior periods;
5. build a long-running first-party Ozon query history for later SEO analysis.

Because the non-Premium accessible history is limited, recurring monthly capture is part of the capability itself.

Multiple independent `OZON_API_V1` envelopes may be executed in one sequential batch. The invariant remains one explicit command → at most one physical provider business request. No hidden retry, pagination-loop, polling, fan-out or provider chaining is allowed.

### Phase B — product content evidence

After the monthly query snapshot for the full assortment is captured, collect current product descriptions and current product attributes/characteristics for the corresponding SKUs through verified read-only Seller API operations.

The later analytical job will join:
- Ozon search phrases;
- current title/name;
- description/content;
- characteristics/attributes;
- SKU/product identity.

That joined evidence will be used to build a product-card semantic core and SEO recommendations.

Phase B is **not executed as part of the current collection pass**. The immediate task is to finish Phase A for the full assortment first.

## Current live evidence

The search-visibility guidance exposed:
- `product_queries` — own-product search-query summary;
- `product_queries_details` — query detail by selected SKU;
- marketplace search-query surfaces separately.

A request for history over one month was rejected before provider execution because the requested scope required Premium/Premium Plus/Premium Pro.

A shorter non-Premium window succeeded.

First detail evidence:
- SKU: `1636048691` (`Печать Велеса`);
- analytics period returned by Ozon: `2026-08-13` — `2026-09-10`;
- request_id: `c527ff0d-53dc-4ea1-9143-04142d37ddd5`;
- HTTP: 200;
- physical business requests: 1;
- returned query rows: 10.

The result is persisted in:
`продажи/статистика/ozon/monthly_search_queries.tsv`.

## Current collection scope

Canonical current Ozon assortment authority:
`marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`

Target count for the first monthly cycle: **76 SKU**.

Collection state at opening:
- 1 SKU has a persisted detailed-query result;
- 75 SKU remain to be collected for the same first monthly cycle.

## PASS criteria

CAP-25 Phase A collection PASS requires:
1. every one of the 76 target SKU receives one explicit `product_queries_details` attempt for the first monthly cycle;
2. every successful provider result is persisted with exact request provenance;
3. provider/Bridge failures are preserved as failures and are not silently retried;
4. no hidden provider requests are introduced;
5. the accumulated file is append-only by monthly period;
6. no SEO interpretation is mixed into the raw monthly query ledger.

Full CAP-25 business PASS will additionally require Phase B product-content evidence and a later reproducible semantic-core/SEO analysis using the accumulated evidence.

## What is not yet claimed

- The first 76-SKU monthly cycle is not complete yet.
- No annual history exists yet.
- No SEO recommendation is accepted from this test yet.
- No causal ranking effect from changing a title/description has been proven.
- Product descriptions/attributes have not yet been collected under CAP-25 Phase B.

The current action is data collection only.
