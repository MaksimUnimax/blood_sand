# B48 FBO Draft Timeslot Info — candidate evidence

Base authority: accepted B47 production tree `746a75c9ff79bccbd450356ecb4eab535c46f78e9b8e8aaf3919652ea1086533`.

Exact Seller Swagger authority reverified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B48 adds one direct safe read in the existing FBO supply/draft timeslot family:
- `fbo_draft_timeslot_info` — `POST /v2/draft/timeslot/info`

The endpoint is current, non-deprecated, has no shutdown warning, and exact entitlement compilation classifies it as `ALL_ACCOUNTS`. Its response contains only an error-reason enum, requested period, warehouse timezone, dates and timeslots; no phone, email, address, customer/person, document, file, barcode, token, webhook or secret fields are present.

Exact request schema requires `date_from`, `date_to`, `draft_id`, `selected_cluster_warehouses`, and `supply_type`. `supply_type` enum is exactly `CROSSDOCK|DIRECT|MULTI_CLUSTER`; `selected_cluster_warehouses.maxItems` is 20. The nested warehouse object has no required fields and the array has no `minItems`, so B48 does not invent those constraints.

The Swagger machine field for both date properties is literally `pattern: " YYYY-MM-DD"`. That is not a usable date regular expression (it contains a leading space and literal `Y` characters). B48 therefore does not silently repair that malformed source into a guessed date regex, and it does not invent semantic validation of the prose-only 28-day maximum. Date values remain required strings, preserving source authority without making the endpoint unusable through an invented correction.

The old `/v1/supply-order/timeslot/get` remains excluded: its exact description says it was to be disabled on 19 August 2026. B48 does not restore or alias that obsolete method.

Author gates PASS: registry/taxonomy, exact request construction, transport-injection rejection, entitlement, exact-Swagger currentness/privacy and old-version exclusion, safe projection, zero-request guidance, B47-and-earlier carry-forward, protected runtime byte identities, deterministic recursive materialization, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command maps to one physical Seller request. Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
