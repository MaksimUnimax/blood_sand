# Ozon provider lifecycle/currentness sweep — 2026-09-04

Authority under audit:

- source commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- source tree `2c565626982c1a9a1919add09824ce2c5e44ee29`
- extension `v0.1.19`
- operation count: 271 Seller reads

This sweep was opened while investigating DEFECT-015 because fresh provider-currentness checks exposed stale executable surfaces independent of the original finance date-format failure.

## Classification

- `STALE_RETIRED_ENDPOINT` — provider retirement date has passed but Bridge still advertises the old endpoint as current/executable.
- `LIFECYCLE_RISK` — provider has announced a future retirement date.
- `MIGRATED / MATCH` — old endpoint exists in provider history but Bridge authority uses the replacement.
- `OUT_OF_READ_SCOPE` — retired endpoint is a write/effect operation not present in the 271-read registry.
- `PENDING` — authority/current provider cross-check not yet completed.

## Confirmed stale retired endpoints

### 1. `fbs_stock_by_warehouse_v1`

Bridge authority:

- operation: `fbs_stock_by_warehouse_v1`
- method/path: `POST /v1/product/info/stocks-by-warehouse/fbs`
- registry: `execution_enabled: true`
- registry: `currentness: "current"`
- contract: dedicated `normalizeStep5FbsStocksByWarehouseParams`
- contract state: `exact_operator_swagger_2026_08_25_step5`

Provider lifecycle:

- Ozon notice dated 2026-03-24: `/v1/product/info/stocks-by-warehouse/fbs` would be disabled 2026-04-07; migrate to `/v2/product/info/stocks-by-warehouse/fbs`.
- audit date: 2026-09-04.

Current replacement already exists in Bridge:

- `fbs_stock_by_warehouse` → `POST /v2/product/info/stocks-by-warehouse/fbs`.

Verdict: **STALE_RETIRED_ENDPOINT — CONFIRMED**.

### 2. `fbs_carriage_available_list`

Bridge authority:

- operation: `fbs_carriage_available_list`
- method/path: `POST /v1/posting/carriage-available/list`
- registry: `execution_enabled: true`
- registry: `currentness: "current"`
- contract: dedicated `normalizeFbsCarriageAvailableListParams`
- contract state: `exact_swagger_2026_08_28_b30`

Provider lifecycle:

- Ozon notice dated 2026-02-16: `/v1/posting/carriage-available/list` and `/v1/carriage/delivery/list` would be disabled 2026-03-20; migrate to `/v2/carriage/delivery/list`.
- an earlier notice had announced 2026-02-02; the later 2026-03-20 notice is used as the superseding retirement date.
- audit date: 2026-09-04.

Current replacement already exists in Bridge:

- `carriage_delivery_list_v2` → `POST /v2/carriage/delivery/list`.

Verdict: **STALE_RETIRED_ENDPOINT — CONFIRMED**.

## Confirmed future lifecycle risk

### `finance_transaction_list_v3`

