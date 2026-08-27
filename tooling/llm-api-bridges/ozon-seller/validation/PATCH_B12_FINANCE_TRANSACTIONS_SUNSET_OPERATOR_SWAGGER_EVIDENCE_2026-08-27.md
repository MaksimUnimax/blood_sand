# B12 Finance Transactions Sunset — exact Swagger evidence

Exact operator-supplied Seller Swagger:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

Evidence:

- `POST /v3/finance/transaction/list` — operationId `FinanceAPI_FinanceTransactionListV3`; warning says the method is becoming obsolete and will be disabled on **8 September 2026**; it directs clients to `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, and `/v1/finance/accrual/by-day`.
- `POST /v3/finance/transaction/totals` — operationId `FinanceAPI_FinanceTransactionTotalV3`; same shutdown date and same replacement family.
- `POST /v1/finance/accrual/postings` — operationId `GetFinanceAccrualPostings`, current in the exact Swagger.
- `POST /v1/finance/accrual/types` — operationId `GetFinanceAccrualTypes`, current in the exact Swagger.
- `POST /v1/finance/accrual/by-day` — operationId `GetFinanceAccrualByDay`, current in the exact Swagger.

Accepted B11 already exposes the three replacement reads from B5 and does not expose either legacy v3 transaction route.

Conclusion: B12 closes the queue item without production changes. Adding the soon-disabled v3 methods would be contrary to the currentness rule and would duplicate an already accepted replacement surface.
