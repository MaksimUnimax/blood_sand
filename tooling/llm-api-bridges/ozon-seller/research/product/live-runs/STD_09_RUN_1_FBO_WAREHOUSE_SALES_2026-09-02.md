# STD-09 Run 1 — FBO warehouse-attributed sales

Date: 2026-09-02
Business question: `Дай продажи за вчера по складам от большего к меньшему.`
Target business date: `2026-09-01`.

## Command/result

Operation: `posting_fbo_list`
Request ID: `fb6d46d7-e0ab-4dbd-92a9-2e1dfafd70f7`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1145 ms`
Physical business requests: `1`
`external_request_executed=true`
`has_next=false`, `cursor=""`
Bridge `pagination=null` but provider result itself exposes terminal `has_next=false`.
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`.
Command transformed: `false`.

The request used the full UTC date window `2026-09-01T00:00:00Z..2026-09-01T23:59:59Z` and `with.analytics_data=true`.

## FBO result

The provider returned 12 FBO postings created inside the requested day.

- 11 non-cancelled postings;
- 1 cancelled posting (`Колядник`, warehouse `НЕВИННОМЫССК_РФЦ`, buyer cancellation);
- every returned posting contained one product unit priced at `1,700 RUB`.

Thus the non-cancelled FBO order-side total for this read is:

- `11 units`;
- `18,700 RUB` gross product amount (`11 × 1,700`).

### Warehouse attribution from non-cancelled FBO postings

| warehouse | units | gross product amount |
|---|---:|---:|
| `СПБ_ШУШАРЫ_РФЦ` | 2 | 3,400 RUB |
| `НОВОСИБИРСК_3_РФЦ` | 1 | 1,700 RUB |
| `КРАСНОЯРСК_СТАРЦЕВО_РФЦ` | 1 | 1,700 RUB |
| `РОСТОВ-НА-ДОНУ_РФЦ` | 1 | 1,700 RUB |
| `САНКТ-ПЕТЕРБУРГ_РФЦ` | 1 | 1,700 RUB |
| `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ` | 1 | 1,700 RUB |
| `ВАТУТИНКИ_РФЦ` | 1 | 1,700 RUB |
| `ПУШКИНО_1_РФЦ` | 1 | 1,700 RUB |
| `НИЖНИЙ_НОВГОРОД_2_РФЦ` | 1 | 1,700 RUB |
| `ХОРУГВИНО_РФЦ` | 1 | 1,700 RUB |

The cancelled `НЕВИННОМЫССК_РФЦ` posting is excluded from business sales totals.

## Reconciliation against STD-01

STD-01's seller-level analytics for the same business date returned:

- `16 ordered units`;
- `27,200 RUB revenue`.

Run1 FBO covers only:

- `11/16 units`;
- `18,700/27,200 RUB`.

Residual not explained by this FBO read:

- `5 units`;
- `8,500 RUB`.

Because `5 × 1,700 = 8,500`, this is highly consistent with five same-price orders in another fulfillment surface, most plausibly FBS, but this is **not yet treated as proven** until the FBS surface is read.

## Product/capability finding

Standard Seller API can provide warehouse attribution for FBO order postings via `analytics_data.warehouse_id/warehouse_name`; therefore a warehouse-sales answer does not require inventing a nonexistent `analytics_data` warehouse dimension.

However, a whole-cabinet warehouse-sales answer requires cross-fulfillment orchestration. FBO alone is materially incomplete for this account/date.

## Privacy boundary for next step

Current Bridge registry marks `fbs_posting_list` as:

- `PERSONAL_DATA_READ_GATED`;
- `privacy_policy=operator_personal_data_gate`;
- `default_allowed=false`.

The business task needs no customer PII. The next explicit call should request only the minimum useful analytics fields. If the Bridge still blocks pending operator authorization, record that as the intended privacy boundary; do not bypass it.

Run classification:
`PASS_FBO_PARTIAL_WAREHOUSE_ATTRIBUTION_WHOLE_CABINET_REQUIRES_FBS_CORRELATION`

STD-09 remains active under `NO_SKIP_ON_FAILURE`.
