# STD-06 Run 5 — Supply-order drill-down

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Test: `STD-06` — `Что сегодня в моём кабинете требует внимания в первую очередь?`

## Request

Operation: `supply_order_get`
Request ID: `86a8d7ac-cecb-44b3-a665-7bf00321e075`
HTTP: `200`
Physical business requests: `1`

Order IDs:
- `125820894`
- `125819631`
- `125818485`
- `125818083`
- `122149074`

## Key findings

### 1. Potentially stuck in-transit supply — highest current urgency

Order `122149074` / number `2000062599609`:
- created `2026-08-10T09:01:34.061334Z`;
- current state `IN_TRANSIT`;
- state last updated `2026-08-12T08:18:31.704993Z`;
- original timeslot `2026-08-11T14:00:00Z..15:00:00Z`;
- drop-off `ЗЛАТОУСТ_89`;
- crossdock `true`;
- supply ID `2000062599609`;
- bundle ID `019feae9-0fbe-75af-8f63-b9df1ca38840`;
- macrolocal cluster `4002`.

As of 2026-09-02 this supply has remained `IN_TRANSIT` for roughly three weeks after its planned slot and has not changed state since 2026-08-12. This is a materially stronger attention signal than the aggregate status counter exposed and should be treated as a possible stuck-supply incident until composition/status evidence explains otherwise.

### 2. Four fresh DATA_FILLING orders are not stale yet, but have a near deadline

Orders:
- `125818083` / `2000064869357` / bundle `01a0524b-6726-739e-bcc3-d3c751d56138` / cluster `4039`;
- `125818485` / `2000064869588` / bundle `01a05251-09ff-7557-b613-7437b9024b8d` / cluster `4036`;
- `125819631` / `2000064870258` / bundle `01a05259-34f7-7059-b226-492671edfc84` / cluster `4067`;
- `125820894` / `2000064871008` / bundle `01a05264-2b43-7b21-b08c-c93a3d6df65f` / cluster `4007`.

All four:
- created on `2026-08-30`;
- state `DATA_FILLING`;
- data filling deadline `2026-09-05T06:00:00Z`;
- planned timeslot `2026-09-05T07:00:00Z..08:00:00Z`;
- drop-off `ЗЛАТОУСТ_89`;
- crossdock `true`.

For a +05:00 local interpretation, deadline is `2026-09-05 11:00`, with the planned slot `12:00–13:00`. These are near-term operational tasks, not stale drafts.

## Triage impact

Current STD-06 priority order is now:
1. investigate order `122149074` still `IN_TRANSIT` long after its slot;
2. ensure four `DATA_FILLING` orders are completed before 2026-09-05 deadline;
3. slow-turnover/overstock cluster from Run 2;
4. FBO/distribution-risk signals for recent sellers from Run 2;
5. seller ratings are currently healthy from Run 1.

## Next diagnostic

Use `supply_order_bundle` for the in-transit bundle `019feae9-0fbe-75af-8f63-b9df1ca38840` to retrieve its product composition. This will show which SKUs/quantities may be stuck and whether the incident is materially linked to current stock priorities.

## Checkpoint

`STD_06_RUN5_STALE_IN_TRANSIT_SUPPLY_FOUND_BUNDLE_COMPOSITION_NEXT`
