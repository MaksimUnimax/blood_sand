# Codex instruction — Patch B1 Assortment Master contract research

You are the independent RESEARCHER/TESTER for Ozon Bridge Patch B1 contract closure.

Repository: `MaksimUnimax/blood_sand`

Branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`

## Role boundary

RESEARCH / VALIDATION ONLY.

- Do NOT modify production extension code.
- Do NOT author a B1 production implementation.
- Do NOT modify B0 production authority, transport chunks, materializers or accepted SHA constants.
- Do NOT modify Autorun, Work-session, Manual delivery, credentials, provider quota/cache/history or transport behavior.
- Do NOT use real Seller credentials.
- Real Ozon Seller business requests must remain exactly `0`.
- Real Performance requests must remain exactly `0`.
- The only network request authorized for this task is retrieval of the fixed Ozon-owned Swagger document and ordinary GitHub access needed for this repository.

## Read first

1. `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_ACCEPTED_2026-08-25.md`
2. `tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_CLOSURE_2026-08-25.md`
3. `tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs`
4. historical queue: `tooling/llm-api-bridges/ozon-seller/OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json`
5. historical completeness authority: `tooling/llm-api-bridges/ozon-seller/OZON_03A3_COMPLETENESS_V1.json`

Historical files are context only. The current Swagger snapshot is the contract authority for this gate.

## Exact source

The extractor must request exactly:

`https://docs.ozon.ru/api/seller/swagger.json`

Do not substitute another URL, mirror, SDK, third-party schema, cached blog, forum post or model-generated contract.

## Mandatory execution

1. Fetch the branch and record the exact current HEAD before creating the result commit.
2. Verify the extractor parses:

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs
```

3. Use a temporary evidence path OUTSIDE the repository result path, for example:

```text
node tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs <temporary-evidence.md>
```

4. Require all four extractor markers:

```text
B1_SWAGGER_FETCH_PASS
B1_SWAGGER_DOCUMENT_VALIDATION_PASS
B1_ASSORTMENT_TARGET_PATHS_PRESENT_PASS
B1_ASSORTMENT_REFERENCED_SCHEMA_CLOSURE_PASS
```

5. Record the exact Swagger byte SHA-256 printed by the extractor.
6. Inspect the generated evidence for all three exact paths:

- `/v3/product/list`
- `/v3/product/info/list`
- `/v4/product/info/attributes`

## Contract confirmation rules

For each target path, report exactly what the current Swagger contains. Do not normalize away differences and do not fill gaps from historical research.

For every HTTP operation present, record:

- HTTP method;
- operationId;
- summary/description;
- deprecated flag if present;
- security declaration if present;
- request body / request parameters;
- required request fields;
- enums, formats and min/max bounds;
- pagination/continuation request fields and response fields if present;
- success response schema;
- Product Master identifiers and join-relevant fields visible in the response schema;
- all recursively referenced component schemas emitted by the extractor;
- unresolved local `$ref` values, if any;
- documented error responses;
- subscription/account restriction wording if present;
- deprecation/replacement wording if present.

If rate/quota behavior is absent from Swagger, write exactly `NOT_PRESENT_IN_SWAGGER` rather than guessing.

If history/date-window semantics are irrelevant or absent for a method, say so explicitly rather than inventing a limit.

## Specific historical claims to re-check

Report CURRENT_SWAGGER_PRESENT / CURRENT_SWAGGER_ABSENT / NOT_DETERMINABLE for each:

- `/v3/product/list` supports `filter.skus`;
- `/v3/product/list` response exposes `result.items[].sku`;
- `/v3/product/list` exposes visibility filtering;
- `/v3/product/info/list` exposes `items[].showcases_visibility`;
- `/v3/product/info/list` exposes `items[].is_kgt`;
- `/v3/product/info/list` does NOT expose legacy `items[].images360`;
- `/v4/product/info/attributes` exposes visibility filtering;
- `sku` remains a usable cross-method join between product list and product info list.

These checks are evidence reporting only. Do not change production based on them.

## Confirmation threshold

Final decision may be `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED` only if:

- fixed official Swagger retrieval succeeded;
- snapshot validation succeeded;
- all three paths exist;
- each target has an actual HTTP operation suitable for Seller read use;
- request construction can be implemented without inventing required fields;
- pagination/continuation can be implemented without guessing when the method is paginated;
- success response traversal can be implemented from the captured schema;
- all local refs needed for those contracts resolve, or any unresolved ref is proven irrelevant to legal request construction and required response traversal;
- no evidence indicates a target is deprecated/removed in favor of another path.

If the snapshot is retrieved but one or more target contracts are insufficient for strict implementation, use:

`PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_INCOMPLETE`

If the fixed official Swagger cannot be retrieved/validated in this environment, use:

`B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`

Do NOT use a product `REJECTED` classification for network/environment unavailability.

## Result file

Write only this repository evidence file:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_RESEARCH_RESULT_2026-08-25.md`

The result must contain:

1. exact tested/researched HEAD before the result commit;
2. extractor `node --check` result;
3. requested URL and final URL;
4. UTC retrieval timestamp;
5. Swagger byte size and SHA-256;
6. OpenAPI/Swagger version and total path count;
7. all four extractor markers;
8. a separate exact contract section for each of the three targets;
9. the eight historical-claim re-check results;
10. unresolved refs, if any;
11. explicit `NOT_PRESENT_IN_SWAGGER` operational gaps;
12. real Seller request count (`0` required);
13. real Performance request count (`0` required);
14. production modifications by researcher (`0` required);
15. final research decision.

You may copy the bounded generated evidence blocks into the result file. Do not commit the entire raw Swagger snapshot.

Commit ONLY the result/evidence file to this B1 branch.

## Return to the operator

Return:

1. result file path
2. result commit SHA
3. exact researched HEAD
4. Swagger SHA-256
5. all four extractor markers
6. HTTP method + operationId for each target
7. unresolved-ref summary
8. eight historical-claim re-check statuses
9. real Seller/Performance request counts
10. final research decision
