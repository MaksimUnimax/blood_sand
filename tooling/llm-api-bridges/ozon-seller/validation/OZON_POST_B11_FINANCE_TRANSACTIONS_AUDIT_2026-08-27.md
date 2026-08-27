# Ozon post-B11 audit — finance transaction queue item

Exact Seller Swagger authority: 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths.

Queue V2 next item `P0_finance_transactions` named two legacy operations:

- `POST /v3/finance/transaction/list`
- `POST /v3/finance/transaction/totals`

The exact Swagger warns that both methods are becoming obsolete and will be disabled on **8 September 2026**. Both warnings explicitly direct clients to the replacement finance accrual surface:

- `POST /v1/finance/accrual/postings`
- `POST /v1/finance/accrual/types`
- `POST /v1/finance/accrual/by-day`

Those three replacement reads were already implemented and accepted in B5 and remain enabled in accepted B11. Therefore adding the two near-sunset transaction endpoints would expand technical debt while duplicating a replacement surface already present.

Decision: close this queue item with **zero production delta**. Keep the v3 legacy transaction endpoints disabled/unexposed and preserve the accepted v1 accrual replacements.
