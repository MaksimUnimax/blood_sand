# Ozon Bridge business-value test 45 / CAP-25 — SEO optimization of Ozon product cards

Date opened: 2026-09-11  
Status: **IN_PROGRESS — PHASE A MONTHLY QUERY CAPTURE, CHUNKED CORRECTION**  
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
2. preserve analytics period, Bridge version, `request_id`, request-shape provenance and returned query rows;
3. repeat the capture monthly;
4. append new periods without overwriting historical raw evidence;
5. build a long-running first-party Ozon query history for later SEO analysis.

Because non-Premium history is limited, recurring monthly capture is part of the capability itself.

### Runtime invariants

- one explicit `OZON_API_V1` command → at most one physical provider business request;
- multiple independent envelopes may be executed in one sequential batch;
- no hidden retry, pagination-loop, polling, fan-out or provider chaining;
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

The endpoint limits returned phrases to 15 per SKU. Observed live results prove that changing the allowed sort can surface a different 15-query subset for the same SKU. Therefore the non-Premium monthly archive targets four explicit slices:

1. `BY_SEARCHES / DESCENDING`;
2. `BY_SEARCHES / ASCENDING`;
3. `BY_GMV / DESCENDING`;
4. `BY_GMV / ASCENDING`.

Later deduplication is a derived operation; raw evidence remains append-only.

## Corrective finding — global pagination is not deterministic enough for completeness

A live `BY_SEARCHES / ASCENDING` batch over all 76 SKU returned HTTP 200 for pages 1–11, `total=1110`, `page_count=12`. However the separate page calls repeated identical `(sku, query)` rows at different global `query_index` values.

Concrete proof:
- page 1 request `6477d987-e28b-4353-aa6a-d7eb1966deb5` returned SKU `1623753672` with several zero-search phrases at indices 148–162;
- page 2 request `0e5eec93-6a69-4538-aa72-22822d6a5788` repeated multiple exact phrases for the same SKU at indices 201–208.

The primary sort value is tied for many rows (`unique_search_users=0`). Separate provider calls can therefore reorder tied rows around page boundaries. Formal coverage of page numbers or `query_index=1..1110` does not prove unique-row completeness.

Evidence:
`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/BY_SEARCHES_ASC_PAGINATION_INSTABILITY_2026-09-11.md`

Rejected request registry:
`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/rejected_unstable_page_requests.tsv`

## Corrected Phase A collection design

Global multi-page collection is replaced by chunked no-pagination collection.

With `limit_by_sku=15` and `page_size=100`:
- at most 6 SKU are sent per request;
- maximum rows per request = 90;
- every chunk uses `page=0` only;
- there is no global page boundary to reshuffle tied rows;
- the same fixed SKU chunk plan is repeated for all four allowed slices.

For 76 SKU this is 13 explicit requests per slice: twelve 6-SKU chunks plus one 4-SKU chunk.

Every request remains explicit; no hidden fan-out is introduced.

## First monthly cycle

Canonical current Ozon assortment authority:
`marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`

Target: **76 SKU**.  
Analytics period returned by Ozon: **2026-08-13 — 2026-09-10**.

### Preserved pre-correction evidence

`BY_SEARCHES / DESCENDING` global sweep:
- 12 technical page responses were persisted;
- provider `total=1110`, `page_count=12`;
- historical raw files remain preserved;
- prior claim that this alone proves deterministic 1110-row completeness is **withdrawn pending chunked validation/recollection**.

`BY_SEARCHES / ASCENDING` global sweep:
- page 0 had been persisted;
- pages 1–11 were technically successful but exposed overlapping tied rows;
- those page requests are marked `REJECTED_UNSTABLE_PAGINATION` for completeness purposes.

`BY_GMV` page-0 pilots remain preserved only as exploratory evidence; authoritative capture will use the same chunked no-pagination method.

## Phase A PASS criteria — corrected

Phase A for one monthly cycle passes when:
1. the fixed 76-SKU target list is partitioned into explicit chunks of at most 6 SKU;
2. all 13 chunks are explicitly executed for each of the four available non-Premium slices;
3. every successful chunk response is persisted with exact request provenance and SKU membership;
4. provider/Bridge failures remain recorded as failures and are not silently retried;
5. no global pagination is relied on for completeness;
6. historical raw evidence remains append-only;
7. no SEO interpretation is mixed into the raw archive.

## Full CAP-25 PASS criteria

Full CAP-25 additionally requires:
- Phase B product-description and attribute evidence;
- deterministic join of search evidence with product content;
- reproducible semantic-core / SEO analysis;
- no unsupported causal claim that a card edit changes ranking unless separately measured.

## What is not yet claimed

- The corrected first monthly cycle is **not complete** until the chunked collection is finished for all four slices.
- No annual history exists yet.
- No SEO recommendation is accepted yet.
- Product descriptions/attributes have not yet been collected under Phase B.
- No causal ranking effect from changing a title/description has been proven.

Current action: **corrected raw statistics collection only**.
