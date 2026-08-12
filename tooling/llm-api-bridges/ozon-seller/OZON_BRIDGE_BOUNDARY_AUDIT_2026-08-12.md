# Ozon Bridge boundary audit — 2026-08-12

Status: **research / implementation gate input**.  
Production artifact at the time of this audit: **Ozon Bridge v0.1.5**.  
No production code change is authorized by this document by itself.

## 1. Purpose

The bridge must not impose smaller arbitrary data/request limits than the authoritative Ozon API contracts unless a local limit is a genuine security, privacy, browser/runtime, or delivery-safety boundary.

This audit separates:

1. **provider-owned Ozon constraints** — must be preserved and enforced per operation;
2. **bridge-owned structural/transport limits** — may reject or truncate data independently of Ozon and therefore require review;
3. **security/privacy invariants** — remain mandatory and are not candidates for removal merely because Ozon does not define them;
4. **UI/diagnostic/lifecycle limits** — local implementation limits that do not limit the Seller dataset itself.

The guiding invariant for the next bridge revision is:

> Valid Ozon requests and valid Ozon responses must not be rejected, silently truncated, or semantically altered by generic bridge limits that are smaller than or unrelated to the provider contract. If a catastrophic local resource-safety guard is still required, it must be explicit, observable, non-silent, and documented as a bridge/runtime safety guard rather than as an Ozon API limit.

## 2. Evidence pinned for this audit

### Official Ozon Seller API OpenAPI supplied in the working conversation

- title: `Документация Ozon Seller API`
- OpenAPI: `3.0.0`
- version: `2.1`
- documented server: `//api-seller.ozon.ru`
- parsed paths: **458**
- file SHA-256: `9a786fee126e24f0fed63955117fa8a51bc316280bf9416df51d033a707ab416`

### Official Ozon Performance API OpenAPI supplied in the working conversation

- title: `Документация Ozon Performance API`
- OpenAPI: `3.0.0`
- version: `2.0`
- documented server: `https://api-performance.ozon.ru:443`
- parsed paths: **47**
- file SHA-256: `f7d93002b28859b9748beddabedd75f896630babad1f04c76219d0a97477a7b4`

### Production v0.1.5 source inspected

Exact v0.1.5 release source reconstructed from the immutable repository evidence:

- `shared/ozon_contract.js` SHA-256: `d85ff58d82c533e6ecd33db90885e38cb4814889cad9d0865cb41c35311c49b2`
- `shared/provider_transport_core.js` SHA-256: `76681b0de04f8781b4a5b7f2a37ad2cb2cfecf5503cc1ad3e296908463ba2ddb`
- `shared/ozon_credentials.js` SHA-256: `74ff17f27ad6bdfd9ede3a671400b3ddfe588ab0a73a6215e5cbc9acfc326b17`

Repository authority at audit start:

- branch: `work/ozon-data-collection-2026-08-11`
- HEAD: `875a828e006837c7fec4ac252f536ac92a6532fc`

## 3. Provider-owned Seller API constraints relevant to currently enabled aliases

### 3.1 Global Seller API request rate

The Seller API documentation states a general limit of **50 requests per second per Client ID**, with additional method-specific limits where documented.

This is provider-owned and must remain authoritative. The bridge must not invent hidden retry/backoff behavior; a provider 429 remains observable and a repeat request requires a separate explicit command.

### 3.2 `roles` → `POST /v1/roles`

- no JSON request body schema is documented;
- the bridge correctly requires empty `params` for this alias.

No page/data-size boundary is relevant to the request.

### 3.3 `stocks_current` → `POST /v4/product/info/stocks`

Official request boundary:

- `limit`: **1..1000** values per page;
- cursor-based continuation.

The method explicitly documents FBS/rFBS/FBP stock and directs FBO stock users to `/v1/analytics/stocks`. Therefore `stocks_current` is not an FBO-stock substitute.

The documented `filter.offer_id` and `filter.product_id` arrays do not carry an explicit `maxItems` in the supplied OpenAPI.

