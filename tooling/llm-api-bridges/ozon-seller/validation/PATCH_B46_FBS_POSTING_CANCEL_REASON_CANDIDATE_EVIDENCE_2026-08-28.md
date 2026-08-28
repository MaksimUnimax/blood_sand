# B46 FBS Posting Cancel Reason — candidate evidence

Base authority: accepted B45 production tree `0fc0d3079f6ef1b4dc14b74b3b7ad0180684cb123f34d2bf8e869d8e4562ea86`.

Exact Seller Swagger authority reverified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B46 adds one direct safe read in the existing cancellations family:
- `posting_fbs_cancel_reason` — `POST /v1/posting/fbs/cancel-reason`

It returns cancellation reasons for explicitly supplied FBS/rFBS posting numbers. Exact response fields are only posting number and reason `id/title/type_id`; no phone, email, address, customer/person, document, file, barcode, token, webhook or secret fields are present.

The adjacent conditional-cancellation list was explicitly rejected because its response contains free-text approval/reason messages that can carry personal data outside a machine-readable field-name guarantee. Mutation endpoints are also excluded.

Exact request schema requires `related_posting_numbers` as an array of strings but declares neither `minItems` nor item `minLength`. B46 therefore validates type only and intentionally does not invent non-empty constraints. One explicit command maps to one request; no pagination, retry, polling, fanout or provider chaining is introduced.

Exact entitlement compilation classifies the endpoint as `ALL_ACCOUNTS`; it is current, non-deprecated, and has no shutdown marker.

Author gates PASS: registry/taxonomy, exact request construction, transport-injection rejection, entitlement, exact-Swagger currentness/privacy, safe projection, zero-request guidance, B45-and-earlier carry-forward, protected runtime byte identities, deterministic patch application and `node --check` for all 18 production JavaScript files.

Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
