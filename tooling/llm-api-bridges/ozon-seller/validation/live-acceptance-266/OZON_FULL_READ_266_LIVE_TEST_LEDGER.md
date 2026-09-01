# OZON_BRIDGE v0.1.19 FULL READ 266 — Live Acceptance Ledger

Date started: 2026-09-01

Source branch: `repair/ozon-step7-245-read-final-candidate-v3-2026-08-31`
Live-test branch: `test/ozon-v0.1.19-full-read-266-live-2026-09-01`
Bridge version under test: `0.1.19`
Delivery mode: `sequential_batch_single_delivery`

## Rule

After every owner live run, record the complete outcome in this ledger before continuing to the next run.

A live operation is counted `LIVE_PASS` when the bridge recognizes the operation, forms the expected provider request, executes no more than one physical business request for that explicit command, performs no automatic retry/fan-out/hidden pagination, and the expected Ozon endpoint returns a successful business response. A direct provider permission error proves live routing/transport but is tracked separately as `PROVIDER_PERMISSION_BLOCKED`. A direct provider 4xx request error is tracked as `NEEDS_DIAGNOSTIC` until its exact cause is resolved. Sensitive business response payloads are not copied into this repository ledger.

## Coverage summary

- Existing Seller regression smoke: `1/1 PASS` (`stocks_current`)
- New Seller reads added by this build: `4/26 LIVE_PASS`
- New Seller reads attempted against live Ozon: `8/26`
- New Seller reads not yet attempted: `18/26`
- Provider-permission blocked after correct live dispatch: `3`
- Needs diagnostic after correct live dispatch: `1`
- Physical business requests observed: `9`
- Logical business commands observed: `9`
- Automatic capability probes observed: `0`
- Batch transport: `PASS`

New operations `LIVE_PASS` so far:

- `notification_list`
- `notification_push_type_list`
- `carriage_delivery_list_v2`
- `chat_list_v3`

Provider permission blocked after correct live dispatch:

- `receipts_seller_list` — HTTP `403`, provider `auth_or_permission`, code `7`
- `delivery_map` — HTTP `403`, provider `auth_or_permission`, code `7`
- `delivery_point_list` — HTTP `403`, provider `auth_or_permission`, code `7`

Needs diagnostic:

- `posting_digital_list_v2` — HTTP `400`, provider `provider_request`, code `3`

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

- endpoint entitlement key: `POST /v4/product/info/stocks`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- returned requested product successfully
- outcome: existing Seller regression smoke `PASS`

### Result 2 — `notification_list`

- endpoint: `POST /v1/notification/list`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- entitlement status: `ENTITLEMENT_UNKNOWN` (`entitlement_rule_unknown`)
- provider returned a valid empty configured-URL list
- outcome: new Seller read `LIVE_PASS`

### Result 3 — `notification_push_type_list`

- endpoint: `POST /v1/notification/push-type/list`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- entitlement status: `ENTITLEMENT_UNKNOWN` (`entitlement_rule_unknown`)
- provider returned notification push types
- outcome: new Seller read `LIVE_PASS`

### Run 001 invariants

- three explicit commands -> exactly three physical business requests: `PASS`
- no capability probe: `PASS`
- no command transformation: `PASS`
- all three expected Ozon calls returned HTTP 200: `PASS`
- batch single-delivery with three logical results: `PASS`

## Run 002 — grouped safe-read live coverage

**Status: PARTIAL_PASS_WITH_PROVIDER_BLOCKS_AND_DIAGNOSTIC**

Single owner run containing 6 commands.

### Batch envelope

- `result_count`: `6`
- `query_planner.status`: `complete`
- `logical_business_result_count`: `6`
- `physical_business_request_count`: `6`
- `coalesced_group_count`: `0`
- `coalesced_logical_count`: `0`
- capability probe: `not_needed`, `performed=false`
- six explicit commands -> exactly six physical Ozon requests: `PASS`

### Result 1 — `carriage_delivery_list_v2`

- expected endpoint: `POST /v2/carriage/delivery/list`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- provider returned the seller's delivery/carriage method data
- `has_next=false`; no hidden pagination followed
- outcome: new Seller read `LIVE_PASS`

### Result 2 — `chat_list_v3`

- expected endpoint: `POST /v3/chat/list`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- provider returned chat metadata successfully
- response advertised `has_next=true`, but the bridge did not automatically follow the cursor: `PASS`
- raw chat identifiers and metadata intentionally not persisted in this ledger
- outcome: new Seller read `LIVE_PASS`

### Result 3 — `receipts_seller_list`

- expected endpoint: `POST /v1/receipts/seller/list`
- external request executed: `true`
- HTTP: `403`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `auth_or_permission`
- provider code: `7`
- automatic retry: `false`
- outcome: `PROVIDER_PERMISSION_BLOCKED`
- interpretation: alias/contract/provider routing is live and correct; this account/key did not authorize a successful business response, so it is not promoted to `LIVE_PASS`

### Result 4 — `posting_digital_list_v2`

- expected endpoint: `POST /v2/posting/digital/list`
- external request executed: `true`
- HTTP: `400`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `provider_request`
- provider code: `3`
- automatic retry: `false`
- outcome: `NEEDS_DIAGNOSTIC`
- interpretation: live endpoint routing is proven, but the runtime contract's current minimal test input (`limit=100`) did not yield a successful provider response and must be checked before declaring live semantic PASS

### Result 5 — `delivery_map`

- expected endpoint: `POST /v1/delivery/map`
- external request executed: `true`
- HTTP: `403`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `auth_or_permission`
- provider code: `7`
- automatic retry: `false`
- outcome: `PROVIDER_PERMISSION_BLOCKED`

### Result 6 — `delivery_point_list`

- expected endpoint: `POST /v1/delivery/point/list`
- external request executed: `true`
- HTTP: `403`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `auth_or_permission`
- provider code: `7`
- automatic retry: `false`
- outcome: `PROVIDER_PERMISSION_BLOCKED`

### Run 002 invariants

- six explicit commands -> exactly six physical business requests: `PASS`
- all six operations recognized: `PASS`
- all six reached the intended Seller provider path: `PASS`
- no capability probe: `PASS`
- no automatic retry observed on 400/403 responses: `PASS`
- `chat_list_v3` returned `has_next=true` and no hidden pagination occurred: `PASS`
- successful business responses: `2/6`
- direct permission blocks: `3/6`
- request diagnostic pending: `1/6`

## Next

1. Resolve `posting_digital_list_v2` HTTP 400 by checking the frozen request contract before another live attempt; do not blindly retry the same request.
2. Continue grouped live coverage of the remaining untested new Seller reads, preferring safe projections with known valid inputs.
3. Keep provider-permission blocked operations in the ledger; they already prove live alias/transport routing but require either appropriate account entitlement or a deliberately accepted permission-blocked classification for owner-live acceptance.
4. Every subsequent run must be appended here before issuing the next live batch.
