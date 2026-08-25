# Patch B1 — operator capture of exact Assortment Master contracts

Date: 2026-08-25
Status: COMPLETED; original service-worker `fetch()` procedure RETIRED because it is invalid under Ozon's browser CORS policy.

## Important correction

The first version of this validation note instructed the operator to call:

`fetch("https://docs.ozon.ru/api/seller/swagger.json")`

from the Chrome extension service-worker DevTools console.

That procedure was wrong for the real environment. The operator reproduced the failure and provided direct evidence:

- origin: `chrome-extension://...`
- browser error: blocked by CORS policy
- `No 'Access-Control-Allow-Origin' header is present on the requested resource`
- resulting JavaScript error: `TypeError: Failed to fetch`

This was a validation-procedure defect, not an Ozon Seller API contract failure and not a production-extension failure.

The broken service-worker script MUST NOT be reused.

## Correct operator acquisition procedure

Use ordinary browser navigation/download, not extension-origin JavaScript.

1. In a normal Chrome tab open exactly:

   `https://docs.ozon.ru/api/seller/swagger.json`

2. If the browser renders the JSON, save the exact response with `Ctrl+S`.
3. If Chrome directly downloads `swagger.json`, use that downloaded file.
4. Do not edit, prettify, reserialize, or copy only selected sections before hashing/validation.
5. Attach the exact downloaded `swagger.json` to the development conversation.
6. If the URL does not yield JSON, record the visible error and current browser URL. Do not substitute a mirror, SDK, generated client, blog, or model reconstruction.

This procedure performs no Seller/Performance business request and requires no `Client-Id` or `Api-Key`.

## Completed evidence

The operator subsequently supplied the exact `swagger.json` artifact.

Validated identity:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- document title: `Документация Ozon Seller API`
- document version: `2.1`
- server: `//api-seller.ozon.ru`
- path count: `463`

Bounded target evidence is recorded in:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_OPERATOR_SWAGGER_EVIDENCE_2026-08-25.md`

The contract-research result is recorded in:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_RESEARCH_RESULT_2026-08-25.md`

Final contract gate:

`PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`

## Standing rule

If required contract evidence is missing, the value remains `UNKNOWN` / `NOT_DETERMINABLE` and implementation of the affected contract remains blocked. Do not replace unavailable evidence with guesses.
