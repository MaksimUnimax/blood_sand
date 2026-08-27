# B21 Return Giveout Reads — candidate evidence

Status: `B21_AUTHOR_GATE_PASS`

Accepted base: `a85bce42c2b25677b8870b7847357f7df56204b3` (B20 accepted).
Accepted B20 production tree: `126ac9add7c099b758a962415fdbf0c662e00f0b51482228cf9c58a01afd7496`.

Exact Seller Swagger authority used author-side:
- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B21 adds four fixed read-only Seller operations:
1. `returns_company_fbs_info` -> `POST /v1/returns/company/fbs/info`
2. `return_giveout_is_enabled` -> `POST /v1/return/giveout/is-enabled`
3. `return_giveout_list` -> `POST /v1/return/giveout/list`
4. `return_giveout_info` -> `POST /v1/return/giveout/info`

All four are exact current `ReturnAPI` operations, non-deprecated in the supplied Swagger, all-account reads, `single_read`, `READ_SAFE`, `safe_projection`.

Contract closure:
- company FBS info requires `pagination.limit`; exact description caps it at 500 while OpenAPI has no numeric maximum. B21 enforces max 500 and int32 representation, does not invent a non-negative lower bound, and accepts explicit `last_id`/`place_id` only as safe int64 numbers.
- giveout is-enabled uses required JSON request body with `v1Empty`; normalized params are exactly `{}` and transport sends `{}`.
- giveout list requires int64 `limit`, optional int64 `last_id`; Swagger provides no numeric bounds, so B21 invents none.
- giveout info requires int64 `giveout_id`; Swagger provides no numeric bounds, so B21 invents none.
- no automatic `last_id` continuation, no retries, no fanout, no provider chaining.

Safety boundary:
- `/v1/return/giveout/barcode`, `/v1/return/giveout/get-pdf', `/v1/return/giveout/get-png` are intentionally NOT enabled because they expose the operational barcode used to receive physical return shipments.
- `/v1/return/giveout/barcode-reset` is a state-changing operation and is NOT enabled.
- B21 performs zero real Seller/Performance requests and uses zero credentials.

Exact author regression markers passed, including currentness, entitlements, carry-forward, protected runtime identities and 18 production-JS syntax checks.
