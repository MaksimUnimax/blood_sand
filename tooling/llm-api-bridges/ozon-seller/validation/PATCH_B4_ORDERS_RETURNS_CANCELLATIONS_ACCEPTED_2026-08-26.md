# Patch B4 Orders / Returns / Cancellations — ACCEPTED

Date: 2026-08-26
Status: `PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Exact independently tested commit: `a0e76fd51b8a8110f919bf58a1f80d05a482266a`
- Independent tester result commit: `4e75e989fed7f0869ef31d90717420d55b19e3d3`
- Independent result file: `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_INDEPENDENT_TEST_RESULT_2026-08-26.md`
- Accepted B3 authority: `56a52174581633bb2c39624492301d9601f99f66`
- B4 gzip transport SHA-256: `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`
- B4 raw patch SHA-256: `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d`
- Accepted production file count: `21`
- Accepted production tree SHA-256: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`

## Accepted production scope

B4 adds exactly these fixed read operations:

- `fbs_posting_list` -> `POST /v4/posting/fbs/list`
- `fbs_unfulfilled_list` -> `POST /v4/posting/fbs/unfulfilled/list`
- `returns_list` -> `POST /v1/returns/list`
- `rfbs_returns_list` -> `POST /v2/returns/rfbs/list`
- `cancel_reason_list` -> `POST /v1/cancel-reason/list`
- `order_cancel_status` -> `POST /v1/order/cancel/status`
- `posting_cancel_status` -> `POST /v1/posting/cancel/status`

B4 revalidates without duplicating:

- `posting_fbo_list` -> `POST /v3/posting/fbo/list`
- `posting_fbs_get` -> `POST /v3/posting/fbs/get`

`POST /v2/report/returns/create` remains intentionally unimplemented. No report creation, polling, retrieval, retry, hidden pagination or fanout is authorized.

Exactly three production files differ from accepted B3:

- `shared/ozon_operation_registry.js` -> `cfaa168d5a6734b9d5948dbddeef6e090c431e17e5b312d5f536c4418753d8de`
- `shared/ozon_contract.js` -> `6cc19aa7037d9f6952e7e3704e301725ba44c71730db2aa9bb5d9fb1538c66c6`
- `shared/ozon_entitlements.js` -> `973518cbef3cdcfd454e11af3f13b88b4181993234dee89bfb4f807e4fec5fcf`

No service-worker, content-script, Autorun, Work-session, Manual-control, provider transport, credentials, quota/cache/history/no-replay, or timing production code changed in B4.

## Deterministic acceptance

Independent materialization re-established the complete A1 -> A5 -> B0 -> B1 -> B2 -> B3 -> B4 identity chain and passed the B4 gzip transport, raw patch, patch application, 21-file production count, changed identities, protected B3 identities and final tree gates.

Accepted B1/B2/B3 regressions remained green on the B4 tree.

Independent B4 regression passed:

- `B4_ORDERS_RETURNS_REGISTRY_PASS`
- `B4_ORDERS_RETURNS_EXACT_REQUEST_PASS`
- `B4_ORDERS_RETURNS_CONTRACT_PASS`
- `B4_ORDERS_RETURNS_ENTITLEMENTS_PASS`
- `B4_ORDERS_RETURNS_GUIDANCE_PASS`
- `B4_SAFE_PROJECTION_AND_PII_BINDING_PASS`
- `B4_NO_HIDDEN_PAGINATION_REPORT_WORKFLOW_PASS`
- `B4_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B4_FULL_PRODUCTION_JAVASCRIPT_SYNTAX_PASS`

The independent tester made zero Seller business requests, zero Performance requests and zero production modifications.

## Protected semantics

Personal-data reads remain default-OFF gated. `cancel_reason_list` remains an exact no-body POST. `returns_list` preserves safe projection. Autorun, Work-session lifecycle, Manual mode, provider quota/cache/history, credentials, transport ownership, delivery/no-replay and the one-explicit-command/one-business-request invariant remain protected.

## Gate for subsequent work

B4 Orders / Returns / Cancellations is accepted.

The next roadmap priority is `P0_finance_realization`. Subsequent work must begin evidence-first from accepted B4 and must not enable async/report/write contours without a separate explicit gate.