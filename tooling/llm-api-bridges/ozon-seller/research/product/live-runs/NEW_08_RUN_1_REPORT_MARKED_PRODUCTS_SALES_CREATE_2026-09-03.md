# NEW-08 Run1 — report_marked_products_sales_create

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

`report_marked_products_sales_create` with completed date interval `2026-09-01..2026-09-02`.

## Result

PASS.

- request id: `f32ff016-3582-4302-903f-af02f3afd699`
- provider HTTP: `200`
- elapsed: `1516 ms`
- logical business result count: `1`
- physical business request count: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/report/marked-products-sales/create`
- exact request preserved: `true`
- logical fingerprint: `0630aa10`
- physical fingerprint: `0630aa10`
- command transformed: `false`
- report code: `REPORT_marked_products_sales_2093109_1788408823_01a06578-fdec-762d-869c-fe3b626796cc`

## Defect assessment

No new defect.

NEW-08 is another clean repaired create path and therefore further narrows DEFECT-002. Clean create counterexamples now include NEW-04, NEW-05, NEW-06, NEW-07 and NEW-08.

Do not patch during collection.

## RAW

`live-runs/repaired-26/raw/NEW_08_RUN_1_REPORT_MARKED_PRODUCTS_SALES_CREATE_RAW_2026-09-03.json`
