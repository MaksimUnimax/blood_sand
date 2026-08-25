# Patch B1 — Assortment Master contract research result

## Authority and execution

- Researched branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`
- Exact researched HEAD before this result commit: `5e0915e52e6592b308e367330bf43c4b6b8d994c`
- Production extension modifications by researcher: `0`
- Real Ozon Seller business requests: `0`
- Real Performance requests: `0`

## Extractor gate

The mandated syntax check passed:

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs
```

The exact mandated extractor was then run with a temporary evidence path outside the repository, against its fixed sole source:

```text
https://docs.ozon.ru/api/seller/swagger.json
```

It did not retrieve a Swagger document. Exact output:

```text
TypeError: fetch failed
cause: Error: redirect count exceeded
```

The error was raised by Node `v24.12.0`/Undici while following redirects from the fixed official URL. No alternate URL, mirror, cached schema, SDK, blog, model knowledge, Seller credential, or Seller business endpoint was used.

## Required extractor markers

- `B1_SWAGGER_FETCH_PASS`: NOT_EMITTED
- `B1_SWAGGER_DOCUMENT_VALIDATION_PASS`: NOT_EMITTED
- `B1_ASSORTMENT_TARGET_PATHS_PRESENT_PASS`: NOT_EMITTED
- `B1_ASSORTMENT_REFERENCED_SCHEMA_CLOSURE_PASS`: NOT_EMITTED

Swagger byte SHA-256: NOT_AVAILABLE

## Target contracts and historical claims

No official Swagger snapshot was retrieved or validated in this run. Therefore no contract detail, method, operationId, schema, component closure, error response, deprecation, subscription, pagination, or historical claim is asserted from any other source.

- `/v3/product/list`: NOT_DETERMINABLE
- `/v3/product/info/list`: NOT_DETERMINABLE
- `/v4/product/info/attributes`: NOT_DETERMINABLE
- unresolved refs: NOT_DETERMINABLE

Historical claim re-check:

1. `/v3/product/list` supports `filter.skus`: NOT_DETERMINABLE
2. `/v3/product/list` exposes `result.items[].sku`: NOT_DETERMINABLE
3. `/v3/product/list` supports visibility filtering: NOT_DETERMINABLE
4. `/v3/product/info/list` exposes `items[].showcases_visibility`: NOT_DETERMINABLE
5. `/v3/product/info/list` exposes `items[].is_kgt`: NOT_DETERMINABLE
6. `/v3/product/info/list` does not expose legacy `items[].images360`: NOT_DETERMINABLE
7. `/v4/product/info/attributes` supports visibility filtering: NOT_DETERMINABLE
8. `sku` remains a usable cross-method join: NOT_DETERMINABLE

Rate/quota semantics: NOT_PRESENT_IN_SWAGGER cannot be asserted because the Swagger itself was unavailable.

Final decision: `B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`