- Bridge: `POST /v3/finance/transaction/list`, current/executable.
- latest Ozon notice: `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` will be disabled 2026-09-08.
- replacements: `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, `/v1/finance/accrual/by-day`.
- all three replacement read surfaces already exist in Bridge.
- `/v3/finance/transaction/totals` is not present as a registered read operation in the audited Bridge authority.

Supersession chain is important here:

1. an earlier Ozon announcement stated that `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` would be disabled on **2026-07-06**;
2. Ozon then published a later notice on **2026-07-14** moving the shutdown date to **2026-09-08**;
3. a later August reminder again states **2026-09-08**.

The later provider notice supersedes the earlier July-6 deadline. A lifecycle auditor must use the latest applicable provider notice, not mechanically treat the earliest announced retirement date as final.

Verdict: **LIFECYCLE_RISK — CONFIRMED**. Not a current provider failure on 2026-09-04, but repair/hardening must resolve it before the announced retirement date.

## Retirement families verified migrated / not stale

### Posting versions retired 2026-08-31

Ozon retired:

- `/v2/posting/fbo/list` → `/v3/posting/fbo/list`
- `/v3/posting/fbs/list` → `/v4/posting/fbs/list`
- `/v3/posting/fbs/unfulfilled/list` → `/v4/posting/fbs/unfulfilled/list`
- `/v1/posting/digital/list` → `/v2/posting/digital/list`

Authority registry:

- `posting_fbo_list` → `/v3/posting/fbo/list` — **MIGRATED / MATCH**
- `fbs_posting_list` → `/v4/posting/fbs/list` — **MIGRATED / MATCH**
- `fbs_unfulfilled_list` → `/v4/posting/fbs/unfulfilled/list` — **MIGRATED / MATCH**
- `posting_digital_list_v2` → `/v2/posting/digital/list` — **MIGRATED / MATCH**

### Warehouse / delivery-method versions retired 2026-04-07

- `seller_warehouse_list` → `/v2/warehouse/list` — **MIGRATED / MATCH**
- `seller_delivery_method_list` → `/v2/delivery-method/list` — **MIGRATED / MATCH**
- exception: `fbs_stock_by_warehouse_v1` remains stale beside its v2 replacement.

### Carriage migration retired 2026-03-20

- `carriage_delivery_list_v2` → `/v2/carriage/delivery/list` — **MIGRATED / MATCH**
- exception: `fbs_carriage_available_list` remains stale beside it.

### FBO draft old versions retired 2026-03-16

Provider retired `/v1/draft/create`, `/v1/draft/create/info`, `/v1/draft/timeslot/info`, `/v1/draft/supply/create`, `/v1/draft/supply/create/status`.

The read/status surfaces identified in the authority registry use the v2 replacements (`/v2/draft/create/info`, `/v2/draft/timeslot/info`, `/v2/draft/supply/create/status`). No stale v1 read/status duplicate has been identified in the authority registry so far.

### FBS exemplar / supply-order old versions removed 2026-01-13

Provider removed old documented versions including `/v5/fbs/posting/product/exemplar/create-or-get`, `/v4/fbs/posting/product/exemplar/status`, `/v4/fbs/posting/product/exemplar/validate`, `/v2/supply-order/list`, `/v2/supply-order/get`.

Authority uses newer versions:

- exemplar create-or-get → v6
- exemplar status/validate → v5
- supply-order list/get → v3

Verdict: **MIGRATED / MATCH** for these read surfaces.

### Other removed/deprecated 2026 surfaces checked

- `/v2/chat/list` removed 2026-06-09; authority uses `/v3/chat/list` — **MIGRATED / MATCH**.
- `/v1/actions/discounts-task/list` deprecated; authority exposes v2 read surface; no v1 read duplicate found — **MIGRATED / MATCH so far**.
- old `/v2/posting/fbs/digital/act/check-status` and `/v2/posting/fbs/digital/act/get-pdf` were retired; authority uses non-digital replacements — **MIGRATED / MATCH**.
- retired rFBS return action endpoints are write/effect surfaces, not part of the 271 read registry — **OUT_OF_READ_SCOPE**.
- `/v2/fbs/posting/sent-by-seller` removed 2026-01-20; no authority read operation has been identified — **not present so far**.
- `/v1/product/certificate/products/list` pagination `page/page_size` is being deprecated; authority template already uses the newer `certificate_id` + `limit` style and does not publish `page/page_size` — **MIGRATED / MATCH for template surface**.

## Process defect — currentness is not guaranteed by fresh Swagger labels

Both confirmed stale endpoints are still associated with apparently fresh contract-state labels dated August 2026, months after their provider-announced shutdown dates. Therefore:

> `present in Swagger/operator snapshot` is not equivalent to `currently supported executable endpoint`.

The current `OZON_PATCH_DELIVERY_GATE.md` has strong dependency, provider, entitlement, request and package gates, but no explicit deprecation/retirement/currentness gate was found by searching for `deprecat*` or `retir*`.

Classification: **PROCESS GAP — CONFIRMED**.

### Required gate addition for the eventual authorized repair

Before any operation registry/package can be certified as current:

1. enumerate every registered method/path;
2. compare against current official Ozon documentation and provider deprecation/retirement notices;
3. resolve superseding retirement dates rather than trusting the first announcement;
4. if retirement date has passed, the old operation must not remain normal `current + execution_enabled`;
5. if a future retirement is announced, record a lifecycle deadline and replacement before handoff;
6. verify discovery/guidance/templates/contract/entitlements/tests/generated copies all agree with the lifecycle verdict;
7. add a deterministic registry regression so known retired paths cannot silently re-enter a candidate.

This should become a new mandatory delivery-gate item when executable/process patching is explicitly authorized. The canonical gate is intentionally not edited during evidence collection.

## Provider evidence sources

Official Ozon Seller API notification channel / documentation-news feed used in this sweep, including notices dated:

- 2025-12-02 — initial carriage/warehouse migration notices;
- 2026-01-13 — exemplar/supply-order removals;
- 2026-01-20 — sent-by-seller removal;
- 2026-01-23 — discounts-task v1 deprecation;
- 2026-02-16 — warehouse/carriage retirement dated 2026-03-20;
- 2026-03-24 — FBS stock-by-warehouse/delivery-method/warehouse v1 retirement dated 2026-04-07;
- earlier finance notice — transaction list/totals initially announced for 2026-07-06 shutdown;
- 2026-06-09 — chat v2 removal;
- 2026-07-10 — posting retirements dated 2026-08-31;
- 2026-07-14 — superseding finance transaction retirement date moved to 2026-09-08;
- later August reminder — finance transaction shutdown remains 2026-09-08;
- 2026-08-11 — old rFBS return-action removals;
- late August/early September — certificate-products pagination deprecation notice.

Primary channel: `https://t.me/s/OzonSellerAPI`.

## Open work

- continue full retirement/currentness cross-match for all 271 registry paths, including older notices where duplicate versioned operations exist;
- audit entitlement/provider/guidance/generated-copy consumers for both confirmed stale operations;
- add every new finding to this file and the DEFECT-015 operation matrix immediately;
- do not resume STD-06 live testing until the authorized repair candidate exists and the failed finance step is rerun.
