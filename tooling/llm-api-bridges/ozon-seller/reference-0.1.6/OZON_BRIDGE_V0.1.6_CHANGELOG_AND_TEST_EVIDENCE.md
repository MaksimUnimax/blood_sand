# Ozon Bridge v0.1.6 — changelog and test evidence

Date: 2026-08-12  
Status: release candidate validated locally and from a fresh final ZIP extraction before repository acceptance.  
Base release: v0.1.5.  
Boundary authority input: `../OZON_BRIDGE_BOUNDARY_AUDIT_2026-08-12.md`.

## 1. Release mandate

The release implements the explicit provider-boundary rule:

> Where an Ozon-side limit is documented in the supplied official Ozon OpenAPI contracts, preserve/enforce that provider-owned limit for the corresponding operation. Where no Ozon limit was found or established, do not impose an arbitrary smaller data/request/response limit in the extension.

This rule does **not** mean Ozon has infinite capacity. It means the bridge no longer represents undocumented local numbers as provider constraints or rejects/truncates otherwise valid data merely because of those invented generic numbers.

Security/privacy/lifecycle invariants are separate from provider semantic limits and remain mandatory.

## 2. Provider-owned limits retained per current alias

The v0.1.6 contract keeps provider-specific constraints established from the supplied Ozon Seller API OpenAPI:

- `roles` -> `/v1/roles`: empty request params;
- `stocks_current` -> `/v4/product/info/stocks`: page `limit` 1..1000; cursor continuation; no invented `maxItems` for documented `filter.offer_id` / `filter.product_id` arrays because the supplied schema does not specify one;
- `analytics_data` -> `/v1/analytics/data`: required fields; without Premium Plus, last 3 months; method no more than once/minute; `limit` 1..1000; up to 14 metrics; offset continuation;
- `product_queries`: page >= 0, `page_size <= 1000`, up to 1000 SKUs, required request fields and documented history/subscription behavior;
- `product_queries_details`: page >= 0, `page_size <= 100`, up to 1000 SKUs, `limit_by_sku <= 15`, required request fields;
- `posting_fbo_list` -> `/v3/posting/fbo/list`: period <= one year, `limit` 1..100, up to 1000 `order_numbers` and 1000 `posting_numbers`, cursor continuation;
- `supply_order_get`: up to 50 `order_ids`;
- `supply_order_details`: one required `order_id`.

The release does not add Performance API operations. Performance remains a separate bridge/auth surface.

## 3. Generic request limits removed

v0.1.5 generic request sanitization could reject valid Ozon-shaped JSON using bridge-owned values:

- `maxDepth = 10`;
- `maxItems = 5000`;
- `maxKeys = 2000`;
- serialized `params <= 200000` UTF-8 bytes.

v0.1.6 removes these generic data caps.

`sanitizeJsonValue()` now traverses iteratively and validates JSON-compatible values while retaining security validation such as transport/auth-key rejection. Non-finite numbers and cyclic/repeated direct object graphs that cannot represent ordinary parsed JSON fail closed.

`deepFreeze()` is iterative so deep valid provider/request structures are not rejected merely because of the former recursive traversal assumptions.

## 4. Silent provider-result truncation removed

v0.1.5 `redactSensitiveResult()` could alter a successful provider result by:

- replacing subtrees deeper than 14 with `[REDACTED_DEPTH]`;
- slicing arrays to 10,000 elements;
- stopping after 20,000 aggregate keys and inserting `__truncated__`.

A second result sanitizer also imposed `maxDepth=16`, `maxItems=10000`, `maxKeys=25000`.

v0.1.6 removes these generic structural result caps. Successful non-sensitive provider data is traversed without silent array/key/depth truncation.

The invariant is now: **a provider result must never be presented as complete after the bridge silently discarded non-sensitive data**.

## 5. PII/privacy redaction separated from data-size policy

Privacy safeguards remain, but they no longer double as generic structural truncation.

For current allowed Seller response schemas, v0.1.6 explicitly handles relevant sensitive paths:

- `posting_fbo_list`: redact `postings[].legal_info` and `postings[].products[].digital_codes`;
- `supply_order_get`: preserve operational seller warehouse addresses such as `orders[].dropoff_warehouse.address` and `orders[].supplies[].storage_warehouse.address`;
- `supply_order_details`: preserve `supplies[].storage_warehouse.address`, while redacting driver name, driver phone and vehicle number; vehicle model remains operationally usable.

Generic unexpected phone/e-mail/address/name/token-like fields continue to fail toward redaction unless a current trusted operational path is explicitly preserved.

## 6. Credential arbitrary-size restrictions removed

v0.1.5 used bridge-owned maximum lengths (`Client-Id` 256, `Api-Key` 2048) and a visible-ASCII-only rule that were not established as Ozon provider limits.

v0.1.6 removes those arbitrary length/visible-ASCII restrictions. Header-safety validation remains: control characters such as CR/LF are rejected and credentials must still be present as the required pair.

Credentials remain isolated from ChatGPT/content-script output.

## 7. Provider transport byte ceiling and client timeout removed

v0.1.5 provider transport used:

- `timeoutMs = 30000`;
- `maxBytes = 1500000`;
- `RESPONSE_TOO_LARGE` / timeout behavior driven by those local values.

The supplied Seller/Performance OpenAPI contracts did not establish those values as global provider constraints.

