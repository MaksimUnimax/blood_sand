# OZON_BRIDGE v0.1.19 FULL READ 266 — Live Acceptance Ledger

Date started: 2026-09-01

Source branch: `repair/ozon-step7-245-read-final-candidate-v3-2026-08-31`
Live-test branch: `test/ozon-v0.1.19-full-read-266-live-2026-09-01`
Bridge version under test: `0.1.19`
Delivery mode: `sequential_batch_single_delivery`

## Rule

After every owner live run, record the complete outcome in this ledger before continuing to the next run.

A live operation is counted PASS when the bridge recognizes the operation, forms the expected provider request, executes no more than one physical business request for that explicit command, performs no automatic retry/fan-out/hidden pagination, and returns the provider response. An empty business result is allowed. A provider/API error may still prove transport/operation wiring when it is the direct response of the expected endpoint; such cases are recorded separately and are not silently promoted to a business-semantic PASS.

## Coverage summary

- Existing Seller regression smoke: `1/1 PASS` (`stocks_current`)
- New Seller reads added by this build: `2/26 live PASS`
- New Seller reads remaining: `24/26`
- Physical business requests observed: `3`
- Logical business commands observed: `3`
- Automatic capability probes observed: `0`
- Batch transport: `PASS`

New operations live-PASS so far:

- `notification_list`
- `notification_push_type_list`

## Run 001 — baseline + notifications

**Status: PASS**

Single owner run containing 3 commands.

### Batch envelope

- `result_count`: `3`
- `query_planner.status`: `complete`
- `logical_business_result_count`: `3`
- `physical_business_request_count`: `3`
- `coalesced_group_count`: `0`
- `coalesced_logical_count`: `0`
- capability probe: `not_needed`, `performed=false`

### Result 1 — `stocks_current`

- request id: `76f1a741-76b5-4f6b-aaa7-8e2482331674`
- endpoint entitlement key: `POST /v4/product/info/stocks`
- external request executed: `true`
- HTTP: `200`
- elapsed: `1395 ms`
- exact request preserved: `true`
- command transformed: `false`
- returned product id: `1082848375`
- total: `1`
- outcome: existing Seller regression smoke `PASS`

### Result 2 — `notification_list`

- request id: `73857176-25c6-44d8-92bf-3bbb8475e92f`
- endpoint: `POST /v1/notification/list`
- external request executed: `true`
- HTTP: `200`
- elapsed: `318 ms`
- exact request preserved: `true`
- command transformed: `false`
- entitlement status: `ENTITLEMENT_UNKNOWN` (`entitlement_rule_unknown`)
- provider result: `total_count=0`, `urls=[]`
- outcome: new Seller read live `PASS`

Note: `ENTITLEMENT_UNKNOWN` did not block execution; the expected Ozon endpoint returned HTTP 200, so this is not treated as a failure.

### Result 3 — `notification_push_type_list`

- request id: `e8437538-d0d8-41ef-a72d-f344e2756071`
- endpoint: `POST /v1/notification/push-type/list`
- external request executed: `true`
- HTTP: `200`
- elapsed: `326 ms`
- exact request preserved: `true`
- command transformed: `false`
- entitlement status: `ENTITLEMENT_UNKNOWN` (`entitlement_rule_unknown`)
- provider result: list of notification push types returned successfully
- outcome: new Seller read live `PASS`

### Run 001 invariants

- three explicit commands -> exactly three physical business requests: `PASS`
- no capability probe: `PASS`
- no command transformation: `PASS`
- all three expected Ozon calls returned HTTP 200: `PASS`
- batch single-delivery with three logical results: `PASS`

## Next

Continue with the remaining new Seller reads in grouped single-run batches, preferring operations whose required inputs can be supplied from known account data or from results of earlier reads. Every run must be appended here before issuing the next live test batch.
