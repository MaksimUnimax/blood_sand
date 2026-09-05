# STD-09 post-repair — FBO + FBS sales by warehouse

Date: 2026-09-05
Business question: `Продажи за вчера по складам.`
Requested business day: `2026-09-04` UTC.

## Run 1 — FBO postings

- operation: `posting_fbo_list`
- request_id: `d9cce3f1-1a28-43c9-9048-8e6eb2e7a50c`
- HTTP: `200`
- external_request_executed: `true`
- exact_request_preserved: `true`
- command_transformed: `false`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- provider pagination: `has_next=false`, `cursor=""`

FBO result: `18` ordered units, each at `1700 RUB`, gross order amount `30600 RUB`.

FBO warehouse aggregation:
- `ВАТУТИНКИ_РФЦ`: 4 / 6800 RUB
- `ПУШКИНО_1_РФЦ`: 3 / 5100 RUB
- `РОСТОВ_НА_ДОНУ_2_РФЦ`: 3 / 5100 RUB
- `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ`: 2 / 3400 RUB
- `ХАБАРОВСК_2_РФЦ`: 1 / 1700 RUB
- `ЯРОСЛАВЛЬ_РФЦ`: 1 / 1700 RUB
- `ВОРОНЕЖ_2_РФЦ`: 1 / 1700 RUB
- `САНКТ-ПЕТЕРБУРГ_РФЦ`: 1 / 1700 RUB
- `КРАСНОЯРСК_СТАРЦЕВО_РФЦ`: 1 / 1700 RUB
- `НИЖНИЙ_НОВГОРОД_РФЦ`: 1 / 1700 RUB

## FBS privacy gate and correction note

The FBS read was initially blocked locally by `personal_data_setting_off`; those blocked attempts executed zero physical Ozon requests. After the operator enabled `Показывать личные данные`, one accidental command was issued for `2026-09-01`; it is explicitly excluded from STD-09 accounting and recorded separately in the repository.

## Correct FBS run — 2026-09-04

- operation: `fbs_posting_list`
- request_id: `59e027a1-f7ae-43c2-93e1-74e943d86550`
- fingerprint: `4651bd93`
- HTTP: `200`
- external_request_executed: `true`
- exact_request_preserved: `true`
- command_transformed: `false`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- entitlement: `SUPPORTED_AND_ENTITLED`
- provider pagination: `has_next=false`, `cursor=""`

Correct FBS result: `8` ordered units, each at `1700 RUB`, gross order amount `13600 RUB`.
All 8 postings were attributed to provider warehouse `Златоуст Чёт` / warehouse_id `1020001773680000`.

Products in the correct FBS result:
- `1640306007` — Молвинец — 1
- `1640251697` — Алатырь (Крест Сварога) — 1
- `2559437928` — Чур — 3
- `1720141903` — Водолей — 1
- `2559748332` — Герб России — 1
- `1602722942` — Вегвизир — 1

## Final STD-09 aggregation

Combined FBO + FBS:
- ordered units: `26`
- gross order amount: `44200 RUB`
- provider warehouse labels: `11`

Sorted by ordered units DESC:
1. `Златоуст Чёт` — 8 — 13600 RUB
2. `ВАТУТИНКИ_РФЦ` — 4 — 6800 RUB
3. `ПУШКИНО_1_РФЦ` — 3 — 5100 RUB
4. `РОСТОВ_НА_ДОНУ_2_РФЦ` — 3 — 5100 RUB
5. `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ` — 2 — 3400 RUB
6. `ХАБАРОВСК_2_РФЦ` — 1 — 1700 RUB
7. `ЯРОСЛАВЛЬ_РФЦ` — 1 — 1700 RUB
8. `ВОРОНЕЖ_2_РФЦ` — 1 — 1700 RUB
9. `САНКТ-ПЕТЕРБУРГ_РФЦ` — 1 — 1700 RUB
10. `КРАСНОЯРСК_СТАРЦЕВО_РФЦ` — 1 — 1700 RUB
11. `НИЖНИЙ_НОВГОРОД_РФЦ` — 1 — 1700 RUB

## Semantics

These figures are `ordered units` and gross order amount derived from posting product quantities and listed order prices for the requested order-created/in-process period. They are not settled finance, payout, or realized revenue after commissions/returns.

## Verdict

`STD_09_POST_REPAIR = PASS`

Checkpoint:
`STD_09_POST_REPAIR_PASS_NEXT_STD10_RUN1`