### 3.4 `analytics_data` → `POST /v1/analytics/data`

Official boundaries:

- without Premium Plus: data from the **last 3 months**;
- method use: **not more than once per minute**;
- response `limit`: **1..1000** rows;
- `metrics`: **up to 14**; more produces `InvalidArgument`;
- pagination uses `offset`;
- grouping/metric availability depends on subscription.

The request schema does **not** document a whole-body byte limit, a generic JSON-depth limit, a generic aggregate-key limit, or a generic array-length limit for `filters`/`sort`.

### 3.5 `product_queries` → `POST /v1/analytics/product-queries`

Official boundaries:

- `page >= 0`;
- `page_size <= 1000`;
- `skus <= 1000`;
- data for the last month can be requested in intervals except the current date because calculation takes 1–2 days;
- analytics earlier than one month ago require Premium/Premium Plus/Premium Pro and are available only by weeks, using `date_from`.

### 3.6 `product_queries_details` → `POST /v1/analytics/product-queries/details`

Official boundaries:

- `page >= 0`;
- `page_size <= 100`;
- `skus <= 1000`;
- `limit_by_sku <= 15`;
- history/subscription rules match the product-query family described above.

### 3.7 `posting_fbo_list` → `POST /v3/posting/fbo/list`

Official boundaries:

- requested period: **not more than one year**; otherwise `PERIOD_IS_TOO_LONG`;
- `limit`: **1..100**;
- `filter.order_numbers`: `maxItems = 1000`;
- `filter.posting_numbers`: `maxItems = 1000`;
- continuation is cursor-based.

These limits are the provider-owned pagination/history constraints for the current FBO collection.

### 3.8 `supply_order_get` → `POST /v3/supply-order/get`

Official boundary:

- `order_ids`: **maxItems = 50**.

### 3.9 `supply_order_details` → `POST /v1/supply-order/details`

Official request shape:

- one required `order_id` (`int64`).

No list/batch size exists for this request.

## 4. Provider-owned Performance API limits from the supplied OpenAPI

Performance API is not currently implemented by the Seller bridge, but its authoritative limits matter for the planned advertising/statistics track.

Global Performance limits:

- **100,000 requests per day**.

Statistics-export limits:

- maximum report period: **62 days**;
- maximum campaigns in one report: **10**;
- concurrent exports per account: **1**;
- exports per 24h per account: **2000**;
- concurrent exports per organization: **5**;
- exports per 24h per organization: **2000**;
- one campaign counts as one export, so a request containing multiple campaigns consumes multiple export units.

The supplied Performance OpenAPI does not document a global whole-request byte limit, global response-byte limit, or generic synchronous HTTP timeout for all methods.

## 5. Bridge-owned boundaries in production v0.1.5

### 5.1 Assistant/request JSON structural caps

`shared/ozon_contract.js`:

```js
function sanitizeJsonValue(
  value,
  path = "params",
  depth = 0,
  budget = { keys: 0 },
  {
    rejectTransportKeys = true,
    maxDepth = 10,
    maxItems = 5000,
    maxKeys = 2000
  } = {}
)
```

Current behavior:

- JSON depth greater than **10** → `PARAMS_TOO_DEEP`;
- any array longer than **5000** → `TOO_MANY_ITEMS`;
- aggregate object keys greater than **2000** → `TOO_MANY_KEYS`.

A second generic boundary is applied to serialized params:

```js
if (new TextEncoder().encode(encoded).byteLength > 200_000) {
  fail("PARAMS_TOO_LARGE", "params превышает 200000 UTF-8 bytes.");
}
```

Current bridge boundary:

- serialized `params` > **200,000 UTF-8 bytes** → rejection before provider request.

### 5.2 Provider-response redaction currently performs structural truncation

`redactSensitiveResult()` currently does all three:

- depth > **14** → replaces the subtree with `"[REDACTED_DEPTH]"`;
- arrays → `slice(0, 10000)`, silently discarding later elements;
- after **20,000 aggregate keys** → inserts `__truncated__` and stops traversal.

