# Ozon Bridge business-value test 45 / CAP-25 — SEO optimization of Ozon product cards

Date opened: 2026-09-11  
Status: **IN_PROGRESS — PHASE A MONTHLY QUERY CAPTURE**  
Product: `ozon-llm-api-bridge` v0.1.19

## Position in the business-value series

Serial number: **45**.  
Capability id: **CAP-25**.

This is a seller business-value test after the previously accumulated STD/CAP series ending at `CAP-24`. It is not a technical PATCH/LIVE-GATE.

## Seller problem

A seller needs to optimize Ozon product cards for internal marketplace search, but a useful semantic core cannot be built reliably from title text or external search demand alone.

The Bridge must prove that it can assemble a reproducible evidence base from Ozon-owned search-query data and current product content.

## Phase A — monthly Ozon search-query evidence

For the current assortment:

1. collect the available monthly `product_queries_details` evidence for the full SKU set;
2. preserve analytics period, Bridge version, `request_id`, sort/page provenance and returned query rows;
3. repeat the capture monthly;
4. append new periods without overwriting historical raw evidence;
5. build a long-running first-party Ozon query history for later SEO analysis.

Because non-Premium history is limited, recurring monthly capture is part of the capability itself.

### Runtime invariants

- one explicit `OZON_API_V1` command → at most one physical provider business request;
- multiple independent envelopes may be executed in one sequential batch;
- no hidden retry, pagination-loop, polling, fan-out or provider chaining;
- every next page is a new explicit command;
- errors are preserved and never silently retried.

## Phase B — product content evidence

After Phase A is complete for the current monthly cycle, collect current product descriptions and current product attributes/characteristics for the corresponding SKUs through verified read-only Seller API operations.

The later analytical job will join:
- Ozon search phrases;
- current title/name;
- description/content;
- characteristics/attributes;
- SKU/product identity.

Phase B is **not executed during the current raw statistics pass**.

## Live capability findings

`product_queries_details` accepts:
- `limit_by_sku` up to 15;
- `page_size` up to 100;
- explicit `page` pagination;
- up to 1000 SKU;
- sorting by `BY_SEARCHES`, `BY_VIEWS`, `BY_POSITION`, `BY_CONVERSION`, `BY_GMV`.

Current account entitlement:
- `BY_SEARCHES` — available;
- `BY_GMV` — available;
- `BY_VIEWS`, `BY_POSITION`, `BY_CONVERSION` — blocked before provider execution with `SUBSCRIPTION_REQUIRED` for Premium/Premium Plus.

The earlier request for history beyond one month was also blocked before provider execution because the requested historical scope requires a paid subscription.

## Why four non-Premium slices are collected

The endpoint limits returned phrases to 15 per SKU. Observed live results prove that changing the allowed sort can surface a different 15-query subset for the same SKU. Therefore the non-Premium monthly archive collects four explicit slices:

1. `BY_SEARCHES / DESCENDING`;
2. `BY_SEARCHES / ASCENDING`;
3. `BY_GMV / DESCENDING`;
4. `BY_GMV / ASCENDING`.

All pages for each slice are persisted before the slice is declared complete. Later deduplication is a derived operation; raw slice/page evidence remains append-only.

## First monthly cycle

Canonical current Ozon assortment authority:
`marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`

Target: **76 SKU**.  
Analytics period returned by Ozon: **2026-08-13 — 2026-09-10**.

### Completed slice

`BY_SEARCHES / DESCENDING`:
- provider `total`: **1110**;
- `page_count`: **12**;
- pages persisted: **12/12**;
- query-index coverage: **1–1110**;
- row coverage: **1110/1110**.

### Other allowed slices

- `BY_SEARCHES / ASCENDING`: page 0 persisted; pages 1–11 pending.
- `BY_GMV / DESCENDING`: page 0 persisted; pages 1–11 pending.
- `BY_GMV / ASCENDING`: page 0 persisted; pages 1–11 pending.

### Repository evidence

Monthly rules:
`продажи/статистика/ozon/README.md`

Page/request authority:
`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/collection_manifest.tsv`

Row-level raw evidence:
`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/product_queries_details_*`

The original `monthly_search_queries.tsv` remains an early pilot file and is not the completeness authority for this month; the full raw page archive is authoritative until deterministic consolidation.

## Phase A PASS criteria

Phase A for one monthly cycle passes when:
1. all four available non-Premium slices have page 0 plus every returned page explicitly collected;
2. all successful pages are persisted with exact request provenance;
3. provider/Bridge failures remain recorded as failures and are not silently retried;
4. no hidden provider requests are introduced;
5. historical raw evidence remains append-only;
6. no SEO interpretation is mixed into the raw archive.

## Full CAP-25 PASS criteria

Full CAP-25 additionally requires:
- Phase B product-description and attribute evidence;
- deterministic join of search evidence with product content;
- reproducible semantic-core / SEO analysis;
- no unsupported causal claim that a card edit changes ranking unless separately measured.

## What is not yet claimed

- The first monthly cycle is **not fully complete** until the remaining pages of the other three non-Premium slices are collected.
- No annual history exists yet.
- No SEO recommendation is accepted yet.
- Product descriptions/attributes have not yet been collected under Phase B.
- No causal ranking effect from changing a title/description has been proven.

Current action: **raw statistics collection only**.
