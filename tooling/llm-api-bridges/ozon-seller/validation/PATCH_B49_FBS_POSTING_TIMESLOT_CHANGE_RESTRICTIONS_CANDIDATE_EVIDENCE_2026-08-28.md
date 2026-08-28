# B49 FBS Posting Timeslot Change Restrictions — candidate evidence

Base authority: accepted B48 production tree `48f3947c027554d5de3335adc4f6b18a4c0705ef74fbee3ab1abc951694eb8e6`.

Exact Seller Swagger authority reverified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B49 adds one direct safe FBS/rFBS posting read:
- `fbs_posting_timeslot_change_restrictions` — `POST /v1/posting/fbs/timeslot/change-restrictions`

The method returns the available delivery-change interval and remaining number of changes for one explicitly supplied posting number. Exact response fields are only `delivery_interval.begin`, `delivery_interval.end`, and `remaining_changes_count`; there are no phone, email, address, customer/person, sender/driver, document/file, barcode, token, webhook, or secret fields.

Exact request schema requires only string `posting_number`. Swagger declares no `minLength`, so B49 validates the required type without inventing a non-empty restriction. One explicit AI command maps to exactly one physical Seller request; no hidden pagination, retry, polling, fanout, secondary detail call, or provider chaining is introduced.

Exact entitlement compilation classifies the endpoint as `ALL_ACCOUNTS`; it is current, non-deprecated, and has no shutdown warning.

B49 remains in the existing `orders_postings / fbs_postings` family beside the already accepted `fbs_posting_restrictions` operation. Runtime `safe_projection` preserves the safe interval/count result and still redacts injected customer/address/phone/email fields.

Author gates PASS: registry/taxonomy, exact request construction, transport-injection rejection, entitlement, exact-Swagger currentness/privacy, safe projection, zero-request guidance, B48-and-earlier carry-forward, protected runtime byte identities, deterministic patch application, no hidden pagination/retry/polling/fanout/chaining, and `node --check` for all 18 production JavaScript files.

Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