This is not merely privacy redaction. It can alter a valid provider result structurally and lose non-PII Seller data.

### 5.3 A second response structural budget is applied after redaction

`sanitizeResult()` applies:

- `maxDepth = 16`;
- `maxItems = 10000`;
- `maxKeys = 25000`.

Unlike the earlier silent truncation, exceeding these limits throws and prevents normal successful-result delivery.

### 5.4 Provider transport cap

`shared/provider_transport_core.js` and `shared/ozon_provider.js` use:

- response maximum: **1,500,000 bytes**;
- client-side timeout: **30,000 ms**.

If response bytes exceed the cap:

- the stream is cancelled;
- `RESPONSE_TOO_LARGE` is thrown.

If 30 seconds elapse:

- the bridge aborts its fetch;
- `REQUEST_TIMEOUT` is produced.

### 5.5 Credential-local caps

`shared/ozon_credentials.js` applies:

- `Client-Id` maximum length **256** characters;
- `Api-Key` maximum length **2048** characters;
- both must contain visible ASCII only.

The supplied Seller OpenAPI defines both headers only as required strings and does not publish these length/character-class limits.

CR/LF/header-injection protection is a genuine local security requirement, but the current numeric/string-class limits are bridge-owned rather than Ozon-contract-derived.

## 6. Contract search for whole-body size / global timeout

The two supplied OpenAPI documents were parsed as JSON and also searched for body-size/timeout vocabulary.

Seller API observations:

- no `Content-Length` contract was found for a global request/response body cap;
- no documented global `max request bytes`, `max response bytes`, or equivalent whole-body JSON byte boundary was found;
- the only `10 MB` body-size statement found is operation-specific for invoice-file upload and is unrelated to the enabled read-only Seller aliases;
- `REQUEST_TIMEOUT` wording found in the Seller OpenAPI belongs to push-notification callback behavior, not a general synchronous Seller API client timeout;
- HTTP-number text `413` is not documented as a general payload-too-large boundary in the supplied contract.

Performance API observations:

- no `byte`/`MB`/global body-size boundary was found in the supplied OpenAPI;
- `TIMEOUT` found in statistics schemas is a report-generation status, not a documented 30-second client fetch timeout.

**Important interpretation:** absence from the supplied OpenAPI is evidence that these bridge values are **not provider-authoritative documented limits**. It is **not** proof that Ozon infrastructure accepts infinite request or response sizes.

## 7. Boundary verdict matrix

| Bridge boundary | v0.1.5 value | Ozon authority found? | Risk | Verdict for next revision |
|---|---:|---|---|---|
| request JSON depth | 10 | No global equivalent | can reject future/current valid nested request shapes | replace generic provider-facing restriction with schema/operation validation; only retain a separately documented catastrophic parser safety guard if needed |
| request array length | 5000 | Ozon uses operation-specific limits (1000, 100, 50, etc.); some arrays have no documented max | generic rule is not authoritative | enforce provider limits per operation; generic limit must not be the semantic authority |
| request aggregate keys | 2000 | No global equivalent | can reject valid complex requests, especially arrays of filter objects | remove as provider-semantic validation; if retained as resource guard, make it explicitly non-provider and non-binding for supported schemas |
| request params bytes | 200,000 | No global equivalent in supplied contracts | valid Ozon request may be blocked locally | remove from contract semantics; any catastrophic transport guard must be separately justified and observable |
| result redaction depth | 14 | No | replaces valid non-PII data | **must not silently alter data**; privacy redaction must preserve structure |
| result array truncation | 10,000 | No | silent data loss | **remove silent truncation** |
| result key truncation | 20,000 | No | silent data loss | **remove silent truncation** |
| result validation depth | 16 | No | successful Ozon response can be turned into bridge failure | remove as provider-semantic limit; if runtime guard is necessary, fail explicitly without pretending result is complete |
| result array max | 10,000 | No generic equivalent | valid provider response can fail | same as above |
| result aggregate keys | 25,000 | No generic equivalent | valid provider response can fail | same as above |
| provider response bytes | 1.5 MB | No global Ozon limit in supplied OpenAPI | valid response can be rejected | redesign as explicit runtime resource safeguard, not Ozon contract; value must be justified/tested and must never silently truncate |
| provider timeout | 30 s | No global synchronous timeout in supplied OpenAPI | valid slow request can be aborted locally | redesign as explicit client/runtime policy; do not label as Ozon limit |
| Client-Id length | 256 | No published max in supplied OpenAPI | possible false credential rejection | retain header-injection safety, remove unsupported semantic length assumption unless separately proven |
| Api-Key length | 2048 | No published max in supplied OpenAPI | possible false credential rejection | same |
| operation alias length | 120 | internal protocol only | no Seller data loss for fixed allowlist | acceptable internal protocol guard |
| fixed host / fixed method / read allowlist | fixed | bridge security invariant | prevents prompt-controlled transport/mutation | **retain** |
| customer-PII blocking/redaction | strict | bridge privacy invariant | protects customer data | **retain** |
| one command ≤ one external request | fixed | bridge execution invariant | prevents hidden retry/fan-out | **retain** |
| no hidden pagination/retry/polling | fixed | bridge execution invariant | preserves explicit control | **retain** |

