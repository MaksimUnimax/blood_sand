# STD-10 Run 1 — Ozon warehouse list and Samara incident match

Date: 2026-09-02
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`

## Bridge run

Operation: `ozon_warehouse_list`
Request id: `c2a31f58-e6da-44c8-962f-852fb180f65d`
Endpoint: `POST /v1/warehouse/ozon/list`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Pagination: `null`
Command transformed: `false`

## Real external incident selected for STD-10

Use the recent Ozon logistics-center incident in Chapayevsk, Samara region on **2026-08-22**, not the old 2022 New Riga fire.

Public reports confirm:
- Ozon's logistics center in Chapayevsk was hit during a UAV attack on 2026-08-22;
- a fire started at the warehouse;
- 500+ employees were evacuated and injuries were reported;
- Ozon suspended work of the logistics center and cancelled/reallocated logistics routes connected to it.

High-authority/current sources:
- Reuters, 2026-08-22: https://www.reuters.com/world/ukrainian-drones-hit-warehouse-russian-online-retailer-ozon-overnight-strikes-2026-08-22/
- Interfax, 2026-08-22: https://www.interfax.ru/russia/1110591
- Kommersant, 2026-08-22: https://www.kommersant.ru/doc/8906112

Address-level OSINT/public reporting identifies the affected Ozon distribution complex as Chapayevsk, Industrialnaya St., 3.

## Exact Bridge warehouse match

Run 1 returned:
- warehouse_id: `23128509046000`
- name: `САМАРА_РФЦ`
- address: `446114, Россия, Самарская обл, Чапаевск г, Индустриальная ул, зд. 3`
- timezone: `Europe/Samara`
- warehouse_type: `FULL_FILLMENT`
- `is_active=true`

This is an exact city/address match to the public incident and is therefore the target warehouse for the remainder of STD-10.

## Important semantic caution

`ozon_warehouse_list.is_active=true` must **not** be interpreted as proof that the facility is currently operating normally after the incident. Public reporting on 2026-08-22 said operations were suspended and routes were cancelled/reallocated. The registry/list `is_active` field may represent a catalog/configuration state rather than real-time incident operability.

This is a product-semantic boundary to preserve.

## Existing current-account evidence relevant to STD-10

STD-08 completed a full current warehouse-stock traversal on 2026-09-02 (100 + 100 + 47 rows = 247 rows across 33 warehouses). `САМАРА_РФЦ` did not appear in that current stock set. Therefore no current free/reserved/promised row for this seller at Samara was visible on the warehouse-stock surface as of 2026-09-02.

That current absence does **not** prove whether the seller had inventory there at the time of the 2026-08-22 incident. Historical evidence is still required.

## Next investigation step

Use FBO postings immediately before the incident to determine whether the seller's products were actively shipping from `САМАРА_РФЦ` shortly before the attack. A positive posting match is direct evidence that seller inventory was present in the Samara fulfillment flow before the incident.

STD-10 remains `IN_PROGRESS`.

Checkpoint:
`STD_10_RUN1_SAMARA_RFC_23128509046000_EXACT_INCIDENT_MATCH_CURRENT_STOCK_ABSENT_HISTORICAL_PREINCIDENT_FBO_EVIDENCE_NEXT`
