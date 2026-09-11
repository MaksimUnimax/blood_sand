# Ozon monthly query capture — canonical target correction

Date: 2026-09-11

The previously used 76-SKU chunk plan was built from the older `20260826__ozon__product-master__fresh-current76.csv` snapshot and was incorrectly treated as the current target authority during part of the collection.

That earlier plan and all responses produced from it are preserved as historical raw evidence, but they **must not be used as current76 completeness authority**.

## Correct authority

Current target authority for this monthly collection is:

- `CANONICAL_CURRENT76_2026-09-11.tsv`
- `chunk_plan_76sku_limit15_pagesize100.tsv` after the 2026-09-11 correction

The old plan is preserved verbatim as:

- `chunk_plan_76sku_limit15_pagesize100_STALE_20260826_SNAPSHOT.tsv`

## Collection rule after correction

- exactly the 76 SKUs in `CANONICAL_CURRENT76_2026-09-11.tsv`;
- chunks of at most 6 SKUs;
- `limit_by_sku=15`;
- `page_size=100`;
- `page=0` only;
- four slices: `BY_SEARCHES DESCENDING`, `BY_SEARCHES ASCENDING`, `BY_GMV DESCENDING`, `BY_GMV ASCENDING`;
- no global pagination;
- every successful raw chunk persisted with exact request ID;
- no SEO/semantic analysis until raw collection closes.

## Status of earlier stale-target requests

The pre-correction chunk files and `chunk_collection_manifest.tsv` are retained for provenance. They can contain a mixture of SKUs that intersect current76 and SKUs that are out of target. Current76 coverage must be recalculated only from the corrected target list.

The two latest failed requests against stale C05/C06 (`13c877f6-ccb5-4d8f-8f57-a88e557296fd`, `f1cde225-eaf4-4e2d-a75d-1aadfe754861`) returned HTTP 429 and are not retried because that stale target plan is superseded.
