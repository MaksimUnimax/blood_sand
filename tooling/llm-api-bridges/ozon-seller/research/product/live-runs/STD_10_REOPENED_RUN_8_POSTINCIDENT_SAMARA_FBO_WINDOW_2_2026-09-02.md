# STD-10 REOPENED Run 8 — post-incident Samara FBO postings window 2

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident date: 2026-08-22, Chapayevsk, Samara region.

## Purpose

Continue the reopened stock-damage reconstruction by measuring ordinary outbound FBO order flow attributable to the incident warehouse after the incident date.

This window covers local Samara calendar days 2026-08-26 through 2026-08-29 (UTC+4):
- since `2026-08-25T20:00:00Z`;
- to `2026-08-29T19:59:59Z`.

## Bridge run

Operation: `posting_fbo_list`
Request id: `75376a88-4a3b-4f78-b764-e627bf331013`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1493 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`
Provider terminal state: `has_next=false`, `cursor=""`.

Request included `analytics_data=true`, allowing each posting to be attributed to its source Ozon warehouse.

## Target warehouse scan

The terminal result contains many postings attributed to Ozon warehouses such as `ХАБАРОВСК_2_РФЦ`, `РОСТОВ_НА_ДОНУ_2_РФЦ`, `ПУШКИНО_1_РФЦ`, `НЕВИННОМЫССК_РФЦ`, `ЕКАТЕРИНБУРГ_РФЦ_НОВЫЙ`, `ВОРОНЕЖ_2_РФЦ`, `ВАТУТИНКИ_РФЦ`, `КРАСНОЯРСК_СТАРЦЕВО_РФЦ`, `САНКТ-ПЕТЕРБУРГ_РФЦ` and others.

There are **zero postings** with either:
- `analytics_data.warehouse_id = 23128509046000`, or
- `analytics_data.warehouse_name = САМАРА_РФЦ`.

Therefore the complete accessible FBO posting set for local Samara days 2026-08-26..2026-08-29 contains no ordinary outbound FBO order flow from the incident warehouse.

Supported statement:

`NO_SAMARA_FBO_POSTINGS_IN_LOCAL_2026_08_26_TO_2026_08_29_WINDOW`.

## Combined post-incident outbound evidence so far

Run 7 proved zero Samara FBO postings for local 2026-08-22..2026-08-25.
Run 8 proves zero Samara FBO postings for local 2026-08-26..2026-08-29.

Combined, local 2026-08-22 through 2026-08-29 now has **zero ordinary FBO postings from `САМАРА_РФЦ`** in two terminal provider windows.

Current Samara zero stock is therefore not explained, for these eight local calendar days, by:
- ordinary FBO postings/sales from Samara;
- formal FBO removals/utilization (Run 6/6B found none from Samara for the full 2026-08-22..09-02 window);
- finance transactions classified as `compensation` (Run 5 returned zero rows).

This still does not prove destruction. The final local post-incident window, returns/supply/other movements, and especially the pre-incident Samara stock baseline remain to be reconciled.

## Next step

Close the post-incident posting scan with local Samara days 2026-08-30..2026-09-02:
- since `2026-08-29T20:00:00Z`;
- to `2026-09-02T19:59:59Z`;
- `analytics_data=true`;
- limit `100`;
- if provider returns `has_next=true`, continue explicitly before interpreting the window.

Checkpoint:
`STD_10_REOPENED_RUN8_SAMARA_POSTINGS_LOCAL_22_TO_29_ZERO_FINAL_WINDOW_30_TO_SEP2_NEXT`
