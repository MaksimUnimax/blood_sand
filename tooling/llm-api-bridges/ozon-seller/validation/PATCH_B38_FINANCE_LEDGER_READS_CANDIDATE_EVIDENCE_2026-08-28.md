# B38 candidate evidence

- Scope: finance ledger reads.
- Added `finance_cash_flow_statement_list` -> `POST /v1/finance/cash-flow-statement/list`.
- Added `finance_transaction_list_v3` -> `POST /v3/finance/transaction/list`.
- Exact Seller Swagger authority: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.
- Both routes are current, non-deprecated, and compile as `ALL_ACCOUNTS` with no subscription capability probe; full exact Swagger unresolved_rule_count remains 12.
- Cash-flow contract: required `date.from`, `date.to`, `page`, `page_size`; `page`/`page_size` are exact int32 with no invented minimum/maximum; optional `with_details` boolean.
- Transaction contract: required safe-JS int64 `page` and `page_size`; exact maximum `page_size=1000`, no invented minimum; optional filter preserves exact oneOf between `date` and `posting_number`; nested date fields remain optional exactly as Swagger declares.
- No hidden pagination, retries, polling, fanout, provider chaining, or secondary calls.
- Response-graph privacy review found no buyer/customer/recipient/contact/phone/email/address fields; `name` fields are limited to transaction item/service names.
- Author regression, exact currentness/entitlements gate, protected runtime identities, and all 18 production JavaScript syntax checks: PASS.
- Seller requests = 0; Performance requests = 0; credentials used = 0.
