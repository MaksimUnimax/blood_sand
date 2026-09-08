# P6.3 admin subscription and billing operations — local evidence

LOCAL ACCEPTED — P6.3 ACTIVE

## Base and runtime

- Technical ID: `PRODUCT-CONTROL-PLANE-P6.3-ADMIN-SUBSCRIPTION-BILLING-OPERATIONS-LOCAL`
- Attempt: `1`
- Base/local HEAD: `93a8bb4541e58126251040b6c2ff8f9dd8f80dbb`
- Remote start reads: both `93a8bb4541e58126251040b6c2ff8f9dd8f80dbb`
- Node: `v24.20.0`
- pnpm: `10.34.5`
- Node 12 used: `NO`

## Schema and architecture

- Migration set: `0000..0012`; no `0013`.
- Migration 0012 SHA-256: `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`.
- `@product/admin-billing` contains P6.3 application contracts/orchestration
  and has only the permitted application dependencies.
- P5 command reuse: `YES`; all grant, extend, suspend, and restore operations
  delegate to the accepted P5 command repository.
- P5 optional `beforeMutation` hook: `YES`; existing no-hook callers retain
  their behavior.
- Shared transaction-time admin authorization: `YES`; the actor principal is
  locked `FOR UPDATE`, current grants are reloaded, and the lock survives the
  P5 mutation transaction. P6.2 operations use the same primitive.
- Direct subscription SQL in admin layer: `NO`.
- Duplicate subscription audit: `NO`; P5 remains audit authority.

## HTTP and behavior

Exactly seven P6.3 route/method tuples were added:

1. `GET /v1/admin/accounts/{account_id}/billing/payments`
2. `GET /v1/admin/accounts/{account_id}/billing/events`
3. `GET /v1/admin/accounts/{account_id}/billing/reconciliation-jobs`
4. `POST /v1/admin/accounts/{account_id}/subscription/grant`
5. `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/extend`
6. `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/suspend`
7. `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/restore`

- OpenAPI method tuples: `40`.
- OpenAPI generation SHA 1: `9b211667b35c117e49305cb22504405260bc60ec6a998a086f62265d9857936f`.
- OpenAPI generation SHA 2: `9b211667b35c117e49305cb22504405260bc60ec6a998a086f62265d9857936f`.
- Route permissions: `billing.read`, `subscription.grant`,
  `subscription.extend`, `subscription.suspend`, and `subscription.restore`.
- GET routes do not require CSRF; POST routes require valid admin CSRF.
- Grant/extend/suspend/restore pass `ADMIN`, the acting principal ID, request
  ID, and the validated P6.2 admin reason into P5.
- Extend, suspend, and restore enforce immutable account/subscription binding.
- P5 failure mapping is deterministic: resource not found, stale state,
  conflict, forbidden, and service unavailable admin envelopes.
- Strict safe mutation responses exclude state/transition/audit reasons and
  provider data.

## Billing read privacy

Payments, billing events, and reconciliation jobs are account-scoped,
parameterized, explicitly projected, bounded to 1–100, and cursor-scoped.
Empty existing accounts return empty pages; missing accounts return the admin
resource-not-found result. Projections exclude provider, provider payment ID,
idempotency hash, request fingerprint, event identity, payload hash/raw payload,
and reconciliation lease token. Inconsistent cross-account event links fail
closed. Reads do not create audit events.

No real provider, external payment call, checkout HTTP, webhook HTTP, payment
mutation HTTP, reconciliation mutation HTTP, admin UI, P6.4 work, or P7 work
was added. Payment go-live remains `DEFERRED`.

## Test evidence

- DB-down gate: `PASS` (`pnpm install --frozen-lockfile`, lint,
  format:check, typecheck, test, openapi:check, bridge:guard, build).
- DB-up gate: `PASS`, including full integration and migration twice.
- Unit/API baseline: `815`.
- New P6.3 unit/API instances: `46`.
- Unit/API actual total: `861`.
- Unit/API distinct meaningful P6.3 cases: `46`.
- Unit/API duplicate padding: `0`; failures: `0`; skips/todos: `0`.
- Crypto: `12/12`.
- Full integration baseline: `1271`.
- P6.3 integration instances: `72`.
- P6.3 distinct meaningful cases: `72`.
- Full integration actual total: `1343` (`1271 + 72`), 31 files passed,
  0 failures, 0 skips/todos.

P6.3 integration inventory:

| Group | Coverage | Distinct |
| --- | --- | ---: |
| A | transaction-time admin authorization | 8 |
| B | grant | 12 |
| C | extend | 10 |
| D | suspend | 8 |
| E | restore | 9 |
| F | billing reads | 18 |
| G | concurrency/regression | 7 |
| **Total** |  | **72** |

Count-integrity audit: `EXACT_DUPLICATE_ROWS=0`, `SEMANTIC_PADDING=0`,
`COUNT_INTEGRITY=PASS`; no parameterized duplicate rows were used.

Retained integration stage counts: P6.2 `106`; P6.1 `77`; P5.7 `80`; P5.6
`152`; P5.5 `120`; P5.4 `116`; P5.3 `102`; P5.2 `90`; P5.1 `94`; P4
`38/52/48/52/21/30`.

- E2E: `32/32` passed, 0 failures, 0 skips, 0 retries.
- Build: `PASS`.

## Documentation and freeze

- ADR-0028: accepted.
- API contracts: targeted P6.3 section added.
- ROADMAP: P6 active; P6.1/P6.2 done; P6.3 active; P6.4/P6.5/P6.6
  planned; P7–P15 planned. P6.3 is not marked done.
- Recovery artifacts and candidate reconstruction are recorded in the final
  manifest under `/var/backups/product-control-plane/git/`.

## Remote acceptance attempt 1 — BLOCKED_CI

- Implementation SHA: `3ca8afa3ec55523353b89a638e31855205399ccc`.
- Failed Server CI run: `34193907729` at the implementation SHA.
- Exact failure: the old `@product/simulated-extension-client` test in
  `server/packages/simulated-extension-client/src/policy.test.ts`,
  `P3.6 cache and policy` / `fails closed for tampered signature cache
  records`, expected `UNAVAILABLE / CACHE_INVALID` and observed `READY`.
- The identical failing test blob (`d5a6ade84fb91e58062b403f0dfaa9b1ef3d605a`)
  existed at the P6.2 base, so `P6_3_CHANGED_FAILING_TEST=NO`.
- Root cause: the random Ed25519-key signature fixture changed only the first
  base64url character to `A`, which could be a no-op when the signature already
  started with `A`.
- Classification: `PRE_EXISTING_TEST_FLAKE`; `P6_3_PRODUCT_DEFECT=NO`;
  `CRYPTO_VERIFIER_DEFECT=NO`.
- Correction: tamper decoded signature bytes by flipping one bit and re-encode
  as base64url, with explicit string and decoded-byte inequality assertions.
  The payload tamper fixture was audited and now uses the same guaranteed
  decoded-byte mutation. `ALL_TAMPER_FIXTURES_GUARANTEED_TO_CHANGE=YES`.
- Repeated fresh-process proof: `128/128 PASS`.
- Current unit total: `861`; crypto `12/12`; OpenAPI `40` with SHA-256
  `9b211667b35c117e49305cb22504405260bc60ec6a998a086f62265d9857936f`;
  migrations `0000..0012`, no `0013`.

P6.3 remains `LOCAL ACCEPTED — P6.3 ACTIVE` pending correction-head Server CI,
remote P6.3 review, and final documentation acceptance.
