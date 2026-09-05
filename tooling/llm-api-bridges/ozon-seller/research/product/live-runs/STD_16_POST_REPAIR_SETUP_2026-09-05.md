# STD-16 post-repair setup — advertising spend for latest 7 completed days

Date: 2026-09-05
Canonical question: `Дай рекламные расходы за последние 7 дней и покажи, какие кампании потратили больше всего.`
Branch: `repair/ozon-date-contract-2026-09-04`

## Period resolution

Use the latest seven completed calendar days, excluding the still-partial current day 2026-09-05:

- dateFrom: `2026-08-29`
- dateTo: `2026-09-04`

This avoids comparing six completed days plus one partial day.

## First read

Operation: `performance_expense`
Params:

```json
{"dateFrom":"2026-08-29","dateTo":"2026-09-04"}
```

Purpose: obtain Performance API advertising expense statistics for the requested seven-day period.

After the result:

1. calculate total spend if the response exposes campaign-level rows;
2. rank campaigns by spend descending;
3. if the expense response exposes campaign IDs but not human-readable names, use one explicit `performance_campaigns` read only for the IDs needed to label the ranking;
4. if Performance credentials/entitlement are unavailable, preserve that as the actual product outcome rather than falling back to Seller API or inventing spend.

STD-16 status: `READY_FOR_RUN1`.

Checkpoint:
`STD_16_PERFORMANCE_EXPENSE_2026_08_29_TO_2026_09_04_NEXT`
