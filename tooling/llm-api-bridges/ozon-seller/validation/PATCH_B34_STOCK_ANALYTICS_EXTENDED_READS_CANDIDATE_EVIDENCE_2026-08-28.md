# B34 candidate evidence

- Scope: stock analytics extended reads.
- Added: `stock_turnover_analytics` -> `POST /v1/analytics/turnover/stocks`; `stock_on_warehouses_v2` -> `POST /v2/analytics/stock_on_warehouses`.
- Exact Swagger: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; 463 paths.
- Both operations: current, non-deprecated, key-permitted, ALL_ACCOUNTS, no capability probe.
- Turnover request: optional `limit` int32 1..1000, optional `offset` int32 with no invented minimum, optional `sku[]` string/int64.
- Stock-on-warehouses v2: required `limit` int64 with no invented bounds, optional `offset` int64 with no invented bounds, optional warehouse type enum.
- No automatic pagination/retries/fanout/provider chaining.
- Response graph privacy scan: no buyer/customer/phone/email/recipient/address fields.
- Author gate: PASS. Seller requests = 0; Performance requests = 0; credentials used = 0.
