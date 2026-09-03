# NEW-15 setup Run2 — fbs_act_list with date filter

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Purpose

Resolve a real provider FBS act id for NEW-15 `posting_fbs_act_container_labels` after the exact active runtime template `{limit:50}` returned provider HTTP400/code3.

## Submitted command

`OZON_API_V1 {"operation":"fbs_act_list","params":{"filter":{"date_from":"2026-08-01T00:00:00Z","date_to":"2026-08-31T23:59:59Z"},"limit":50}}`

## Result

- request id: `b886712a-3882-4050-ae0b-f930740cb7e4`
- HTTP: `400`
- provider code: `3`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `e77fcc54`
- physical fingerprint: `e77fcc54`
- command transformed: `false`

## Judgment

`SETUP_PROVIDER_400_NEEDS_CONTRACT_REFINEMENT`.

This materially different request proves that merely adding the runtime-accepted `filter.date_from/date_to` block is not sufficient. Therefore the provisional DEFECT-006 wording `FBS_ACT_LIST_TEMPLATE_OMITS_PROVIDER_REQUIRED_FILTER` is too narrow and must be refined against the exact captured Swagger/request schema before another provider command is issued.

Do not patch runtime during collection. Do not automatically repeat either failed 400 request.
