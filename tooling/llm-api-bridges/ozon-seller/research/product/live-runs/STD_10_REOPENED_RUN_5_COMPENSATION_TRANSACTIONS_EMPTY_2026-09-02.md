# STD-10 REOPENED Run 5 — compensation transactions empty

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.

## Purpose

The prior STD-10 closure was reopened because current zero stock at Samara plus healthy stock elsewhere does not determine whether any units physically/accountedly present at Samara were destroyed, written off, transferred, sold, or compensated after the incident.

Run 5 tests the most direct currently registered financial compensation surface.

## Bridge run

Operation: `finance_transaction_list_v3`
Request id: `5fd0c0ac-b6b5-42d3-89b6-a23373d295a0`
Endpoint: `POST /v3/finance/transaction/list`
HTTP: `200`
Elapsed: `1463 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `true`
Bridge pagination metadata: `null`

Requested filter:
- date from `2026-08-22T00:00:00Z`;
- date to `2026-09-02T23:59:59Z`;
- `transaction_type=compensation`;
- page `1`;
- page_size `1000`.

## Provider result

The provider returned:
- `operations=[]`;
- `page_count=0`;
- `row_count=0`.

Therefore no financial transaction classified by this endpoint as `transaction_type=compensation` exists in the requested post-incident window.

## Interpretation

This is negative compensation evidence, not proof of no inventory loss.

Supported statement:
`NO_FINANCE_TRANSACTION_V3_COMPENSATION_ROWS_2026_08_22_TO_2026_09_02`.

Unsupported statements that must not be made from this run alone:
- no goods burned;
- no goods were lost;
- Ozon will not compensate;
- no write-off or other inventory adjustment exists;
- any loss would necessarily appear under this transaction type by 2026-09-02.

Compensation may be absent because there was no compensable loss, because the process is not yet posted, or because the relevant accounting event is represented by another movement/report/operation type. Run 5 does not distinguish those possibilities.

## Next damage-reconstruction step

Inspect FBO removals/utilization from the incident through today using `removal_from_stock_list`.

Purpose:
- determine whether stock was formally removed/utilized after the incident;
- inspect any Samara/target-SKU evidence exposed by that report;
- explain part of the stock delta before treating current Samara zero as possible destruction.

Use the full current investigation window `2026-08-22..2026-09-02` and `limit=500`; if continuation is returned, continue explicitly with `last_id` under the no-hidden-pagination rule.

STD-10 remains:
`REOPENED_IN_PROGRESS_HISTORICAL_STOCK_DAMAGE_RECONSTRUCTION`.

Checkpoint:
`STD_10_REOPENED_RUN5_NO_COMPENSATION_ROWS_REMOVAL_UTILIZATION_READ_NEXT`
