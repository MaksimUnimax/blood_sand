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
- Existing Seller helper reads used for live-data discovery: `1 PASS` (`assembly_fbs_posting_list`)
- New Seller reads added by this build: `5/26 LIVE_PASS`
- New Seller reads attempted against live Ozon: `9/26`
- New Seller reads not yet attempted: `17/26`
- Provider-permission blocked after correct live dispatch: `4`
- Needs diagnostic after latest run: `0`
- Physical business requests observed: `12`
- Logical business commands observed: `12`
- Automatic capability probes observed: `0`
- Batch transport: `PASS`

New operations `LIVE_PASS` so far:

- `notification_list`
- `notification_push_type_list`
- `carriage_delivery_list_v2`
- `chat_list_v3`
- `posting_global_etgb`

Provider permission blocked after correct live dispatch:

- `receipts_seller_list` — HTTP `403`, provider `auth_or_permission`, code `7`
- `posting_digital_list_v2` — corrected filtered request reached provider and returned HTTP `403`, provider `auth_or_permission`, code `7`
- `delivery_map` — HTTP `403`, provider `auth_or_permission`, code `7`
- `delivery_point_list` — HTTP `403`, provider `auth_or_permission`, code `7`

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

### Result 4 — `posting_digital_list_v2`

- expected endpoint: `POST /v2/posting/digital/list`
- external request executed: `true`
- HTTP: `400`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `provider_request`
- provider code: `3`
- automatic retry: `false`
- temporary outcome after Run 002: `NEEDS_DIAGNOSTIC`
- resolved by Run 003 with a filtered request that reached the same endpoint and returned a permission-classified 403

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

## Run 003 — digital retry with correct filter + global ETGB + posting discovery helper

**Status: PARTIAL_PASS_WITH_PROVIDER_BLOCK_AND_HELPER_SUCCESS**

Single owner run containing 3 commands.

### Batch envelope

- `result_count`: `3`
- `query_planner.status`: `complete`
- `logical_business_result_count`: `3`
- `physical_business_request_count`: `3`
- capability probe: `not_needed`, `performed=false`
- three explicit commands -> exactly three physical Ozon requests: `PASS`

### Result 1 — `posting_digital_list_v2`

- expected endpoint: `POST /v2/posting/digital/list`
- input changed from the Run 002 minimal request to an explicit time-window filter with `limit` and `sort_dir`
- external request executed: `true`
- HTTP: `403`
- exact request preserved: `true`
- command transformed: `false`
- provider category: `auth_or_permission`
- provider code: `7`
- automatic retry: `false`
- outcome: `PROVIDER_PERMISSION_BLOCKED`
- diagnostic resolution: the previous HTTP 400 is no longer treated as a bridge contract failure; a structurally richer valid request reached the intended endpoint and was rejected by provider permission policy

### Result 2 — `posting_global_etgb`

- expected endpoint: `POST /v1/posting/global/etgb`
- external request executed: `true`
- HTTP: `200`
- exact request preserved: `true`
- command transformed: `false`
- provider returned a valid empty result for the requested interval
- outcome: new Seller read `LIVE_PASS`

### Result 3 — `assembly_fbs_posting_list` (existing helper)

- expected endpoint: `POST /v1/assembly/fbs/posting/list`
- external request executed: `true`
- HTTP: `200`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- command transformed: `false`
- provider returned `3` real FBS postings for the requested cutoff interval
- raw posting numbers, SKUs, offer names and product names are intentionally not copied into this repository ledger
- outcome: existing Seller helper `PASS`; live identifiers are available in the owner-visible result for subsequent new-read tests

### Run 003 invariants

- three explicit commands -> exactly three physical business requests: `PASS`
- all operations recognized: `PASS`
- no capability probe: `PASS`
- no automatic retry on the provider 403: `PASS`
- `posting_global_etgb` business response: `LIVE_PASS`
- helper returned real live FBS records for downstream parameterized testing: `PASS`

## Next

1. Use the live FBS posting identifiers returned by Run 003 to test new posting-dependent reads without fake IDs.
2. Keep `posting_digital_list_v2`, `receipts_seller_list`, `delivery_map`, and `delivery_point_list` classified as `PROVIDER_PERMISSION_BLOCKED` for this account unless credentials/entitlements change.
3. Continue grouped new-read coverage and maintain exactly one physical provider request per explicit command.
4. Every subsequent run must be appended here before issuing the next live batch.
