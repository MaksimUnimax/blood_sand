# Ozon Performance paired-campaign SKU diagnostic — LIVE PASS — 2026-09-09

## Verdict

**PASS.** A three-command sequential batch compared two live campaigns from the same product family and pulled one-day SKU statistics with exactly three logical results and three physical Performance API requests. No coalescing, hidden pagination, retry, polling, fan-out, provider chaining, or command transformation occurred.

## Batch accounting

- `result_count = 3`
- `logical_business_result_count = 3`
- `physical_business_request_count = 3`
- `coalesced_group_count = 0`
- `coalesced_logical_count = 0`
- capability probe: not performed / not needed

All three requests returned HTTP 200, `external_request_executed=true`, `exact_request_preserved=true`, equal logical/physical fingerprints, and `command_transformed=false`.

## Compared campaigns

### Search-and-category

Campaign ID: `37130638`

Products:

- SKU `1943215793` — bid `1000000` — `Православный Оберег в машину. Молитва Иоанна Златоуста "Господи Иисусе Христе, не остави мя"`
- SKU `2326866320` — bid `3000000` — `Православный Оберег в машину. "Спаси и Сохрани"`

### Top-promotion

Campaign ID: `37130609`

Products:

- SKU `1943215793` — bid `3000000`
- SKU `2326866320` — bid `6000000`

The campaign product sets are exactly the same two SKUs. The only directly observed campaign-product difference in this read is the bid level: top-promotion has higher raw bids for both SKUs.

## One-day SKU statistics — 2026-09-08

### Campaign `37130609` — top-promotion

SKU `1943215793`:
- views `48`
- clicks `0`
- CTR `0`
- cart `0`
- avg CPC `0.00`
- expense `0.00`
- orders `0`
- sales `0.00`

SKU `2326866320`:
- views `417`
- clicks `7`
- CTR `1.68`
- cart `2`
- avg CPC `5.87`
- expense `41.10`
- orders `0`
- sales `0.00`

### Campaign `37130638` — search-and-category

SKU `1943215793`:
- views `61`
- clicks `0`
- CTR `0`
- cart `0`
- avg CPC `0.00`
- expense `0.00`
- orders `0`
- sales `0.00`

SKU `2326866320`:
- views `1468`
- clicks `31`
- CTR `2.11`
- cart `3`
- avg CPC `3.00`
- expense `92.95`
- orders `0`
- sales `0.00`

## Diagnostic observations

1. Both campaigns advertise the same two SKUs, so the large performance difference observed in the broader 62-day stress dataset is not explained by different product composition.
2. On 2026-09-08 all paid traffic/spend in both campaigns is concentrated on SKU `2326866320`; SKU `1943215793` received impressions but zero clicks in both placements.
3. On the tested day search-and-category produced more scale for SKU `2326866320` (`1468` views, `31` clicks) at lower observed average CPC (`3.00`) than top-promotion (`417` views, `7` clicks, avg CPC `5.87`).
4. Neither placement produced an order on the tested day, so this single-day slice cannot by itself explain the broader-period order difference.
5. Top-promotion carries higher configured raw bids on both SKUs (`3000000/6000000` versus `1000000/3000000`). The next diagnostic step must compare these configured bids against current minimum/competitive bid surfaces; do not infer causality from the raw bid numbers alone.

## Next live step

Use only the two real SKUs returned above:

- `1943215793`
- `2326866320`

Run one explicit `performance_min_bid_by_sku` request for RU/CPC and one explicit `performance_competitive_bids` request for each campaign. Expected accounting: 3 logical results = at most 3 physical business requests.