## 8. Important implementation distinction

The next revision must not simply delete every bound.

There are three different concepts that v0.1.5 currently mixes:

1. **Ozon semantic validation**  
   Example: FBO `limit <= 100`, `supply_order_get.order_ids <= 50`.

2. **security/privacy validation**  
   Example: reject assistant-supplied `url`, `headers`, `Api-Key`; redact customer PII.

3. **runtime resource safety**  
   Example: protection against a pathological multi-gigabyte response or an indefinitely hanging network call.

The defect is that v0.1.5 lets category 3 values such as `1.5 MB`, `30 s`, `maxKeys=25000`, and truncating redaction act as if they were category 1 provider-contract limits.

The implementation correction should separate them explicitly.

## 9. Required implementation properties for the next revision

Before a new release is accepted:

1. Operation-specific Ozon request limits must be encoded from the official contract for every enabled alias.
2. Generic request validators must not reject a request that satisfies the supported Ozon operation schema solely because of arbitrary depth/key/byte budgets.
3. Privacy redaction must not silently remove non-sensitive array elements or object fields.
4. A successful provider response must never be reported as a complete successful result after silent truncation.
5. If a runtime resource guard fires, the result must be an explicit controlled `OZON_RESULT_V1` bridge error stating that the provider request was attempted and the bridge could not transport the full result.
6. No hidden automatic retry, hidden pagination, hidden fan-out, or hidden report polling may be introduced.
7. Fixed trusted hosts, credential isolation, READ-only operation classification, transport/auth injection rejection, PII safeguards, conversation binding, exactly-once request ownership, and durable result delivery remain mandatory.
8. Performance API must remain a separate provider/auth surface until its credentials, host, operation allowlist, response policy, report lifecycle and limits are implemented and tested explicitly.
9. All behavior-changing lines and dependent paths must be exercised by tests under the same changed-line standard established after v0.1.5.

## 10. Acceptance state of this audit

**Boundary research checkpoint: COMPLETE for the currently enabled Seller aliases and the global Performance statistics limits present in the two supplied official OpenAPI contracts.**

The following conclusions are established:

- the provider-owned limits listed in sections 3 and 4 are authoritative for this work;
- the v0.1.5 generic values `10 / 5000 / 2000 / 200000 bytes / 14 / 10000 / 20000 / 16 / 10000 / 25000 / 1.5 MB / 30 s / credential 256/2048` are bridge-owned limits, not documented global Ozon limits in the supplied contracts;
- the response redaction path has a data-integrity defect because it can silently truncate valid non-sensitive provider data;
- production code has **not** been changed by this audit.

Next gate: design and implement the boundary correction as a new bridge revision, with explicit operation-specific Ozon validation, non-lossy PII redaction, explicit runtime-safety errors, and exhaustive regression/changed-line tests.
