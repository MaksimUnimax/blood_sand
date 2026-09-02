# STD-06 Run 1 — Seller Rating Summary

Date: 2026-09-02
Question: `Что сегодня в моём кабинете требует внимания в первую очередь?`
Status: IN_PROGRESS

## Command

`operation = seller_rating_summary`

## Result

- request id: `525c42c4-c70b-4499-9dde-87e333e555f8`
- endpoint: `POST /v1/rating/summary`
- HTTP: `200`
- physical business requests: `1`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`

## Findings

No critical rating/penalty condition is visible in this surface:

- `penalty_score_exceeded = false`;
- FBS complaints = `0`, status `OK`;
- product review score = `4.98`, status `OK`;
- FBS/rFBS progressive rating = `0.0568` (5.68%), status `OK`;
- price-index distribution reports 100% in `super` zone and 0 in green/yellow/red, all statuses `OK`;
- several zero-value ratings have `UNKNOWN_STATUS`; do not treat `UNKNOWN_STATUS` as a failure without further evidence;
- localization index = `37%`, calculation date `2026-08-26`; this response does not provide a threshold proving that 37% is critical.

## Interpretation

Rating/penalty is not the first supported priority based on Run 1. STD-06 remains active because the user asked for whole-cabinet triage, not only rating health.

Next evidence family: inventory / turnover, then other current operational surfaces as indicated.

## Checkpoint

`STD_06_RUN1_RATING_NO_CRITICAL_ISSUE_NEXT_INVENTORY_TURNOVER_TRIAGE`
