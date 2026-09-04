# DEFECT-015 — FBO draft timeslot contract sweep — 2026-09-04

Authority:

- source commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- Bridge `v0.1.19`
- operation `fbo_draft_timeslot_info`
- endpoint `POST /v2/draft/timeslot/info`

## Provider contract

Current Ozon Seller OpenAPI / workflow documentation states:

- `date_from` and `date_to` are required;
- both are calendar-date strings in `YYYY-MM-DD` form;
- `selected_cluster_warehouses` maxItems = 20;
- available timeslots are queried for a period with **maximum 28 days starting from the current date**;
- provider response has explicit error reason `REQUESTED_PERIOD_MORE_THAN_MAX` for a period exceeding the maximum.

The method is the current v2 replacement for retired `/v1/draft/timeslot/info`.

## Bridge authority

Registry:

```text
operation: fbo_draft_timeslot_info
path: /v2/draft/timeslot/info
currentness: current
execution_enabled: true
template.date_from: 2026-08-28
template.date_to:   2026-08-29
```

Normalizer `normalizeFboDraftTimeslotInfoParams` currently does only:

```text
date_from = requireString(...)
date_to   = requireString(...)
```

It validates draft id, supply type and warehouse array size, but does not:

- validate either date as `YYYY-MM-DD`;
- validate that `date_from <= date_to`;
- validate that the requested window belongs to the provider's current/future availability horizon;
- enforce the provider's 28-day maximum window from the current date.

## Verdict

### Confirmed `MISSING_GUARD` — date syntax

Bridge accepts any non-empty string even though provider contract requires calendar-date syntax.

Required repair: strict real-date `YYYY-MM-DD` validation, not loose JavaScript parsing.

### Confirmed `MISSING_GUARD` — ordering

A reversed `date_from/date_to` pair currently passes local preflight. The request represents a date interval and provider exposes a period-limit error family; local contract should fail closed before network for a reversed interval.

### Confirmed `MISSING_GUARD` — 28-day/current-date horizon

Provider explicitly states the maximum period is 28 days starting from the current date and exposes `REQUESTED_PERIOD_MORE_THAN_MAX`. Bridge currently has no equivalent preflight rule.

This guard must be deterministic in tests using an injected/frozen reference date; do not write wall-clock-flaky tests.

### Confirmed `INVALID_RUNNABLE_TEMPLATE`

The authority registry publishes a fixed template:

```json
{"date_from":"2026-08-28","date_to":"2026-08-29", ...}
```

Audit date is `2026-09-04`. The provider describes the availability period as beginning from the current date, so this hard-coded template is already in the past and is not lifecycle-safe as a runnable default.

The defect is structural: any fixed calendar-date template for a current/future timeslot endpoint will become stale.

## Required repair closure when authorized

Audit and repair all of:

1. `normalizeFboDraftTimeslotInfoParams`;
2. operation registry template;
3. guidance/discovery examples;
4. generated/bundled copies;
5. deterministic validation tests;
6. any template-runnable certification that treated a hard-coded date as permanently runnable.

Recommended invariant, subject to implementation design:

- static registry must not claim a hard-coded date-dependent request is permanently runnable;
- date-dependent examples should be dynamically resolved by planner/guidance or marked as requiring explicit/current date input;
- local validation must enforce exact YMD, representable dates, ordering and provider horizon.

## Required deterministic controls

With a frozen reference date `2026-09-04`:

- `2026-09-04 .. 2026-09-05` → local pass;
- malformed string → local reject, physical requests 0;
- impossible YMD date → local reject, physical requests 0;
- reversed interval → local reject, physical requests 0;
- interval outside documented 28-day horizon → local reject, physical requests 0;
- boundary at documented maximum → explicit deterministic boundary test.

No live request is issued during this audit. STD-06 remains **FROZEN ON LIVE FAIL**.
