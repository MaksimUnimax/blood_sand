# Ozon query value — QV4 independent marketplace-query acquisition manifest — 2026-09-12

## Status

`QV4 = READY_FOR_PROVIDER_BLOCK_A`

Purpose: build the primary non-circular semantic demand universe from marketplace-level Ozon query analytics, independent of whether our own SKU already appears for the phrase.

## API authorities

- `marketplace_search_queries_text` → `POST /v1/search-queries/text` — current Bridge READ_SAFE, enabled, Premium Pro;
- `marketplace_search_queries_top` → `POST /v1/search-queries/top` — current Bridge READ_SAFE, enabled, Premium Pro.

Returned market metrics:

- `query`;
- `client_count`;
- `add_to_cart`;
- `conversion_to_cart`;
- `avg_price`;
- `items_views`;
- `sellers_count`.

## Block QV4A — family universe

Eight independent family seeds:

1. `подвеска в машину`
2. `оберег в машину`
3. `талисман в машину`
4. `амулет в машину`
5. `четки в машину`
6. `славянский оберег`
7. `знак зодиака в машину`
8. `православный оберег в машину`

For each seed request two top-50 views:

- `CLIENT_COUNT DESC` — demand;
- `ADD_TO_CART DESC` — commercial engagement.

Maximum Block-A provider reads: 16. No hidden pagination or retry.

## Persistence rule

Each successful HTTP200 response must be persisted before Block QV4B. Provider failures/403 are recorded explicitly and not silently retried.

## Block QV4B — named-entity completion

Do not pre-collect every symbol blindly. After QV4A, compare returned query universe to the 76-SKU product ontology and issue named-entity reads only for factual motifs/signs that remain uncovered or under-covered.

## Acceptance for QV4A

Materialize:

- exact provider request + response provenance;
- raw marketplace query rows;
- deduplicated query authority preserving all market metrics;
- seed/sort provenance per row;
- zero inference about SKU relevance in raw acquisition.

Then proceed to QV4B only after QV4A remote persistence/readback.
