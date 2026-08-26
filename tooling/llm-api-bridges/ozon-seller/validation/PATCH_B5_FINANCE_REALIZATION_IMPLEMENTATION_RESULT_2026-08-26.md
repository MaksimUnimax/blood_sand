# Patch B5 — Finance / Realization production implementation result

Date: 2026-08-26
Status: `PATCH_B5_FINANCE_REALIZATION_CANDIDATE_GREEN`

## Authority

- accepted B4 tree: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`
- official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- B5 raw patch SHA-256: `eb8d3fa8b8347ab58b363460e99b17fe2c0c014ac46158a5d58377fe561afce5`
- gzip transport SHA-256: `c564134bfc330930d8f23f805424d897a68ef97ca421d81d5f3e2b7394b2b6a5`
- B5 candidate tree SHA-256: `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`

## Production delta

Exactly three production files change:

- `shared/ozon_operation_registry.js` -> `aab1a5450c48df220eab35d61b61227faa4bb70464d5e6c708e08850c2360d38`
- `shared/ozon_contract.js` -> `bfe95477789d27a15ff4acf0dda27f8b9ff21fb4e111a258ab9cc1745c7ef7f9`
- `shared/ozon_entitlements.js` -> `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

Enabled operations:

- `finance_accrual_postings`
- `finance_accrual_types`
- `finance_accrual_by_day`
- `report_list`
- `report_info`

Not enabled:

- `finance_realization_posting` — account-contract eligibility cannot yet be evaluated safely.
- `realization_report_create` — server-side report creation is outside pure-read scope.

## Safety

- all enabled methods are fixed POST Seller API reads;
- `finance_accrual_types` is exact no-body;
- `finance_accrual_by_day.last_id`, report page and report code remain caller-controlled;
- no hidden pagination, retry or fanout;
- report `file` links are redacted and never fetched;
- transport/auth injection remains locally rejected;
- exact Swagger compiler confirms `ALL_ACCOUNTS` only for the five enabled reads;
- protected runtime hashes remain identical to B4.

Author-side deterministic regression passed B1, B2, B3, B4 and B5; every production JavaScript file passes `node --check`; exact Swagger B5 contract/compiler checks pass.
