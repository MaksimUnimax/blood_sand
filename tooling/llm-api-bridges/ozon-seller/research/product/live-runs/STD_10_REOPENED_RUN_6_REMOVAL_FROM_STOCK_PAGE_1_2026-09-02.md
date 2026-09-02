# STD-10 REOPENED Run 6 — removal/utilization report page 1

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.

## Purpose

Continue the reopened historical-stock damage reconstruction by testing whether Ozon formally removed or utilized FBO stock after the incident.

## Bridge run

Operation: `removal_from_stock_list`
Request id: `31c5beb5-1fce-461c-9347-8b57c2a5aee4`
Endpoint: `POST /v1/removal/from-stock/list`
HTTP: `200`
Elapsed: `1461 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`

Requested window: `2026-08-22..2026-09-02`.
Requested limit: `500`.

## Returned row

The response contains one removal row:

- offer_id: `Вегвизир - Рунический компас`;
- sku: `1602722942`;
- quantity_for_return: `1`;
- stock_type: `Брак, доступный к вывозу со стока`;
- return_created_at: `2026-08-31T00:00:00Z`;
- clearing_warehouse_name: `ХАБАРОВСК_2_РФЦ`;
- box_state: `В пути`;
- return_state: `В пути`;
- delivery_type: `Вывоз с ПВЗ/СЦ`;
- destination_warehouse_name: `ЗЛАТОУСТ_28`;
- delivery_date: `2026-09-13T00:00:00Z`;
- utilization_date: empty.

This row is unrelated to the target Samara warehouse and does not explain current Samara zero stock.

## Pagination/completeness caution

The response also returned non-empty `last_id`:

`whcReturnId:31221505_boxId:20250353996_itemIndex:0`

Bridge exposes no explicit `has_next` for this operation. Although the page contains only 1 row versus requested limit 500, the safest no-skip evidence rule is to perform one explicit continuation with the returned `last_id` before declaring the report terminal. This avoids treating a non-empty continuation token as irrelevant without provider confirmation.

Therefore Run 6 is currently a **partial page**, not a final no-Samara-removal conclusion.

## Current interpretation

Supported now:
- at least one FBO removal exists in the post-incident window;
- it is 1 unit of SKU `1602722942` from `ХАБАРОВСК_2_РФЦ`, not Samara;
- no Samara removal is visible on page 1.

Not yet supported:
- no Samara removal/utilization exists in the full window;
- the report is complete.

## Next step

Repeat the exact same `removal_from_stock_list` window and limit with the returned `last_id`.

Checkpoint:
`STD_10_REOPENED_RUN6_REMOVAL_PAGE1_ONE_HABAROVSK_ROW_NO_SAMARA_VISIBLE_LAST_ID_CONTINUATION_VERIFY_TERMINAL_NEXT`
