# B42 FBS Warehouse Setup Reference Reads — candidate evidence

Base authority: accepted B41 production tree `5ca4d33f1b1309409ad02a20c70672845f0ab62aaae4df8fc1d2288f9ebe1435`.

Exact Seller Swagger authority verified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B42 closes one coherent read-only `FBSWarehouseSetup` reference cluster with eight operations:
- `warehouse_fbs_create_dropoff_list` — `POST /v1/warehouse/fbs/create/drop-off/list`
- `warehouse_fbs_update_dropoff_list` — `POST /v1/warehouse/fbs/update/drop-off/list`
- `warehouse_fbs_create_dropoff_timeslot_list` — `POST /v1/warehouse/fbs/create/drop-off/timeslot/list`
- `warehouse_fbs_update_dropoff_timeslot_list` — `POST /v1/warehouse/fbs/update/drop-off/timeslot/list`
- `warehouse_fbs_create_pickup_timeslot_list` — `POST /v1/warehouse/fbs/create/pick-up/timeslot/list`
- `warehouse_fbs_update_pickup_timeslot_list` — `POST /v1/warehouse/fbs/update/pick-up/timeslot/list`
- `warehouse_fbs_create_return_point_list` — `POST /v1/warehouse/fbs/create/return-point/list`
- `warehouse_fbs_update_return_point_list` — `POST /v1/warehouse/fbs/update/return-point/list`

All eight are current, non-deprecated, `ALL_ACCOUNTS`, direct single reads. They return warehouse-setup reference data only: logistics point addresses/coordinates, timeslots, IDs, working hours and availability. Exact response-schema privacy traversal found no phone/email/customer/person/secret fields. `points[].address` is explicitly preserved only for these operational drop-off/return points; unrelated address/customer/phone/email fields remain redacted by `safe_projection`.

Exact request constraints are preserved without invention. Coordinates are required finite doubles where their object is required/present, but Swagger declares no latitude/longitude range. Drop-off search `address.maxLength=1000` and `types.maxItems=3` are enforced where declared. Return-point `limit` is exactly `1..500`. The malformed Swagger keyword `maximum: 1000` attached to the update return-point string `search.address` is not reinterpreted as `maxLength`. Optional `last_id` remains explicit; there is no automatic continuation.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness and privacy, operational-address safe projection, zero-request guidance, B41-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
