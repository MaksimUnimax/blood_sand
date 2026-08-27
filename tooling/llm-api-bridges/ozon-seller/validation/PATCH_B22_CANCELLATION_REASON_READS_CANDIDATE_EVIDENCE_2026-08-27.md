# B22 Cancellation Reason Reads — candidate evidence

Status: `B22_AUTHOR_GATE_PASS`

Accepted base: `b7fe0bc35bb0fe64748c0104cd2c3f72872bf9d1` (B21 independent PASS accepted).
Accepted B21 production tree: `d65663eddb81b90261d5dc45824b5634d20545b4227afd5aac957350c1f118e7`.

Exact Seller Swagger authority used author-side:
- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B22 adds three fixed read-only Seller operations:
1. `posting_fbs_cancel_reason_list` -> `POST /v2/posting/fbs/cancel-reason/list`
2. `cancel_reason_list_by_order` -> `POST /v1/cancel-reason/list-by-order`
3. `cancel_reason_list_by_posting` -> `POST /v1/cancel-reason/list-by-posting`

Exact Swagger currentness:
- `PostingAPI_GetPostingFbsCancelReasonList`, tag `FBS`, non-deprecated, true no-body POST.
- `CancelReasonListByOrder`, tag `CancelReasonAPI`, non-deprecated, body schema `v1CancelReasonListByOrderRequest`, required `order_number:string`.
- `CancelReasonAPI_CancelReasonListByPosting`, tag `CancelReasonAPI`, non-deprecated, body schema `v1CancelReasonListByPostingRequest`, required `posting_number:string`.

All three are `READ`, `READ_SAFE`, `safe_projection`, `single_read`, all-account reads. The bridge fixes host/method/path and rejects caller-controlled transport material. No automatic pagination, retries, fanout, provider chaining, or secondary calls are introduced.

Author-side exact regression passed registry, request construction, contracts, entitlements, guidance zero-request accounting, B21-and-earlier carry-forward, protected runtime identities, exact Swagger currentness/entitlements, and 18 JavaScript syntax checks.

Seller business requests during author tests: `0`.
Performance business requests during author tests: `0`.
Credentials used during author tests: `0`.
