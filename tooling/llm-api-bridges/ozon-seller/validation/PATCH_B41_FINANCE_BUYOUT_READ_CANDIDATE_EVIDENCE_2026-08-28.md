# B41 Finance Buyout Read — candidate evidence

Base authority: accepted B40 production tree `5c3186e629357c897d51143efe7adab13e47109496e8bb78b867f3b209a49bab`.

Exact Seller Swagger authority verified before gap analysis: 3,933,043 bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI 3.0.0; 463 paths.

B41 adds exactly one remaining direct, current, unambiguous safe finance read:
- `finance_products_buyout` — `POST /v1/finance/products/buyout`

Why this B-patch intentionally contains one endpoint: the adjacent remaining finance candidates fail the same gate for concrete reasons. `/v3/finance/transaction/totals` is announced for shutdown on 8 September 2026; `/v1/finance/document-b2b-sales/json` exposes buyer address data; `/v1/receipts/seller/list` is explicitly restricted to Kazakhstan-contract sellers and is not a general finance capability; `/v2/invoice/get` returns a document `file_url`; `/v1/receipts/get` returns PDF bytes; compensation/decompensation endpoints return report-creation handles rather than a direct single read. Mixing an unrelated cluster merely to increase endpoint count would violate the B-series selection rule.

The selected response contains product/finance identifiers and amounts only: `amount`, `buyout_price`, `deduction_by_category_percent`, `name`, `offer_id`, `posting_number`, `quantity`, `seller_price_per_instance`, `sku`, `vat_percent`. Exact-Swagger response-schema privacy traversal found no phone/email/address/customer/person/document-URL fields. Runtime `safe_projection` remains active.

Exact request schema requires `date_from` and `date_to` as strings. Swagger does not declare a `format`, `minLength`, or `maxLength`; B41 therefore does not invent a date grammar. The Swagger description states a maximum report period of 31 days; semantic provider enforcement remains authoritative because no machine-readable date format/range is supplied.

Author gates PASS: registry/taxonomy, exact request construction, contract validation, transport-injection rejection, entitlement, exact-Swagger currentness, exact response privacy check, safe projection, zero-request guidance, B40-and-earlier carry-forward, protected runtime byte identities, no hidden pagination/retry/polling/fanout/provider chaining, and `node --check` for all 18 production JavaScript files.

One explicit AI command still maps to one physical Seller business request. No automatic continuation, retry, polling, fanout, provider chaining, capability probe, or secondary detail request was added.

Seller business requests during development/tests: 0. Performance business requests: 0. Credentials used: 0.
