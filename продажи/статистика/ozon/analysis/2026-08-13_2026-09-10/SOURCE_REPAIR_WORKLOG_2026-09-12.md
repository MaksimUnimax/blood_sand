# Ozon CURRENT76 product-card snapshot source repair worklog — 2026-09-12

## Status

`REPAIR_PIPELINE_MATERIALIZED / SOURCE_BYTES_NOT_YET_REPLAYED / MAIN_UNCHANGED / ANALYSIS_GATE_STILL_BLOCKED`

This is a recovery/tooling checkpoint. It does **not** claim that the repaired product-card bundle has already been republished or that Phase A has passed.

## Live authority at recovery start

- repository: `MaksimUnimax/blood_sand`
- live `main` at recovery start: `ad582ae7635999f4943a0b7b6ab9805e483f50f1`
- commit message: `analysis(ozon): record blocked source integrity gate`
- base tree: `e46ee97973ae98ffca50efd22b0688f0515a067f`
- repair branch: `repair/ozon-product-card-snapshot-recovery-2026-09-12`
- canonical target: `продажи/статистика/ozon/raw/2026-08-13_2026-09-10/CANONICAL_CURRENT76_2026-09-11.tsv`
- expected canonical count: 76
- forbidden historical SKU: `1608153316`

## Why the gate is blocked

The product-card bundle currently published on `main` is truncated/corrupt and cannot be used as an analytical authority. The already-published `00_SOURCE_INVENTORY.md` therefore correctly stopped the semantic pass at Phase A with `BLOCKED_SOURCE_INTEGRITY`.

No semantic classification, clusters, card-coverage matrix, ownership/cannibalization decisions, or card recommendations may be promoted from this broken source.

## Preserved provider evidence; no re-collection required

The already-successful current provider results are identified by exact Bridge request IDs:

- product info: `b3040c6e-34dd-4ce0-ae73-e7a1585f589d`
- product attributes: `49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1`

Both were HTTP 200 in the preserved Bridge export. The product-attributes result contains current card attributes including long-description attribute `4191`.

A prior local recovery session verified a complete repaired source with:

- canonical records: 76
- unique SKUs: 76
- unique product IDs: 76
- `4191` present: 76/76
- forbidden SKU `1608153316`: 0
- strict Base64: PASS
- gzip EOF: PASS
- uncompressed bytes: 872784
- previously verified uncompressed SHA-256: `0cf18f2b4594990c43ae023c7aff86ca7a0f144efefa379b6305748620999551`

That prior repaired payload was never published to `main`; therefore the hash above is a forensic comparison target, not permission to claim remote PASS without reproducing and reading back the bytes.

## Recovery materializer

Tool:

`продажи/статистика/ozon/tools/materialize_current76_product_card_snapshot_repair.py`

Properties:

1. makes no provider/network/API calls;
2. extracts only the two exact request IDs above from a preserved Bridge chat/export file;
3. rejects non-HTTP200 sources;
4. accepts repeated copies of the same request in a transcript only when their parsed payloads are identical; conflicting duplicates are a hard failure;
5. loads the canonical 76-SKU TSV and requires ordinals exactly 1..76;
6. requires 76 product-info rows and 76 product-attribute rows;
7. requires provider product-id sets to equal the canonical product-id set exactly;
8. requires both source SKU mappings to equal the canonical SKU for every product;
9. requires attribute `4191` to be present and non-empty for all 76 products;
10. rejects the forbidden historical SKU;
11. keeps the complete product-info and product-attributes provider objects in each normalized JSONL record;
12. uses deterministic JSON serialization and deterministic gzip (`mtime=0`);
13. Base64-encodes and splits the gzip stream into text parts;
14. immediately performs strict Base64 + gzip + JSONL round-trip verification;
15. records SHA-256 of the source export, canonical TSV, compressed bytes, and uncompressed JSONL;
16. refuses to overwrite prior repaired outputs unless `--overwrite` is explicitly supplied.

## Local tool QA performed during recovery

The materializer passed:

- Python compilation;
- a synthetic 76-SKU end-to-end reconstruction;
- exact canonical count reconciliation;
- 76/76 long-description gate;
- strict Base64 round trip;
- gzip round trip;
- JSONL parse/readback;
- duplicate-identical Bridge-result transcript handling.

Synthetic data are only a tool test and are never publication authority.

## Exact replay command

Run only after the preserved Bridge export is available as a local file:

```bash
python продажи/статистика/ozon/tools/materialize_current76_product_card_snapshot_repair.py \
  --bridge-export <PRESERVED_BRIDGE_EXPORT_FILE> \
  --canonical-tsv продажи/статистика/ozon/raw/2026-08-13_2026-09-10/CANONICAL_CURRENT76_2026-09-11.tsv \
  --output-dir <STAGING_OUTPUT_DIRECTORY>
```

Do not supply `--expected-prior-sha256` as a blind success shortcut. First inspect the deterministic schema/serialization used by the recovered output. If the exact prior repaired encoding is intentionally being reproduced, the optional regression gate may then be used:

```bash
--expected-prior-sha256 0cf18f2b4594990c43ae023c7aff86ca7a0f144efefa379b6305748620999551
```

## Required acceptance before publication

Publication is permitted only after all of these are true on the actual preserved source:

- `canonical_sku_count = 76`
- `product_info_count = 76`
- `product_attributes_count = 76`
- `description_4191_count = 76`
- unique SKU count = 76
- unique product_id count = 76
- noncanonical SKU count = 0
- forbidden SKU present = false
- strict Base64 decode = PASS
- gzip full decompression/EOF = PASS
- JSONL records = 76
- reconstructed records map exactly to canonical product_id/SKU pairs
- source/provider request IDs are the exact two current authorities above

Then and only then:

1. publish the repaired bundle parts;
2. update `product_cards/README.md`;
3. update `product_card_snapshot_manifest_2026-09-12.tsv`;
4. materialize the final repair report with actual hashes and sizes;
5. re-read the committed files from remote GitHub;
6. reconstruct the bundle again from remote parts and repeat all integrity checks;
7. update/replace the Phase A source inventory from `BLOCKED_SOURCE_INTEGRITY` only if the remote readback passes;
8. resume the large-data semantic analysis from Phase A, not Phase B.

## Current boundary

The preserved Bridge source exists outside the GitHub repository, but its full byte stream is not mounted into this execution sandbox. Therefore this recovery pass intentionally does not fabricate repaired bundle bytes from search snippets and does not move `main` to a false PASS.

`OZON_RECOLLECTION_REQUIRED = NO`

`MAIN_MOVED = NO`

`PRODUCT_CARD_BUNDLE_REMOTE_REPAIR = PENDING_SOURCE_REPLAY`

`SEMANTIC_ANALYSIS_GATE = BLOCKED_SOURCE_INTEGRITY`
