# Patch B1 — Assortment Master exact-contract closure

Date: 2026-08-25
Status: CONTRACT_RESEARCH_REQUIRED — production implementation is not yet authorized.

Branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`

## Accepted base authority

B1 starts only from the accepted B0 Full Read Core authority:

- B0 acceptance commit: `3795359959c965fc5cd1837b9a1c978493ae2ac5`
- accepted B0 tester result commit: `cc6413d25dd794a12fd61b71728aaac9702bc6de`
- exact accepted B0 production file count: `21`
- exact accepted B0 production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

B1 must preserve all B0/A.5 protected behavior unless a later separately accepted patch explicitly changes it. In particular B1 must not change Autorun semantics, Work-session lifecycle, provider quota/timers/cache/history/no-replay behavior, credentials, transport ownership, personal-data default policy, or metadata-refresh safety.

## Why this is B1

The existing repository authority `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` places `P0_assortment_master` first in implementation priority. `OZON_03A3_COMPLETENESS_V1.json` also marks `catalog_product_master` as a blocking surface and names the direct core chain:

- `/v3/product/list`
- `/v3/product/info/list`
- `/v4/product/info/attributes`

The older research queue intentionally leaves full contracts incomplete. Therefore B1 may not enable these operations merely from remembered or partial field knowledge.

## B1 core contract targets

This contract-closure gate covers exactly these three current Product Master core methods first:

1. `/v3/product/list`
2. `/v3/product/info/list`
3. `/v4/product/info/attributes`

Related Product Master companion reads remain in the B1 family but are not enabled by this first closure gate:

- `/v2/product/pictures/info`
- `/v4/product/info/limit`
- `/v1/description-category/tree`
- `/v1/description-category/attribute`
- `/v1/description-category/attribute/values`
- explicit generated-report fallback `/v1/report/products/create`

The report fallback remains explicit-only. No hidden report creation, polling, fanout, or retrieval is permitted.

## Sole live contract authority for this gate

Use the fixed Ozon-owned Seller API Swagger source only:

`https://docs.ozon.ru/api/seller/swagger.json`

Third-party API descriptions, SDKs, mirrors, blogs, examples, forum posts and model memory are not implementation authority.

If the fixed official Swagger cannot be retrieved and validated, the result is `B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`. Do not infer missing contract details.

## Required evidence per target path

For every target path, capture from the same validated official Swagger snapshot:

- exact path and every HTTP operation actually present on that path;
- operationId, summary/description and deprecation flag if present;
- security/auth declaration if present;
- complete request body schema needed to construct a legal request;
- all required fields;
- enum values, formats and numeric/string/array bounds that constrain accepted requests;
- exact pagination/cursor/last-id/limit fields and response continuation fields, if present;
- response schema for successful responses, including the identifiers/fields required for Product Master joins;
- referenced component schemas recursively enough that request normalization and safe result traversal can be implemented without guessing;
- documented error responses where present;
- any subscription/account restrictions present in the Swagger descriptions/schemas;
- any deprecation/replacement wording present in the Swagger.

Do not claim rate/quota semantics unless they are actually present in the retrieved Ozon-owned artifact. If absent, record `NOT_PRESENT_IN_SWAGGER` rather than inventing them.

## Known historical facts that must be revalidated, not assumed

The repository's prior Ozon-owned research recorded these fragments, but they are not substitutes for the current snapshot:

- `/v3/product/list`: `filter.skus`, `result.items[].sku`, visibility filtering;
- `/v3/product/info/list`: `items.showcases_visibility`, `items.is_kgt`; legacy `items.images360` was removed;
- `/v4/product/info/attributes`: visibility filtering;
- `sku` was a confirmed cross-method join between product list and product info list.

The fresh evidence must say whether these remain true and must record the current exact surrounding schemas.

## Snapshot validation

Before extracting contracts, the researcher must verify that the downloaded JSON is plausibly the Seller API Swagger, including at minimum:

- JSON parses successfully;
- OpenAPI/Swagger document marker exists;
- document exposes a non-trivial `paths` object;
- target paths are checked explicitly;
- Seller API server/host information, when present, is compatible with `api-seller.ozon.ru`;
- snapshot byte SHA-256 is recorded;
- retrieval timestamp is recorded in UTC;
- no redirects or alternate host are silently accepted as authority without recording the final URL.

The raw full Swagger must NOT be committed unless explicitly required later. Commit only bounded evidence needed to reproduce the three contracts plus snapshot metadata/hash.

## Safety / execution boundary

This is RESEARCH ONLY.

- Real Ozon Seller business requests: `0`.
- Real Performance requests: `0`.
- Do not use seller credentials.
- Do not modify production extension code.
- Do not modify B0 transport chunks or accepted SHA authorities.
- Do not author a B1 production patch.
- Do not alter Autorun or Work-session behavior.

## Required research result

Write only:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_RESEARCH_RESULT_2026-08-25.md`

The result must include, for each of the three paths, enough exact Swagger-derived contract detail for a separate implementation pass to write strict request normalization, fixed provider routing, guidance metadata and deterministic tests without guessing.

Final research decision must be exactly one of:

- `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`
- `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_INCOMPLETE`
- `B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`

Only `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED` authorizes the subsequent B1 production implementation step.
