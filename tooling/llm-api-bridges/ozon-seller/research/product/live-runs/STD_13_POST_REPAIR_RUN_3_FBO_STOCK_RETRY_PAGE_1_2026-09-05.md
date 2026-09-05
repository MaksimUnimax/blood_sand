# STD-13 post-repair — Run 3 FBO stock retry, Page 1

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`
Target supply order: `122149074` / `2000062599609`
Target bundle: `019feae9-0fbe-75af-8f63-b9df1ca38840`

## Context

The first Run 3 `fbo_stock_by_warehouse` attempt returned provider HTTP 429 with `Retry-After: 1` and no automatic retry. Under `NO_SKIP_ON_FAILURE`, the same logical business read was retried rather than being interpreted as zero stock or skipped.

## Retry result

Operation: `fbo_stock_by_warehouse`
Request ID: `e179efc8-7d9d-43a7-8570-6c50a03137d1`
HTTP: `200`
External request executed: `true`
Logical/physical business requests: `1/1`
Entitlement: `SUPPORTED_AND_ENTITLED`
Command transformed: `true`
Exact request preserved: `false`

Requested SKUs:
- `2559748332`
- `2559437928`
- `1636048691`
- `2183985513`
- `2184234912`
- `1640330072`
- `1640251697`
- `2326866320`
- `1602717077`

Provider result is non-terminal:
- `has_next=true`
- cursor: `MTYzNjA0ODY5MTsxODA0NDI0OTc4MTAwMA==`

Therefore Page 1 is not sufficient for final SKU-level reconciliation.

## Partial observations only — not final conclusions

The first page already shows current non-zero FBO presence for some bundle SKUs, including examples such as:
- SKU `2559748332` (`Герб России`) — at least one current FBO unit appears on this page;
- SKU `2184234912` (`Звезда Лады`) — current non-zero FBO rows appear on this page;
- SKU `2183985513` (`Перун`) — current non-zero FBO rows appear on this page;
- SKU `2326866320` (`Спаси и Сохрани`) — multiple current non-zero FBO rows appear on this page;
- SKU `1636048691` (`Печать Велеса`) begins on this page with at least one non-zero row.

These observations must not be treated as complete totals because pagination is still open. Absence of another requested SKU from Page 1 is not evidence of zero FBO stock.

## Required continuation

Continue the same exact logical SKU set with the provider cursor. Do not change the SKU set, interpretation, or business job.

Checkpoint:
`STD_13_RUN3_FBO_RETRY_HTTP200_PAGE1_NONTERMINAL_CONTINUE_SAME_SKUS_WITH_CURSOR`
