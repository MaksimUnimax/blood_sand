# Ozon semantic analysis — source inventory and reconciliation

Date: 2026-09-12

Execution status: **SOURCE_INTEGRITY_PASS**

Semantic processing: **PHASE A COMPLETE — phases B–L remain pending**

## Decision

The search-query evidence reconciles to the canonical assortment and the repaired product-card authority has now passed local integrity QA plus remote GitHub byte readback. The mandatory Phase A source gate is therefore cleared.

No new Ozon Seller API, Performance API, Ozon Bridge provider request, or web search was made during the source repair. No product card was changed.

## Canonical assortment authority

`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/CANONICAL_CURRENT76_2026-09-11.tsv`

Verified:

- rows: `76`;
- unique SKU: `76`;
- unique product IDs: `76`;
- duplicate SKU: `0`;
- duplicate product ID: `0`;
- prohibited historical SKU `1608153316`: absent.

## Search-query authority

`продажи/статистика/ozon/raw/2026-08-13_2026-09-10/canonical_chunk_collection_manifest.tsv`

Verified search layer:

| Slice | Loaded observations | Canonical coverage |
|---|---:|---:|
| BY_SEARCHES / DESCENDING | 1,110 | 76/76 |
| BY_SEARCHES / ASCENDING | 1,110 | 76/76 |
| BY_GMV / DESCENDING | 1,110 | 76/76 |
| BY_GMV / ASCENDING | 1,110 | 76/76 |
| **Total** | **4,440** | **four complete slices** |

Additional reconciliation:

- unique exact source observations: `4,440`;
- unique raw `(sku, query)` relationships: `4,310`;
- unique raw query strings: `2,238`;
- noncanonical SKU: `0`;
- missing canonical SKU after observed + HTTP200-zero evidence: `0`;
- prohibited SKU `1608153316`: `0`.

The four slices remain bounded observations of at most 15 queries per SKU per slice. Absence from these captured slices is not proof that a query does not exist in the wider Ozon search universe.

## Repaired product-card authority

Documentation:

- `продажи/статистика/ozon/raw/2026-08-13_2026-09-10/product_cards/README.md`;
- `продажи/статистика/ozon/raw/2026-08-13_2026-09-10/product_cards/product_card_snapshot_manifest_2026-09-12.tsv`;
- `продажи/статистика/ozon/analysis/2026-08-13_2026-09-10/PRODUCT_CARD_SNAPSHOT_REPAIR_REPORT_2026-09-12.md`.

Current verified repaired authority:

- product info: `76/76`;
- product attributes: `76/76`;
- non-empty description attribute `4191`: `76/76`;
- canonical JSONL records: `76`;
- unique SKU: `76`;
- unique product_id: `76`;
- forbidden SKU `1608153316`: `0`;
- Base64 characters: `94,200`;
- strict Base64 decode: `PASS`;
- gzip full decompression/EOF: `PASS`;
- compressed bytes: `70,650`;
- compressed SHA-256: `3ced3c222b3d4d90be5d6cbeaa6aa13f087f5569912aa06ebac172ce8cc4e8e7`;
- uncompressed JSONL bytes: `866,704`;
- uncompressed JSONL SHA-256: `f3838bacbf1a189c18dd012f4f7528b5b13cd2c604c0413aa744a8efed57647a`;
- remote GitHub byte readback: `PASS`.

The canonical repaired payload is stored as ten lexical Base64 parts. All ten Git blob SHAs were re-read from the remote repair branch and matched locally generated content slices.

## Legacy failure preserved

The original four-part normalized bundle (`771f99b1...`) and six-part capture (`7985fade...`) remain in raw evidence for audit but are known truncated/corrupt and are not analytical authorities.

The initial repaired publication attempt also had two connector-truncated files; remote readback caught this. Those bad files were deleted and replaced before the gate was changed.

## Mandatory acceptance matrix

| Check | Required | Verified result | Status |
|---|---:|---:|---|
| Canonical target count | 76 | 76 | PASS |
| Four query slices | 76 SKU per slice | 76/76 each | PASS |
| Product info | 76 | 76 | PASS |
| Product attributes | 76 | 76 | PASS |
| Description attribute 4191 | 76 | 76 | PASS |
| Repaired JSONL records | 76 | 76 | PASS |
| Repaired bundle strict Base64 | PASS | PASS | PASS |
| Repaired gzip EOF | PASS | PASS | PASS |
| Repaired uncompressed SHA-256 | declared | `f3838bacbf1a189c18dd012f4f7528b5b13cd2c604c0413aa744a8efed57647a` | PASS |
| SKU/product_id reconciliation | canonical 76 | 76/76 | PASS |
| Remote byte readback | exact | exact Git blob SHA match | PASS |

## Phase A verdict

`QA_STATUS = SOURCE_INTEGRITY_PASS`

`PHASE_A = COMPLETE`

`PHASES_B_TO_L = NOT_YET_EXECUTED`

The next valid step is the full-volume semantic processing pass beginning with Phase B, while retaining the same bounded-query limitation and the repaired product-card authority above.
