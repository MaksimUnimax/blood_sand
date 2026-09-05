# STD-10 post-repair Run 1 — Ozon warehouse incident match

Date: 2026-09-05
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`

## Run 1A — empty params provider rejection

Operation: `ozon_warehouse_list`
Request id: `a377617f-a410-4f8c-95ae-8e549bfc64d8`
HTTP: `400`
External request executed: `true`
Logical business results: `1`
Physical business requests: `1`
Exact request preserved: `true`
Command transformed: `false`
Provider error code: `3`

The current Bridge contract accepts empty params, but the provider rejected the request. This is retained as a contract-drift signal and not treated as a transport/Bridge failure.

## Run 1B — explicit FULL_FILLMENT filter PASS

Command:

```json
{"operation":"ozon_warehouse_list","params":{"warehouse_types":["FULL_FILLMENT"]}}
```

Request id: `27847b28-0499-4192-a1f4-ee858880ee74`
HTTP: `200`
External request executed: `true`
Logical business results: `1`
Physical business requests: `1`
Exact request preserved: `true`
Command transformed: `false`

## Exact Chapayevsk incident-site warehouse matches

Primary regular fulfillment warehouse:
- warehouse_id: `23128509046000`
- name: `САМАРА_РФЦ`
- address: `446114, Россия, Самарская обл, Чапаевск г, Индустриальная ул, зд. 3`
- timezone: `Europe/Samara`
- warehouse_type: `FULL_FILLMENT`
- is_active: `true`

Additional logical warehouse at the same physical site:
- warehouse_id: `1020001351192000`
- name: `САМАРА_РФЦ_ЮВЕЛИРНЫЙ`
- address: `446114, Россия, Самарская область, г. Чапаевск, ул. Индустриальная, зд. 3, Индустриальный парк Чапаевск`
- warehouse_type: `FULL_FILLMENT`
- is_active: `true`

Do not interpret `is_active=true` as proof that the physical facility is operating normally after the 2026-08-22 incident; this field may be registry/configuration state rather than live operability.

The next business step is a historical pre-incident FBO posting read for 2026-08-19..2026-08-21 with analytics data, then match postings to the Chapayevsk warehouse IDs/names.

Checkpoint:
`STD_10_POST_REPAIR_RUN1_PASS_EXACT_CHAPAYEVSK_MATCH_PREINCIDENT_FBO_NEXT`
