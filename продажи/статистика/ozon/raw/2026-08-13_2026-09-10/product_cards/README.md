# Ozon current product-card snapshot — 2026-09-12

## Scope

Current snapshot for the canonical 76 Ozon products used by the search-query collection in this same period directory.

Canonical target authority:
`../CANONICAL_CURRENT76_2026-09-11.tsv`

## Successful Bridge reads

- product info: request `b3040c6e-34dd-4ce0-ae73-e7a1585f589d`, HTTP 200, 76/76 products returned.
- product attributes: request `49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1`, HTTP 200, 76/76 products returned.
- long-description attribute `4191` is non-empty for 76/76 products in the attributes snapshot, so no per-product description fan-out is required for the current semantic snapshot.

## Evidence / provenance boundary

The ChatGPT UI failed while delivering the very large Bridge result. The provider requests themselves had already completed successfully. The recoverable evidence came from the exported chat containing those successful Bridge result envelopes.

Therefore the persisted dataset is explicitly marked:
`chat_export_reconstruction_from_successful_bridge_result`

It is not claimed to be byte-for-byte provider transport capture. The capture bundle preserves the recovered Bridge-result text used for reconstruction; the normalized bundle materializes the 76 matched product info + attribute records.

## Canonical normalized bundle

Concatenate these files exactly in lexical order:

1. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part01`
2. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part02`
3. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part03`
4. `CURRENT76_PRODUCT_CARDS_NORMALIZED_2026-09-12.jsonl_bundle.gz.b64.part04`

Then Base64-decode and gzip-decompress the concatenated text.

Uncompressed size: `546409` bytes.
SHA-256 of the uncompressed normalized bundle:
`771f99b1eca6396ded8765bbdd253230f09de647a03c04aac0aa25c9b74c47c0`

The decompressed bundle contains 13 file sections corresponding to canonical chunks C01–C13 and 76 JSONL records total. Each record preserves the canonical ordinal and contains both `info` and `attributes_snapshot` with the successful Bridge request IDs.

`product_card_snapshot_CURRENT76_C01_2026-09-12.jsonl.gz.b64` is an earlier convenience copy of C01. It is not an additional canonical source and may be ignored when reconstructing the complete normalized bundle.

## Recovered Bridge-result capture bundle

The capture is stored as six Base64/gzip parts named:
`CURRENT76_BRIDGE_BATCH_CAPTURE_2026-09-12.txt.gz.b64.part01` … `part06`.

Reconstruction is the same: concatenate parts in lexical order, Base64-decode, gzip-decompress.

Uncompressed capture size: `905948` bytes.
SHA-256 of the uncompressed capture text:
`7985fade8bf263a15cefc31f678cf3475a5bb7e6ec5056fdc631a23865db5e11`

This capture represents the recovered chat/export rendering of the successful Bridge batch, not raw provider transport bytes.

## Current snapshot fields

The normalized data includes, where returned: product ID, SKU, name/title, offer ID, Ozon description-category ID, type ID, creation/update timestamps, barcodes, model info, stocks/statuses, primary image, prices, dimensions/weight, full product attributes, complex attributes, attributes-with-defaults, and the long description carried by attribute `4191`.

## State

`CURRENT76_PRODUCT_INFO = HTTP200 / 76-of-76`

`CURRENT76_PRODUCT_ATTRIBUTES = HTTP200 / 76-of-76`

`CURRENT76_DESCRIPTION_ATTRIBUTE_4191 = 76-of-76`

No failed provider attempts or guidance/parser errors belong in this data directory.
