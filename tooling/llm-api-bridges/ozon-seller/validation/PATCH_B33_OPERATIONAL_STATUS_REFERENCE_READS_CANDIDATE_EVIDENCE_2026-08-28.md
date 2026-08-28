# B33 Operational Status & Reference Reads — candidate evidence

Base B32 production tree: `aab83cfbdb05cbd1f1cff39b9cc3828fe436861c82ceaa99f80594dcb0599e49`
B33 production tree: `4c50a10e7147d180437293e140057ceedd61ac93e7c770a09a89539ea9030238`
Raw patch SHA-256: `c26f4c5415ed60f1da30f9f41fe6a564713d90885815dcc72e98c3ed648cebe6`
Gzip patch SHA-256: `1c3d2823bc0f0e70f686d98760e35779ce94ce0ef73c497ed49c15e9aa39e9d1`

Added safe reads: `product_import_info`, `product_action_timer_status`, `warehouse_operation_status`, `supplier_available_warehouses`, `fbs_carriage_ettn_status`, `fbs_traceable_attribute_list`.
All six are present in the operator key-permitted surface and are current/non-deprecated in exact Seller Swagger (3933043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`).
Author gate: registry, exact requests, entitlements, guidance zero-request, exact Swagger/currentness, safe response surface, key-permitted scope, carry-forward, protected runtime, 18 JS syntax checks = PASS.
The Swagger `maximum: 1000` attached to `product_ids` is not reinterpreted as `maxItems`; no invented array bound is added.
Seller business requests = 0. Performance business requests = 0. Credentials used = 0.
