# CAP-24 — Run 07: finance_accrual_types 429 immediately after finance_accrual_by_day 200 (2026-09-06)

- Capability: `CAP-24`
- Branch: `repair/ozon-date-contract-2026-09-04`
- Runtime version: `0.1.19`
- Operation: `finance_accrual_types`
- Request ID: `2f01d55b-6ff3-4449-b1f8-b8da9c44ed9d`
- Logical command fingerprint: `405f0634`
- Physical command fingerprint: `405f0634`
- Physical business request count: `1`
- External request executed: `true`
- HTTP status: `429`
- Elapsed: `1373 ms`
- Retry-After: `1`
- Automatic retry: `false`
- Entitlement: `SUPPORTED_AND_ENTITLED`
- Exact request preserved: `true`
- Command transformed: `false`

## Test purpose

This was the requested same-window cross-method control immediately following a successful `finance_accrual_by_day` request in the same new finance-accrual family. Its purpose was to distinguish a shared finance-accrual throttle from a method-specific `/v1/finance/accrual/types` provider state.

## Result

The preceding `POST /v1/finance/accrual/by-day` request returned HTTP 200. The next explicit Ozon command, `POST /v1/finance/accrual/types`, reached Ozon and returned provider HTTP 429 with `Retry-After: 1`.

Combined with prior CAP-24 evidence:

1. `finance_accrual_types` returned HTTP 200 at least once for the same account and exact command fingerprint;
2. repeated `finance_accrual_types` calls returned provider HTTP 429;
3. a quiet-baseline `finance_accrual_types` run also returned 429;
4. non-finance `seller_product_list` returned HTTP 200 while `/types` was in the failing state;
5. neighboring `finance_accrual_by_day` returned HTTP 200 in the same finance-accrual family;
6. immediately after that successful `/by-day`, `/types` again returned HTTP 429.

Therefore the failure scope is localized to `/v1/finance/accrual/types` or to provider resource protection specific to that method. The evidence does not support a provider-wide hard block or a hard throttle shared by the entire finance-accrual family as the primary explanation.

## Root-cause class

The final CAP-24 root-cause authority supersedes the earlier provisional wording and records:

`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`

Authority:

`CAP_24_FINANCE_ACCRUAL_TYPES_ROOT_CAUSE_AND_OPERATING_SOLUTION_2026-09-06.md`

The method is a beta reference endpoint. Current Ozon method-workflow documentation warns that many identical or erroneous requests can trigger Seller API restriction without warning, and documents a method-level `Circle is open` state that can recover after several minutes. The observed CAP-24 sequence repeatedly sent the identical no-body `/types` command with the same fingerprint while unrelated and sibling finance methods remained available.

The exact internal request threshold/reset algorithm is not published and must not be invented.

## Correction: no Bridge rate-limit control defect proven

The earlier wording that described the absence of a finance-local `next_allowed_at` as a separate Bridge defect is withdrawn.

For every supplied `/types` attempt Bridge preserved the required invariant:

- one explicit command;
- one physical provider request;
- no hidden retry;
- provider HTTP 429 surfaced to the caller.

Bridge must contact Ozon to obtain current provider data. Without a documented/provider-proven method interval, locally refusing a later explicit request would itself be an invented policy. Therefore the CAP-24 incident does not prove a Bridge rate-limit-control defect.

Current classification:

`NO_BRIDGE_RATE_LIMIT_CONTROL_DEFECT_PROVEN_FOR_THIS_INCIDENT`

## Observability limitation

Bridge transport receives the provider response body, but the model-visible provider error intentionally replaces the raw provider message with a generic safe message, and current diagnostics are payload-free. Consequently the historical 429 evidence cannot recover with literal-message certainty whether Ozon labelled the condition `Circle is open` or used another method-specific `RESOURCE_EXHAUSTED` message.

This is an observability limitation only. It does not cause the 429 and does not justify suppressing later explicit provider requests.

## Operating solution

`/v1/finance/accrual/types` is a reference dictionary, not the changing transaction-data source.

The root-cause-aligned operating pattern is:

1. obtain `/types` only when the dictionary is actually needed;
2. persist the successful provider-derived dictionary with provenance;
3. use `/v1/finance/accrual/by-day` and `/v1/finance/accrual/postings` for changing finance facts;
4. resolve their `type_id` values locally against the persisted dictionary;
5. refresh `/types` only on an evidence trigger such as an unknown `type_id`, explicit user refresh, or verified contract/taxonomy change;
6. if an explicit refresh receives 429, do not hidden-retry; keep known mappings and mark unknown IDs pending until a later explicit refresh.

CAP-24 already captured a 124-row `/types` dictionary in Run 02, and Run 06 proved `/by-day` provides target-SKU-attributable commission, logistics/delivery and acquiring evidence. Therefore repeated `/types` calls are not required to continue the CAP-24 business job.

No executable Bridge patch is authorized by this evidence file.
