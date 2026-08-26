# Patch B4 — Orders / Returns / Cancellations contract closure

Date: 2026-08-26
Status: `PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_CONTRACTS_CONFIRMED`

## Accepted base

- accepted B3 commit: `56a52174581633bb2c39624492301d9601f99f66`
- accepted B3 production tree: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`
- exact Swagger authority: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`

## Gate

B4 may implement/revalidate only the pure read subset proven by the operator Swagger:

- revalidate `posting_fbo_list` -> `POST /v3/posting/fbo/list`;
- add `fbs_posting_list` -> `POST /v4/posting/fbs/list`;
- add `fbs_unfulfilled_list` -> `POST /v4/posting/fbs/unfulfilled/list`;
- revalidate `posting_fbs_get` -> `POST /v3/posting/fbs/get`;
- add `returns_list` -> `POST /v1/returns/list`;
- add `rfbs_returns_list` -> `POST /v2/returns/rfbs/list`;
- add `cancel_reason_list` -> `POST /v1/cancel-reason/list`;
- add `order_cancel_status` -> `POST /v1/order/cancel/status`;
- add `posting_cancel_status` -> `POST /v1/posting/cancel/status`.

`return_report_create` remains outside this gate.

## Safety classification

- `fbs_posting_list`, `fbs_unfulfilled_list`, existing `posting_fbs_get`, and `rfbs_returns_list` use the existing operator Personal Data read gate and default OFF policy.
- other B4 operations use safe projection.
- no B4 command may enable Personal Data mode or replay automatically when the setting changes.
- one explicit command -> at most one fixed business request.
- no retry, automatic cursor/last_id continuation, fanout, report workflow or write.

## Runtime boundary

B4 production scope is limited to:
- `shared/ozon_operation_registry.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_entitlements.js`.

Autorun, Work-session lifecycle, Manual mode, service worker, content script, provider transport, credentials, quota/cache/history/no-replay and timers are protected and out of scope.
