# B40 Finance Balance & Realization Reads — candidate evidence

Base authority: accepted B39 production tree `13b16dbc322e073288ac8780677a7bc1ec6fc137ea4fc428965a4f7d1e95a415`.

Exact Seller Swagger authority verified author-side before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

Gap analysis selected one coherent read-only finance cluster and adds exactly four Seller operations:
- `finance_balance` — `POST /v1/finance/balance`
- `finance_realization_by_day` — `POST /v1/finance/realization/by-day` (Premium Plus / Premium Pro entitlement)
- `finance_realization_posting` — `POST /v1/finance/realization/posting`
- `finance_realization_v2` — `POST /v2/finance/realization`

Exact request schemas are simple direct JSON bodies. B40 intentionally does not invent day/month/year minimums or maximums because the exact Swagger defines `int32` but no minimum/maximum for those fields. Balance date fields are required `date-time` strings.

Safety selection excluded deprecated or announced-shutdown versions, mutations, async report creators (`finance/compensation`, `finance/decompensation`), PDF/CSV/barcode/document endpoints, chat/notification and other PII/secret-bearing candidates, and ambiguous/duplicate legacy APIs. The chosen response schemas contain finance/product/legal-entity fields and no phone/email/address/customer-person fields; runtime safe projection remains active.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, bundled + exact-Swagger entitlements, exact-Swagger currentness, response-schema privacy check, safe projection, zero-request guidance, B39-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. No automatic continuation, retries, polling, fanout, provider chaining, capability probe, or secondary detail request was added.

Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
