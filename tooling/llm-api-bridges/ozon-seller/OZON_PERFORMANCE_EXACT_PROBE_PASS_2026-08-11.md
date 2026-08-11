# Ozon Performance API — exact probe pass — 2026-08-11

Status: **discovery-only / no implementation promotion**

Purpose: record exact strings tested against Ozon-owned/indexed sources after the canonical Performance documentation root remained inaccessible in the current research runtime.

## Primary Ozon-owned evidence confirmed

1. The verified `@OzonSellerAPI` notification channel links to the official Seller API documentation and is used here as an Ozon-owned/currentness source.
2. A June 2026 Ozon API TLS/root-CA migration notice explicitly states that the change is relevant to integrations including **Seller API, Performance API and other public Ozon APIs**.
3. The linked Ozon for dev article is `https://dev.ozon.ru/news/775-Izmeneniia-v-Ozon-API-migratsiia-kornevogo-sertifikata-UTs-Ozon/`, but the current research runtime reaches a redirect loop when fetching it.
4. The canonical Performance documentation root `https://docs.ozon.ru/api/performance/` also reaches a redirect loop in the current runtime.

What this proves: Performance API remains a live public Ozon API contour in 2026.

What this does **not** prove: exact Performance host, authentication contract, method paths, HTTP verbs, request/response schemas, quotas, history windows or current deprecation state of individual methods.

## Exact probes tested against Ozon-owned search/index surfaces

The following discovery strings were searched directly against Ozon-owned domains and did not return an Ozon-owned method contract:

- `api-performance.ozon.ru`
- `/api/client/campaign`
- `/api/client/campaign/{campaignId}/v2/products`
- `/api/client/statistics/list`
- `/api/client/statistics/externallist`
- `/api/client/statistics/{UUID}`
- `/api/client/statistics/report`
- `/api/client/statistics/campaign/product`
- Bearer/auth combinations around those paths

Result: **no promotion to read allowlist**.

## Discovery-only mirrors/community evidence

Third-party documentation mirrors expose candidate Performance strings, including campaign and statistics families. Ozon for dev community also contains user-authored historical requests under `/api/client/campaign/...`.

These are useful only as exact search probes. They are not sufficient authority because current Ozon-owned method documentation or an Ozon-staff confirmation was not recovered for the exact read contracts.

Do not infer current paths, verbs, schemas or authentication from those mirrors/posts.

## Product Master side probe

A parallel exact search attempted to confirm current `/v4/product/info/attributes` output fields such as barcode/name/dimensions/weight/category/type from Ozon-owned indexed sources.

Ozon's verified notification channel confirms `/v4/product/info/attributes` as a current method family in 2026, but the indexed Ozon-owned material recovered in this pass did **not** expose the complete current response schema. Third-party mirrors showing those fields therefore remain discovery-only and do not close Product Master field gaps.

## Gate consequence

- `advertising_performance_api`: remains blocking and contract-pending.
- `catalog_product_master`: remains full-contract/schema-pending for unproven master fields.
- `extension_development_allowed`: must remain `false`.
- No Ozon runtime/extension code may be started from this evidence.

## Next primary-source routes

1. Recover readable Ozon-owned Performance method documentation or official exported/OpenAPI contract.
2. Search Ozon for dev advertising-platform community specifically for Ozon-staff answers confirming exact read methods.
3. Re-run exact candidate strings against Ozon-owned sources immediately before any gate promotion.
4. Keep all third-party Performance strings quarantined in discovery artifacts until independently confirmed.
