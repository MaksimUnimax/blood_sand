# Patch B5 — Finance / Realization contract closure

Date: 2026-08-26
Status: `PATCH_B5_FINANCE_REALIZATION_CONTRACTS_CONFIRMED_WITH_REALIZATION_ACCOUNT_GATE_DEFERRED`

## Accepted base

- accepted B4 commit: `4f396c03243199746d6ecff4cdcccfba5c8741a5`
- accepted B4 production tree: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`
- exact Swagger authority: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

## Enabled B5 pure-read gate

B5 may enable exactly:

- `finance_accrual_postings` -> `POST /v1/finance/accrual/postings`
- `finance_accrual_types` -> `POST /v1/finance/accrual/types`
- `finance_accrual_by_day` -> `POST /v1/finance/accrual/by-day`
- `report_list` -> `POST /v1/report/list`
- `report_info` -> `POST /v1/report/info`

All are fixed `seller_api`, `POST`, `READ`, `single_read` operations.

## Explicitly deferred

### `finance_realization_posting`

`POST /v1/finance/realization/posting` is contract-known but not enabled in B5 because official Swagger states an account-contract restriction for sellers contracted with ТОО «ОЗОН Маркетплейс Казахстан». Current entitlement state does not carry a proven field that can evaluate that condition before execution.

No `ALL_ACCOUNTS` guess is permitted.

### `realization_report_create`

`POST /v1/report/realization/posting/create` remains unimplemented because it creates a server-side artifact. B5 authorizes no report create/poll/retrieve workflow.

## Result protection

`report_list` and `report_info` may expose links to previously generated report files. Their model-visible safe projection redacts the `file` field. The bridge does not follow that URL.

## Runtime boundary

B5 production delta is limited to:

- `shared/ozon_operation_registry.js`
- `shared/ozon_contract.js`
- `shared/ozon_entitlements.js`

Autorun, Work-session lifecycle, Manual mode, service worker, content script, provider transport, credentials, quota/cache/history/no-replay and timers are protected and out of scope.

One explicit command remains at most one fixed business request. No retry, auto-pagination, last_id looping, page looping, fanout, report creation, report download or write is authorized.
