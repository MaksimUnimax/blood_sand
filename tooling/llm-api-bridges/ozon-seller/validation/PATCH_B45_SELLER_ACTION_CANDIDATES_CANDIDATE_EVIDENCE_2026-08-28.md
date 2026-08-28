# B45 Seller Action Candidates — candidate evidence

Base authority: accepted B44 production tree `269d3d50cf9b9455ddfb7c51ec1791b4a64fd23ba7bd3f0e54228262fce02409`.

Exact Seller Swagger authority reverified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B45 closes the one remaining direct safe read in the current `SellerActions` family:
- `seller_action_candidates` — `POST /v1/seller-actions/products/candidates`

The family already contains `seller_actions_list` and `seller_action_products`. Adjacent unimplemented methods are mutations (`create/*`, `update/*`, `products/add`, `products/delete`, `archive`, `change-activity`) or the CSV voucher-file endpoint, so they are excluded. No unrelated endpoint is mixed into B45 merely to increase batch size.

Exact request schema requires `action_id` (`uint64`) and `limit` (`int64`, 1..100); optional `cursor` is `uint64`. B45 reuses the already exact seller-action product-page normalizer because the schema is identical. Cursor remains explicitly supplied by the AI/operator; there is no automatic continuation.

Exact response-schema privacy traversal finds only product identifiers, names, prices, discount data, currency, quant metadata and cursor/has-next state. It contains no phone/email/address/customer/person/document/secret fields. Runtime `safe_projection` remains active.

Exact entitlement compilation classifies the endpoint as `ALL_ACCOUNTS`. It is current, non-deprecated, and has no shutdown warning.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness/privacy, safe projection, zero-request guidance, B44-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
