# Patch B1 — Assortment Master contract research retest via real Chrome

Date: 2026-08-25
Status: RETEST_REQUIRED — previous result was environment-only.

Branch: `feature/ozon-b1-assortment-master-contracts-2026-08-25`

## Previous research result

Previous result commit:

`7552ee9722e5bac1e6cd5e72b31b23c44d38cbde`

Previous researched HEAD:

`5e0915e52e6592b308e367330bf43c4b6b8d994c`

Previous final decision:

`B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`

The previous run did not retrieve Swagger bytes. Node/Undici failed on the fixed official URL with `redirect count exceeded`. No target contract assertion was made, no Seller/Performance business request was made, and no production file was modified.

This is not a B1 product rejection.

## Root cause classification

The fixed Ozon-owned URL remains the sole authority:

`https://docs.ozon.ru/api/seller/swagger.json`

The failure is in non-browser retrieval through the documentation site's anti-bot/redirect layer. Therefore this retest changes only the acquisition mechanism, not the contract authority.

No mirror, SDK, third-party OpenAPI file, blog, forum, model memory, or cached external schema may become implementation authority.

## Updated extractor

`extract_b1_assortment_swagger_evidence.mjs` now supports two modes:

1. legacy direct Node fetch;
2. browser-acquired exact bytes with a separate acquisition-proof JSON.

For this retest use browser acquisition first.

Syntax:

```text
node tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs <temporary-evidence.md> --input <browser-swagger.json> --proof <browser-proof.json>
```

The extractor still validates and hashes the actual Swagger bytes itself.

## Browser acquisition authority

Use a real Chrome browser / the tester's existing persistent Chrome environment, not Node `fetch`, curl, wget, a third-party proxy, or a mirror.

Navigate to the exact fixed source URL:

`https://docs.ozon.ru/api/seller/swagger.json`

If the docs site requires an anti-bot/browser challenge, allow the real browser to complete it. Do not use Seller credentials.

Preferred capture method is Chrome DevTools Protocol network response capture:

- enable Network domain before the navigation;
- identify the response whose requested resource is the exact fixed Swagger URL;
- require HTTP 200 for the final Swagger response;
- require final response URL host `docs.ozon.ru` and pathname `/api/seller/swagger.json`;
- save the raw response body bytes using CDP `Network.getResponseBody` when possible;
- if Chrome's ordinary browser download is used instead, save the downloaded file byte-for-byte and record that acquisition mode.

Do not use DOM text copied from a rendered JSON viewer if raw response/download bytes are available.

## Temporary browser proof file

Create a temporary JSON file OUTSIDE the repository result path with exactly these evidence fields:

```json
{
  "requested_url": "https://docs.ozon.ru/api/seller/swagger.json",
  "final_url": "https://docs.ozon.ru/api/seller/swagger.json",
  "status": 200,
  "retrieved_at_utc": "<ISO-8601 UTC timestamp>",
  "acquisition": "chrome_cdp_response_body"
}
```

Allowed `acquisition` values are exactly:

- `chrome_cdp_response_body`
- `chrome_browser_download`

The actual `final_url` must reflect what Chrome observed. The extractor rejects any final host/path outside the fixed Ozon-owned Swagger endpoint.

## Mandatory extractor gate

First:

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/extract_b1_assortment_swagger_evidence.mjs
```

Then run the browser-input extractor mode.

When browser acquisition is used, require:

`B1_SWAGGER_BROWSER_ACQUISITION_PROOF_PASS`

and all four original markers:

- `B1_SWAGGER_FETCH_PASS`
- `B1_SWAGGER_DOCUMENT_VALIDATION_PASS`
- `B1_ASSORTMENT_TARGET_PATHS_PRESENT_PASS`
- `B1_ASSORTMENT_REFERENCED_SCHEMA_CLOSURE_PASS`

Record exact byte length and SHA-256 from the extractor output/evidence.

## Target contracts

The target set is unchanged:

1. `/v3/product/list`
2. `/v3/product/info/list`
3. `/v4/product/info/attributes`

Once exact official bytes are validated, complete the same contract analysis and historical-claim re-check required by:

`PATCH_B1_ASSORTMENT_MASTER_CODEX_CONTRACT_RESEARCH_2026-08-25.md`

## Safety boundary

Research/validation only.

- Real Seller business requests: exactly `0`.
- Real Performance requests: exactly `0`.
- Seller credentials: not used.
- Production extension modifications: exactly `0`.
- B0 production authority/transport/materializers: unchanged.
- Autorun/Work-session/manual-delivery semantics: unchanged.

## Result handling

Update/replace the existing result file:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B1_ASSORTMENT_MASTER_CONTRACT_RESEARCH_RESULT_2026-08-25.md`

Record the exact researched HEAD before the result commit.

Commit only that result/evidence file.

Final decision remains exactly one of:

- `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_CONFIRMED`
- `PATCH_B1_ASSORTMENT_MASTER_CONTRACTS_INCOMPLETE`
- `B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY`

If real Chrome also cannot retrieve/validate the exact fixed Ozon-owned Swagger bytes, use `B1_CONTRACT_RESEARCH_NOT_EXECUTED_ENVIRONMENT_ONLY` and record the exact Chrome/network failure. Do not substitute another source.
