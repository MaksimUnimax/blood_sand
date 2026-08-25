# Patch B1 — Assortment Master contract research result: persistent-Chrome retest

## Authority and execution

- Researched branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`
- Exact researched HEAD before this result commit: `edce9f9437e282dfd26c679a2274f7a0617b98bd`
- Previous research result: `7552ee9722e5bac1e6cd5e72b31b23c44d38cbde`.
- Production extension modifications by researcher: `0`.
- Real Ozon Seller business requests: `0`.
- Real Performance requests: `0`.

## Extractor gate

The mandated extractor syntax check passed:

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs
```

The prior Node/Undici acquisition failure is superseded for this retest by the authority to use the real persistent Chrome environment. The required Chrome browser binding was requested through the supported browser control surface. Exact result:

```text
Browser is not available: chrome
```

The task explicitly requires real persistent Chrome and forbids substituting another browser or another Swagger source. Therefore no browser navigation, CDP Network event, download, response body, proof JSON, Swagger file, or contract extraction was possible.

The fixed sole source remains:

```text
https://docs.ozon.ru/api/seller/swagger.json
```

No alternate URL, mirror, cached schema, SDK, blog, model knowledge, Seller credential, or Seller business endpoint was used.

## Required extractor markers

- `B1_SWAGGER_FETCH_PASS`: NOT_EMITTED
- `B1_SWAGGER_DOCUMENT_VALIDATION_PASS`: NOT_EMITTED
- `B1_ASSORTMENT_TARGET_PATHS_PRESENT_PASS`: NOT_EMITTED
- `B1_ASSORTMENT_REFERENCED_SCHEMA_CLOSURE_PASS`: NOT_EMITTED

Swagger byte SHA-256: NOT_AVAILABLE

Browser acquisition mode: NOT_AVAILABLE

Requested URL: `https://docs.ozon.ru/api/seller/swagger.json`

Final URL: NOT_AVAILABLE

HTTP status: NOT_AVAILABLE

`B1_SWAGGER_BROWSER_ACQUISITION_PROOF_PASS`: NOT_EMITTED

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
