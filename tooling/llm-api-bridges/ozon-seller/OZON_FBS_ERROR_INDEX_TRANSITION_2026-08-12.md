# Ozon FBS error index — transition effective 2026-08-12

Research date: 2026-08-11
Status: **future-effective business semantics; API contract unchanged by this artifact**

## Ozon-owned announcement

Ozon Marketplace announced that from **12 August 2026** it will start including overdue FBS shipments in the error-index calculation when sellers violate their own configured preparation/shipment time.

The announcement describes the following error-index bands for overdue-shipment operational-error fees:

- up to and including 2%: no operational-error processing fee;
- 2.1%–5%: base tariff;
- 5.1%–10%: base tariff ×2;
- above 10%: base tariff ×3.

For the base tariff the announcement states 2% of product value, minimum 50 RUB and maximum 2000 RUB for an overdue shipment. The same announcement says realFBS already uses overdue shipments in the index and FBS will begin doing so on 2026-08-12.

It also distinguishes two timing concepts that future diagnostics must not collapse:

1. Ozon recommended shipment time;
2. seller-configured preparation/shipment time.

Ozon says both conditions are evaluated separately. Shipping before the recommended time avoids timing-violation markups and retains the stated recommended-time discount rule even if seller preparation timing would otherwise be violated.

## API relevance

Current research already includes read candidates:

- `/v1/rating/index/fbs/info`
- `/v1/rating/index/fbs/posting/list`

This announcement strengthens the business need for those methods but **does not provide their full HTTP/request/response contract** and therefore does not close the logistics contract gate.

Do not infer exact API reason codes, fields, timestamps or fee fields from the Marketplace announcement.

## Engineering consequence

- Before 2026-08-12, treat overdue-FBS-shipment inclusion as future-effective.
- From 2026-08-12 onward, revalidate the live Ozon-owned API documentation/notification surface before coding or real-account acceptance.
- Keep error-index interpretation date-aware; do not apply the post-2026-08-12 business rule retroactively to older periods without evidence.
- `extension_development_allowed` remains false.

Source: official Ozon Marketplace announcement “FBS: про рекомендованное время и индекс ошибок с 12 августа”.