Final v0.1.6 removes the bridge-owned synchronous provider timeout and provider-response byte ceiling entirely from `shared/ozon_provider.js` and `shared/provider_transport_core.js`.

Provider transport still performs exactly one external request for one accepted command and retains no hidden retry.

## 8. Security and architecture invariants retained

This boundary correction does not relax the security model:

- fixed trusted `api-seller.ozon.ru` provider host;
- read-only fixed operation registry;
- no arbitrary host/URL/method/header/Auth/Client-Id/Api-Key injection from assistant command text;
- credential isolation;
- PII safeguards;
- one accepted command <= one external Ozon request;
- no hidden retry;
- no hidden pagination/fan-out/polling;
- Manual/Autorun controlled-error observability from v0.1.5 remains intact;
- durable worker-owned delivery/recovery semantics remain intact;
- unsafe conversation/binding failures remain fail-closed.

No mutation/write operation is added.

## 9. Test matrix

Final automated suite: **89/89 PASS**, 0 fail, 0 skipped, 0 cancelled.

Boundary-specific regression coverage includes:

- valid generic JSON depth 40 accepted;
- >2500 aggregate object keys accepted;
- >6000 array elements accepted when no operation-specific Ozon ceiling applies;
- >220,000-byte value accepted when no operation-specific Ozon body-size ceiling applies;
- transport/auth injection keys remain rejected;
- cyclic/non-JSON direct objects fail closed;
- provider-owned operation-specific limits for every currently enabled alias;
- `stocks_current` filter with 6001 product IDs is not rejected by an invented bridge `maxItems`;
- FBO page, batch and one-year period boundaries;
- valid provider response arrays >10,000 elements preserved;
- valid provider result with >20,000 aggregate data items/keys preserved;
- deep provider response beyond old depth cutoffs preserved;
- exact path-aware PII redaction and warehouse-address preservation;
- credential values beyond former 256/2048 caps accepted while CR/LF header injection remains rejected;
- provider response >1.5 MB accepted through text fallback;
- provider response >1.5 MB accepted through streaming body read;
- mocked end-to-end provider call accepts an Ozon-shaped >200 KB request and >1.5 MB response with exactly one fetch;
- source invariant proves old generic caps are absent;
- provider transport source invariant proves `timeoutMs`, `maxBytes`, `RESPONSE_TOO_LARGE`, and bridge `REQUEST_TIMEOUT` are absent from the final data path;
- connection probe uses the same no-timeout/no-byte-cap provider transport;
- retained Manual/Autorun malformed-command, validation, delivery, recovery, error and exactly-one-fetch regressions from v0.1.5;
- every production JavaScript file parses successfully;
- manifest host permissions remain restricted to ChatGPT plus the fixed Ozon Seller host.

No live Ozon request was used to brute-force undocumented payload/response limits. Boundary tests are mocked/synthetic and therefore do not introduce provider side effects or hidden multi-request probing.

## 10. Changed-line verification

The v0.1.5 -> v0.1.6 production diff is audited against V8 coverage plus exact-source assertions for metadata-only changes:

- `content_script.js`: **1/1** changed new line V8-covered;
- `manifest.json`: **1/1** exact-source asserted;
- `popup.html`: **1/1** exact-source asserted;
- `popup.js`: **2/2** exact-source asserted;
- `service_worker.js`: **1/1** V8-covered;
- `shared/ozon_contract.js`: **238/238** V8-covered;
- `shared/ozon_credentials.js`: **5/5** V8-covered;
- `shared/ozon_provider.js`: **3/3** V8-covered;
- `shared/provider_transport_core.js`: **9/9** V8-covered;
- `shared/runtime_names.js`: **2/2** V8-covered.

Result: **PASS — every changed production line is V8-covered or exact-source asserted**, and removed-cap behavior has explicit regression tests.

This does not claim 100% execution coverage of unrelated legacy extension code. Whole reconstructed run coverage is approximately 56.00% lines, 65.96% branches and 80.04% functions. Relevant files include `shared/ozon_contract.js` at 98.85% lines, `shared/ozon_provider.js` at 89.22% and `shared/provider_transport_core.js` at 90.63%.

## 11. Package/build evidence

Final release ZIP:

`ozon-bridge-v0.1.6-extension.zip`

SHA-256:

`6ff4a7daab51f05b0beb5942e5f7f6ef155b3ffa29a3a78e69eca9b7b8229242`

Packaging verification:

- production ZIP contains exactly 16 production files and no tests/evidence;
- fresh ZIP extraction compares **16/16 byte-identical** to the release source;
- the full **89/89 PASS** suite was executed again against a fresh extraction of the final ZIP;
- fresh extracted extension passes Chromium `--pack-extension` with exit code 0;
- deterministic rebuild is byte-identical to the release ZIP and has the same SHA-256;
- reproducible reconstruction chain from immutable v0.1.5 applies the reviewed patch and verifies all 16 production hashes.

## 12. Acceptance boundary

v0.1.6 is acceptable only for the boundary behavior documented above: provider-owned semantic limits are preserved, unsupported generic bridge data/byte/timeout caps are removed, non-sensitive provider data is not silently truncated, and security/privacy/exactly-once invariants remain enforced.

The release does not claim that Ozon itself has no undocumented infrastructure limits. If Ozon later documents or returns an authoritative constraint, that provider behavior becomes the source of truth for the affected operation and must be incorporated explicitly rather than guessed.
