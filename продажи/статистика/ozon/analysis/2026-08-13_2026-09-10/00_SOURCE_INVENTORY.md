# Ozon semantic analysis — source inventory and reconciliation

Date: 2026-09-12

Execution status: **BLOCKED_SOURCE_INTEGRITY**

Semantic processing: **NOT STARTED — stopped at the mandatory Phase A gate**

## Decision

The search-query evidence reconciles to the canonical assortment, but the product-card content authority cannot be reconstructed and verified from the committed bundle parts. The task explicitly requires semantic processing to stop when the Phase A source checks fail. Therefore no relevance classification, semantic clusters, coverage decisions, ownership decisions, opportunities, or card recommendations were materialized.

No Ozon API, Performance API, Ozon Bridge, or web-search call was made in this pass. No product card was changed. No file under `raw/` was edited or deleted.

## Repository state used

- Repository: `MaksimUnimax/blood_sand`
- Branch: `main`
- Live Git HEAD fetched before reconciliation: `90afd59eb8b6618c314a3e29c8d4f2c8b0747869`
- HEAD commit: `data(ozon): persist recovered Bridge batch capture part 6`
- HEAD timestamp: `2026-09-12T13:13:49+05:00`

## Canonical assortment authority

Authority:

`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/CANONICAL_CURRENT76_2026-09-11.tsv`

Verified:

- rows: 76;
- unique SKU: 76;
- unique product IDs: 76;
- duplicate SKU: 0;
- duplicate product ID: 0;
- prohibited historical SKU `1608153316`: absent.

## Search-query authority

Manifest:

`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/canonical_chunk_collection_manifest.tsv`

Only the manifest's `PERSISTED` and `PERSISTED_ZERO` rows were inventoried. Historical global-page files, rejected unstable-page requests, failed attempts, and invalid manual target artifacts were excluded.

| Slice | Manifest rows | Persisted files | HTTP200 zero rows | Loaded observations | SKU with observations | Zero-result SKU | Canonical coverage |
|---|---:|---:|---:|---:|---:|---:|---:|
| BY_SEARCHES / DESCENDING | 44 | 43 | 1 | 1,110 | 74 | 2 | 76/76 |
| BY_SEARCHES / ASCENDING | 14 | 13 | 1 | 1,110 | 74 | 2 | 76/76 |
| BY_GMV / DESCENDING | 14 | 13 | 1 | 1,110 | 74 | 2 | 76/76 |
| BY_GMV / ASCENDING | 17 | 16 | 1 | 1,110 | 74 | 2 | 76/76 |
| **Total** | **89** | **85** | **4** | **4,440** | — | — | **four complete slices** |

Additional reconciliation:

- manifest statuses: 85 `PERSISTED`, 4 `PERSISTED_ZERO`, 0 other;
- each referenced row file exists;
- each loaded row count equals its manifest `returned_row_count`;
- each row's `request_id` and `chunk_id` agree with its manifest row;
- unique exact source rows by `(request_id, chunk_id, query_index, sku, query)`: 4,440;
- unique raw `(sku, query)` relationships: 4,310;
- unique raw query strings across the observed sample: 2,238;
- noncanonical SKU in loaded search observations: 0;
- missing canonical SKU after combining observed and HTTP200 zero evidence: 0;
- duplicated `query_index` within one provider request: 0.

The two zero-result SKU in every slice are `1602711278` and `1602711870`. Their absence from row files is covered by explicit `PERSISTED_ZERO` evidence and is not treated as missing data.

The four slices remain bounded observations of at most 15 queries per SKU per slice. Their absence from this capture cannot prove that a query does not exist in the wider Ozon search universe.

## Product-card snapshot authority

Documentation and manifest:

- `продажи/статистика/ozon/raw/2026-08-13_2026-09-10/product_cards/README.md`
- `продажи/статистика/ozon/raw/2026-08-13_2026-09-10/product_cards/product_card_snapshot_manifest_2026-09-12.tsv`

The manifest declares:

- product info: 76/76;
- product attributes: 76/76;
- non-empty long-description attribute `4191`: 76/76;
- normalized uncompressed bytes: 546,409;
- normalized uncompressed SHA-256: `771f99b1eca6396ded8765bbdd253230f09de647a03c04aac0aa25c9b74c47c0`.

These declared counts cannot be independently verified from the committed normalized bundle because exact reconstruction fails.

### Normalized bundle failure

Parts read in lexical order:

1. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part01` — 18,000 bytes;
2. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part02` — 18,000 bytes;
3. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part03` — 18,001 bytes;
4. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part04` — 10,768 bytes.

Exact lexical concatenation produces 64,769 Base64 bytes, which is not divisible by four. Strict Base64 decoding fails with `Excess data after padding`. Permissive decoding yields 48,575 compressed bytes, but gzip decompression fails with `Compressed file ended before the end-of-stream marker was reached`.

A diagnostic streaming decompression reaches only 387,357 uncompressed bytes, reports `gzip_eof=false`, and therefore cannot produce the required 546,409-byte authority or its declared SHA-256. Partial output was not accepted as evidence and was not used for analysis.

### Provenance capture backup failure

The six declared `CURRENT76_BRIDGE_BATCH_CAPTURE_2026-09-12.txt.gz.b64.part*` files concatenate to valid Base64 and decode to 71,186 compressed bytes. Gzip decompression nevertheless fails with the same end-of-stream error. Diagnostic streaming decompression reaches 710,631 bytes with `gzip_eof=false`, below the declared 905,948 bytes.

The provenance backup therefore cannot be used to validate or reconstruct the missing normalized content.

## Mandatory acceptance matrix

| Check | Required | Verified result | Status |
|---|---:|---:|---|
| Canonical target count | 76 | 76 | PASS |
| Four successful query slices | 76 SKU per slice | 76/76 per slice | PASS |
| Product info count | 76 | Manifest declares 76; bundle unreadable | **FAIL / NOT VERIFIABLE** |
| Product attributes count | 76 | Manifest declares 76; bundle unreadable | **FAIL / NOT VERIFIABLE** |
| Description attribute 4191 count | 76 | Manifest declares 76; bundle unreadable | **FAIL / NOT VERIFIABLE** |
| Product-card bundle uncompressed size | 546,409 bytes | No complete gzip stream | **FAIL** |
| Product-card bundle SHA-256 | `771f99…47c0` | Cannot be calculated from complete content | **FAIL** |
| Product-card SKU reconciliation | exactly canonical 76 | Cannot be completed | **FAIL / NOT VERIFIABLE** |

## Raw immutability checkpoint

Before any analytical write, SHA-256 was calculated for all 129 files under:

`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/`

SHA-256 of the sorted checksum inventory: `4f39ae354446a935ebc3f2a132a61cb3e412d2c917b9b54da06a466d6a17016a`.

The raw tree must retain this content through the end of the blocked pass.

## Required remediation before semantic processing

Republish a complete, locally verified normalized bundle from the preserved source without overwriting or deleting the current raw artifacts. Before resuming, the replacement authority must pass all of the following in one clean reconstruction:

1. lexical part concatenation;
2. strict Base64 decoding;
3. gzip end-of-stream validation;
4. exact uncompressed byte count;
5. exact declared SHA-256;
6. exactly 76 parseable normalized records;
7. 76/76 canonical SKU and product-ID reconciliation;
8. 76/76 `info`, `attributes_snapshot`, and non-empty attribute `4191` coverage.

Until that source gate passes, producing query-to-SKU relevance, card coverage, gaps, ownership, cannibalization, or recommendations would require using incomplete card evidence and would violate the execution prompt.
