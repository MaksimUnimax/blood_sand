# B1-B49 operation-level salvage map

Date: 2026-08-29  
Roadmap step: 3

## Deterministic source

The accepted historical B49 tip `59ce0cedf93e409f5988b16d5b569b4a5f229b1b` was recursively materialized. Its materializer produced exact B0..B48 base trees; B49 itself is the exact final output. Registry deltas were computed between consecutive materialized production trees. No branch name or batch title was used as a substitute for the actual registry delta.

The accepted canonical B1 was separately materialized and used to detect historical operations that are already present in the corrected canonical B1. The 463-row Seller master checklist controls current-operation membership.

## Counts

- historical stages analyzed: **49**
- historical B49 registry aliases: **201**
- unique historical Seller operation keys touched by B1-B49 deltas: **182**
- unique historical Performance operation keys touched by B1-B49 deltas: **6**
- aliases requiring fixed-cluster reclassification: **4**
- aliases outside the current 463 Seller inventory requiring deprecated/replacement reconciliation: **0**
- quarantined duplicate-number orphan branches: **2**

## Operation-level canonical target counts

- `RECLASSIFY_FIXED_SELLER_CLUSTER`: 4
- `account_access`: 2
- `advertising_performance_STEP6`: 6
- `catalog_products`: 31
- `finance`: 12
- `orders_postings`: 24
- `prices_promotions`: 18
- `returns_cancellations`: 18
- `reviews_questions`: 9
- `search_visibility`: 2
- `stocks_inventory`: 6
- `supplies_fbo`: 32
- `warehouse_logistics`: 24

## Salvage decision counts

- `ALREADY_PRESENT_IN_ACCEPTED_CANONICAL_B1`: 29
- `PRESERVE_FOR_STEP6_PERFORMANCE_PROVIDER`: 6
- `RECLASSIFY_BEFORE_CANONICAL_SALVAGE`: 4
- `SALVAGE_CANDIDATE_TO_CANONICAL_GROUP`: 149

## Fixed-cluster reclassification queue

- `seller_fbs_error_index`
- `seller_fbs_error_postings`
- `seller_rating_history`
- `seller_rating_summary`

## Outside-current-inventory currentness queue

- none

## Required corrections carried forward

- B9/B17 are salvageable `reviews_questions` work with the accepted existing Personal Data gate preserved. Step 4 will audit attachment of that gate across the whole Seller set; Step 3 does not discard these operations merely because they can expose personal data.
- Historical B6 Performance work is preserved separately for Step 6. It is excluded only from Seller-lineage replay, not from the product completion target.
- `feature/ozon-b25-cancellation-read-completion-2026-08-28` and `feature/ozon-b26-fbo-posting-detail-read-2026-08-28` are quarantined because they are not in the accepted B49 lineage.

No fresh Seller or Performance business API request is made by this analysis.
