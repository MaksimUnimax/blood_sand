# NEW-14 Run1 — cargoes_label_create provider 429

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Input provenance

The command used real provider data resolved through explicit safe reads:
- `order_id=125820894` from NEW-14 setup `supply_order_list` HTTP200;
- `supply_id=2000064871008` from NEW-14 setup `supply_order_get` HTTP200.

Submitted standalone NEW-14 command:
`OZON_API_V1 {"operation":"cargoes_label_create","params":{"supply_id":2000064871008}}`

## Result

- request id: `b09f1156-6ada-42b7-9cef-8cface858ec1`
- HTTP: `429`
- provider code: `8`
- provider category: `rate_limit`
- Retry-After: `1`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- entitlement key: `POST /v1/cargoes-label/create`
- exact request preserved: `true`
- logical fingerprint: `151c4db3`
- physical fingerprint: `151c4db3`
- command transformed: `false`

## Judgment

`COLLECTION_COMPLETE_PROVIDER_RATE_LIMIT_FAIL` for the standalone NEW-14 attempt.

No new bridge defect is established by this result. The bridge executed exactly one physical business request and correctly did not automatically retry after provider HTTP429.

Per the live-run rule, do not automatically repeat the same business request after HTTP429. Because no provider operation/status identifier or label reference was returned, the asynchronous downstream status/document chain cannot continue from this attempt.

DEFECT-005 remains independently confirmed by the earlier `supply_order_list` empty-states A/B and is not caused by this 429.

## Next action

Persist this result in the live gate/recovery checkpoint, then advance to NEW-15 setup. NEW-15 `posting_fbs_act_container_labels` requires a real provider `id`; obtain it through safe provider reads and never invent an identifier. Do not patch runtime during collection.
