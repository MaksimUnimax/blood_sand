# B37 candidate evidence

- Scope: safe FBO removal/utilization report reads.
- Added: `removal_from_stock_list` -> `POST /v1/removal/from-stock/list`; `removal_from_supply_list` -> `POST /v1/removal/from-supply/list`.
- Exact Swagger: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; 463 paths.
- Both operations: current, non-deprecated BetaMethod reads, key-permitted, ALL_ACCOUNTS, no capability probe.
- Request contracts: required `date_from`, `date_to`, `limit`; dates are `YYYY-MM-DD`; `limit` int32 1..500; optional string `last_id`.
- Reverse date order is not rejected because the exact Swagger does not declare an ordering constraint.
- No automatic last_id pagination, retries, polling, fanout, provider chaining, or secondary requests.
- Response privacy graph has product/warehouse fields and business destination address, but no buyer/customer/phone/email/recipient/passport/person/client/contact/sender fields.
- Author gate: PASS. Seller requests = 0; Performance requests = 0; credentials used = 0.
