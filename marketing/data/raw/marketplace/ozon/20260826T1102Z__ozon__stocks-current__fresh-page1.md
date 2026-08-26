# Fresh Ozon stocks_current — page 1

Observed: 2026-08-26T11:02Z  
Bridge: ozon-llm-api-bridge v0.1.19

## Command

```text
OZON_API_V1
{"operation":"stocks_current","params":{"filter":{},"limit":1000}}
```

## Direct result metadata

- request_id: `7c5e5bc9-4208-44e4-8651-296eb4ce6a7f`
- operation: `stocks_current`
- fingerprint: `cf136cbd`
- provider: `ozon`
- host_alias: `seller_api`
- http_method: `POST`
- path_alias: `stocks_current`
- external_request_executed: `true`
- http_status: `200`
- elapsed_ms: `362`
- physical_business_request_count: `1`
- capability_probe: `not_needed`
- entitlement: `SUPPORTED_AND_ENTITLED`
- returned items: `76`
- provider `total`: `76`
- provider `cursor`: `WzIzMjQ0Njc4NTUsMjMyNDQ2Nzg1NV0=`

## Evidence status

The supplied page contains the same 76 `product_id` / `sku` identities as the canonical historical 2026-08-12 76-item baseline on direct comparison. This does **not** yet prove terminal completeness because the provider returned a non-empty cursor.

Fresh snapshot completion status: `NON_TERMINAL_CONTINUATION_REQUIRED`.

Priority current stock observations from the supplied response:

| product_id | sku | offer | FBO present | FBS present |
|---:|---:|---|---:|---:|
| 1119965443 | 1636048691 | Печать Велеса | 220 | 50 |
| 1119957837 | 1636041142 | Велес | 23 | 41 |
| 1124658338 | 1640251697 | Алатырь (Крест Сварога) | 5 | 37 |
| 1082862005 | 1602722942 | Вегвизир - Рунический компас | 19 | 35 |
| 1082855228 | 1602717077 | Шлем ужаса - Эгисхьяльм | 7 | 50 |
| 2324003802 | 2559437928 | Чур | 7 | 41 |

The complete 76-row fresh normalization is intentionally deferred until the explicit continuation proves the terminal page, so a non-terminal provider page is not mislabeled as a complete snapshot.
