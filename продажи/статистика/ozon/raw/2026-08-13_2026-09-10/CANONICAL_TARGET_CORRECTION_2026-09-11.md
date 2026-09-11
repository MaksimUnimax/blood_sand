# Ozon monthly query capture — target authority revalidated from live Seller API

Date: 2026-09-11

Status: **SUPERSEDES THE EARLIER MANUAL TARGET CORRECTION IN THIS FILE.**

A fresh explicit `seller_product_list` call (`POST /v3/product/list`) was executed through Bridge 0.1.19:

- request_id: `6d0021f5-1f68-48af-94c4-e09e85f2b12f`
- HTTP: `200`
- requested limit: `100`
- provider total: `76`
- returned items: `76`
- all returned items had `archived=false`

The live result proves that the actual current 76-SKU seller assortment is the set already represented by the earlier `20260826__ozon__product-master__fresh-current76.csv` / original 13-chunk plan. The intermediate manually reconstructed 76-SKU target introduced on 2026-09-11 was wrong.

## Current authority

Use only:

- `CANONICAL_CURRENT76_2026-09-11.tsv` — rebuilt directly from request `6d0021f5-1f68-48af-94c4-e09e85f2b12f`;
- `chunk_plan_76sku_limit15_pagesize100.tsv` — restored to that live 76-SKU set;
- `canonical_chunk_collection_manifest.tsv` — restored to the collection already performed against that live set.

## Preserved invalid intermediate artifacts

The wrong manual reconstruction is preserved for provenance and must not be used for completeness:

- `CANONICAL_CURRENT76_INVALID_MANUAL_RECONSTRUCTION_2026-09-11.tsv`;
- `chunk_plan_76sku_limit15_pagesize100_INVALID_MANUAL_RECONSTRUCTION_2026-09-11.tsv`;
- `canonical_chunk_collection_manifest_INVALID_MANUAL_TARGET_2026-09-11.tsv`.

The 404/429 attempts against SKUs from that invalid reconstruction are historical diagnostics, not missing current76 collection obligations.

## Collection rule

- exactly the 76 SKUs in the live Seller API authority;
- chunks of at most 6 SKUs;
- `limit_by_sku=15`;
- `page_size=100`;
- `page=0` only;
- four slices: `BY_SEARCHES DESCENDING`, `BY_SEARCHES ASCENDING`, `BY_GMV DESCENDING`, `BY_GMV ASCENDING`;
- no global pagination as completeness authority;
- every successful current76 chunk must be raw-persisted;
- every 429/4xx/5xx on a valid current76 request remains open until the required evidence is successfully recollected or is explicitly proven zero/unsupported;
- no SEO/semantic analysis until raw collection closes.
