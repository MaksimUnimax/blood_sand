# STD-10 REOPENED Run 9 — post-incident Samara FBO postings window 3

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident date: 2026-08-22, Chapayevsk, Samara region.

## Purpose

Close the ordinary post-incident FBO outbound scan for the affected warehouse.

This window covers local Samara calendar days 2026-08-30 through 2026-09-02 (UTC+4):
- since `2026-08-29T20:00:00Z`;
- to `2026-09-02T19:59:59Z`.

## Bridge run

Operation: `posting_fbo_list`
Request id: `85bc3557-fcdb-418c-94b8-26a80113213a`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1649 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`
Provider terminal state: `has_next=false`, `cursor=""`.

Request included `analytics_data=true`, allowing each posting to be attributed to its source Ozon warehouse.

## Target warehouse scan

The terminal result contains many FBO postings attributed to warehouses including `СПБ_ШУШАРЫ_РФЦ`, `АДЫГЕЙСК_РФЦ`, `ВОРОНЕЖ_2_РФЦ`, `ХАБАРОВСК_2_РФЦ`, `ХОРУГВИНО_РФЦ`, `ВАТУТИНКИ_РФЦ`, `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ`, `РОСТОВ-НА-ДОНУ_РФЦ`, `ПУШКИНО_1_РФЦ`, `КАЗАНЬ_РФЦ_НОВЫЙ`, `НЕВИННОМЫССК_РФЦ`, `САРАТОВ_РФЦ`, `КРАСНОЯРСК_СТАРЦЕВО_РФЦ` and others.

There are **zero postings** with either:
- `analytics_data.warehouse_id = 23128509046000`, or
- `analytics_data.warehouse_name = САМАРА_РФЦ`.

Supported statement:

`NO_SAMARA_FBO_POSTINGS_IN_LOCAL_2026_08_30_TO_2026_09_02_WINDOW`.

## Full post-incident outbound conclusion

Run 7 proved zero Samara FBO postings for local 2026-08-22..2026-08-25.
Run 8 proved zero Samara FBO postings for local 2026-08-26..2026-08-29.
Run 9 proves zero Samara FBO postings for local 2026-08-30..2026-09-02.

Therefore the entire investigated local period 2026-08-22 through 2026-09-02 has **zero ordinary FBO postings from `САМАРА_РФЦ`** across three terminal provider windows.

This removes ordinary FBO outbound/sales as an explanation for current Samara zero stock during the investigated period.

Together with prior reopened evidence:
- Run 5: no finance transactions classified as `compensation` in 2026-08-22..09-02;
- Run 6/6B: no formal `removal_from_stock_list` rows from Samara in 2026-08-22..09-02;
- Runs 7–9: no ordinary FBO postings from Samara in local 2026-08-22..09-02;
- current focused stock reads: sampled historically exposed SKUs are now explicitly `present=0,reserved=0` at Samara.

The current zero therefore remains unexplained by these ordinary post-incident outflow surfaces.

## What remains load-bearing

This evidence still does **not** prove destruction or quantify loss because the left side of the stock balance is missing:
- exact per-SKU stock physically/accountedly present at Samara immediately before the incident;
- any post-incident inbound/returns/transfers or other inventory adjustments not represented in the tested outbound/removal surfaces;
- any write-off/accounting evidence represented outside `transaction_type=compensation`.

The highest-value next step is to attack the historical baseline directly.

Current Bridge stock operations are current-only. The next registered historical-source discovery surface is `report_list`, which lists already formed reports. Search existing reports for placement/storage/stock reports covering the incident period; if a relevant report exists, follow with `report_info` and inspect all metadata the Bridge exposes. If no usable historical report exists, record the missing historical-placement report creation/download surface as the decisive Bridge coverage gap rather than inventing a pre-incident stock number.

Checkpoint:
`STD_10_REOPENED_RUN9_FULL_POSTINCIDENT_SAMARA_FBO_OUTBOUND_ZERO_HISTORICAL_REPORT_DISCOVERY_NEXT`
