# CURRENT76 source-repair source locator — 2026-09-12

## Purpose

This checkpoint records the exact preserved source required to replay the product-card snapshot repair without any new Ozon provider calls.

## Exact preserved source located

The full historical ChatGPT/File-Library export has been located by content and creation timestamp:

- display title: `Вставленная ​​уценка.md`
- created/modified: `2026-09-12T07:39:55Z`
- required content markers verified through File Library retrieval:
  - `OZON_BATCH_RESULT_V1`
  - `OZON_RESULT_V1`
  - product-info request id `b3040c6e-34dd-4ce0-ae73-e7a1585f589d`
  - operation `seller_product_info_list`
  - HTTP 200
  - product-attributes request id `49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1`
  - operation `seller_product_attributes`
  - HTTP 200

The retrieved excerpt also contains the original two-command batch over the canonical 76 product IDs and provider product-card payload content. This is the preserved evidence source intended for the deterministic materializer.

## Current-conversation attachment is NOT the source

The file currently attached during this recovery conversation is named `Вставленная ​​уценка(2).md` and was read directly from the mounted sandbox.

Observed local facts:

- file bytes: `58495`
- decoded characters: `48617`
- occurrences of `b3040c6e-34dd-4ce0-ae73-e7a1585f589d`: `0`
- occurrences of `49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1`: `0`
- occurrences of `OZON_RESULT_V1`: `0`
- occurrences of `seller_product_attributes`: `0`

Therefore `Вставленная ​​уценка(2).md` is a shortened context/recovery transcript and MUST NOT be used to reconstruct the repaired product-card bundle.

## Why File-Library snippets are not sufficient for byte-authority replay

The File Library retrieval layer can locate and read excerpts from the exact historical source, but large results are truncated/chunked when surfaced to this execution context. Reassembling a canonical JSON/gzip authority from semantic/search snippets would not preserve the original byte stream and would recreate the same integrity risk the repair is intended to eliminate.

Accordingly, the repair remains fail-closed until the exact historical source is mounted as a local file or an already-verified repaired payload is recovered byte-for-byte.

## GitHub recovery checks performed

Additional no-provider recovery paths were checked:

- current `main` remains `ad582ae7635999f4943a0b7b6ab9805e483f50f1`;
- no GitHub commit matching repaired uncompressed SHA-256 `0cf18f2b4594990c43ae023c7aff86ca7a0f144efefa379b6305748620999551` was found;
- no committed repaired six-part payload was found;
- the historical Work transcript records reaching a `create blob` step, but no recoverable orphan blob SHA is present in the retained evidence;
- the old Work scratch workspace is not available in the current execution environment.

## Exact next replay

Once the exact source file above is mounted locally, run:

```bash
python продажи/статистика/ozon/tools/materialize_current76_product_card_snapshot_repair.py \
  --bridge-export <EXACT_2026-09-12T07-39-55Z_EXPORT> \
  --canonical-tsv продажи/статистика/ozon/raw/2026-08-13_2026-09-10/CANONICAL_CURRENT76_2026-09-11.tsv \
  --output-dir <STAGING_REPAIR_DIR>
```

Required gates remain:

- canonical SKUs = 76;
- product-info = 76/76;
- product-attributes = 76/76;
- description attribute 4191 = 76/76;
- noncanonical SKUs = 0;
- forbidden historical SKU `1608153316` = 0;
- strict Base64 = PASS;
- gzip EOF/full decompression = PASS;
- JSONL records = 76;
- exact canonical product_id/SKU reconciliation = PASS.

Then run the independent finalizer, publish repaired parts + README + manifest + repair report, perform remote GitHub byte readback/reconstruction, and only then change Phase A from `BLOCKED_SOURCE_INTEGRITY`.

## Boundary

`OZON_RECOLLECTION_REQUIRED = NO`

`EXACT_PRESERVED_SOURCE_LOCATED = YES`

`EXACT_SOURCE_BYTES_MOUNTED_IN_CURRENT_SANDBOX = NO`

`CURRENT_ATTACHMENT_IS_REPAIR_SOURCE = NO`

`MAIN_MOVED = NO`

`SEMANTIC_ANALYSIS_GATE = BLOCKED_SOURCE_INTEGRITY`
