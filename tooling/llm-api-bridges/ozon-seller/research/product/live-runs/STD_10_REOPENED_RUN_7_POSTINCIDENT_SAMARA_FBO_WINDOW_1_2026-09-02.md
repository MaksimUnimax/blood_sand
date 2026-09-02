# STD-10 REOPENED Run 7 — post-incident Samara FBO postings window 1

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident date: 2026-08-22, Chapayevsk, Samara region.

## Purpose

Continue the reopened stock-damage reconstruction by measuring ordinary outbound FBO order flow attributable to the incident warehouse after the incident date.

This window covers the local Samara calendar days 2026-08-22 through 2026-08-25 (UTC+4):
- since `2026-08-21T20:00:00Z`;
- to `2026-08-25T19:59:59Z`.

The window starts at the beginning of the incident calendar day, so it is conservative with respect to the exact incident hour: any Samara posting anywhere on 22 August would be visible rather than accidentally excluded.

## Bridge run

Operation: `posting_fbo_list`
Request id: `9e4d1388-7230-4349-9bac-72ad24e34012`
Endpoint: `POST /v3/posting/fbo/list`
HTTP: `200`
Elapsed: `1659 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`
Provider terminal state: `has_next=false`, `cursor=""`.

Request included `analytics_data=true`, allowing each posting to be attributed to its source Ozon warehouse.

## Target warehouse scan

The terminal result contains postings from many Ozon warehouses, including Екатеринбург, Хоругвино, Казань, Хабаровск, Ростов-на-Дону, Ватутинки, Пушкино, Красноярск, Санкт-Петербург, Ярославль, Тюмень, Воронеж and others.

There are **zero postings** with either:
- `analytics_data.warehouse_id = 23128509046000`, or
- `analytics_data.warehouse_name = САМАРА_РФЦ`.

Therefore the complete accessible FBO posting set for local Samara days 2026-08-22..2026-08-25 contains no ordinary outbound FBO order flow from the incident warehouse.

Supported statement:

`NO_SAMARA_FBO_POSTINGS_IN_LOCAL_2026_08_22_TO_2026_08_25_WINDOW`.

## Damage-reconstruction significance

Current Samara zero stock is not explained, for this first post-incident window, by:
- ordinary FBO postings/sales from Samara;
- formal FBO removals/utilization (Run 6/6B found none from Samara for the full 2026-08-22..09-02 window);
- finance transactions classified as `compensation` (Run 5 returned zero rows).

This still does not prove destruction. Later post-incident windows, returns/supply/other movements, and especially the pre-incident Samara stock baseline must still be reconciled.

## Next step

Continue with the next local Samara window 2026-08-26..2026-08-29:
- since `2026-08-25T20:00:00Z`;
- to `2026-08-29T19:59:59Z`;
- `analytics_data=true`;
- limit `100`;
- if provider returns `has_next=true`, continue explicitly before interpreting the window.

Checkpoint:
`STD_10_REOPENED_RUN7_SAMARA_POSTINGS_WINDOW1_ZERO_WINDOW2_NEXT`
