# Patch B5 Finance / Realization — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B5_FINANCE_REALIZATION_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested commit: `2f7d85517c6c60666d44e58e64c5844cf441c958`
- B5 candidate production commit: `a6dd5a714832588ec9df0e77b87a50dea79c9f7a`
- Accepted B4 authority: `4f396c03243199746d6ecff4cdcccfba5c8741a5`
- B5 gzip transport SHA-256: `c564134bfc330930d8f23f805424d897a68ef97ca421d81d5f3e2b7394b2b6a5`
- B5 raw patch SHA-256: `eb8d3fa8b8347ab58b363460e99b17fe2c0c014ac46158a5d58377fe561afce5`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`

## Accepted production scope

B5 enables exactly these fixed single-read operations:

- `finance_accrual_postings` -> `POST /v1/finance/accrual/postings`
- `finance_accrual_types` -> `POST /v1/finance/accrual/types`
- `finance_accrual_by_day` -> `POST /v1/finance/accrual/by-day`
- `report_list` -> `POST /v1/report/list`
- `report_info` -> `POST /v1/report/info`

B5 intentionally does NOT enable:

- `finance_realization_posting` / `POST /v1/finance/realization/posting` because the Ozon-owned contract contains a Kazakhstan-contract eligibility restriction that the current subscription-oriented entitlement model cannot faithfully prove;
- `realization_report_create` / report-create workflow;
- legacy `/v3/finance/transaction/list` and `/v3/finance/transaction/totals`.

No hidden report creation, polling, retrieval/download, retry, pagination, fanout or write workflow is authorized.

Exactly three production files differ from accepted B4:

- `shared/ozon_operation_registry.js` -> `aab1a5450c48df220eab35d61b61227faa4bb70464d5e6c708e08850c2360d38`
- `shared/ozon_contract.js` -> `bfe95477789d27a15ff4acf0dda27f8b9ff21fb4e111a258ab9cc1745c7ef7f9`
- `shared/ozon_entitlements.js` -> `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

No service-worker, content-script, Autorun, Work-session, Manual-control, provider transport, credentials, quota/cache/history/no-replay, timing or delivery production code changed in B5.

## Deterministic validation

Author-side Linux and Windows CI on exact test authority `2f7d85517c6c60666d44e58e64c5844cf441c958` passed exact materialization, accepted B1-B4 regressions, B5 deterministic regression and all production JavaScript syntax checks.

Independent tester result supplied to the author:

`PATCH_B5_FINANCE_REALIZATION_INDEPENDENT_TEST_PASS`

Independent evidence recorded:

- tested commit: `2f7d85517c6c60666d44e58e64c5844cf441c958`;
- gzip/raw patch hashes matched;
- 21 production files;
- production tree `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`;
- changed production hashes matched;
- B1-B5 deterministic regressions PASS;
- all 18 production JavaScript syntax checks PASS;
- request contracts, no-body POST, local transport-injection rejection, report-file URL redaction, entitlement/no-probe behavior and protected B4 runtime identities PASS;
- Seller business requests = `0`;
- Performance requests = `0`;
- production modifications by independent tester = `0`.

The exact raw operator Swagger artifact was not present in the independent tester environment, so the Swagger-backed sub-gate was recorded as:

`OFFICIAL_SWAGGER_COMPILER_NOT_REEXECUTED_MISSING_RAW_ARTIFACT`

This is not an acceptance failure because the exact Swagger-backed gate had already passed author-side and the independent procedure explicitly allowed this environment-only outcome.

## Protected semantics

Report `file` URLs remain redacted from model-visible results and are never fetched automatically. `finance_accrual_types` remains an exact no-body POST. Pagination/continuation stays caller-controlled only. Autorun, Work-session lifecycle, Manual mode, provider quota/cache/history, credentials, transport ownership, delivery/no-replay and the one-explicit-command/one-business-request invariant remain protected.

## Gate for subsequent work

B5 Finance / Realization is accepted.

Subsequent work must continue evidence-first from this accepted B5 authority. Deferred contract/account-eligibility behavior must remain deferred until the bridge can represent it faithfully; async/report-create/write contours remain out of scope unless separately reviewed and gated.
