# P5.3 Simulated Checkout — Local Evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P5.3-V2-FULL-ACCEPTANCE-CONTINUATION`  
Attempt: `1`  
Status: `LOCAL ACCEPTED — P5.3 ACTIVE`

## V2 recovery continuation

The pre-commit V1 local candidate was reopened before any push after the
different-idempotency-key concurrency defect was identified. Infrastructure
interruption was classified as `PACKAGE_INSTALL_INFRASTRUCTURE`: the default
host Node was v12 and did not provide `pnpm`/Corepack, while the retained,
known PCP Node 24 runtime is `/usr/local/bin/node` v24.20.0 in the retained
Product Control Plane Node 24 container, with `/usr/local/bin/pnpm` v10.34.5.
No uncertain or protected data was removed; recovery headroom remained 82% root
use with 11G free. The original 0010 SHA was
`efaafbff25b75b9844f2b9e30a2f9288b0ea2102c52166292eefb0a5b5c09d77`.
The corrected 0010 SHA is
`28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`.

V2 enforces one `CREATING` checkout per account physically and one actionable
checkout logically: a different key is `CHECKOUT_IN_PROGRESS` for CREATING or
READY/PENDING, cannot receive the incumbent reference/provider IDs, and makes
no provider, payment, or audit write. FAILED history permits a later valid
attempt; READY with a non-PENDING payment fails closed as
`CHECKOUT_CORRUPTED`; a current subscription takes precedence. The corrected
real-PostgreSQL P5.3 suite contains 102 tests. No remote P5.3 history exists;
P5.3 remains ACTIVE and P5.4 remains PLANNED.

## Base, remote, and host safety

- Repository: `MaksimUnimax/blood_sand`
- Branch: `feature/product-control-plane-server-2026-09-04`
- Required/local HEAD: `2276a7d4df4ae14ca0859415e3ced049218811d5`
- Initial worktree: dirty by design with the corrected V2 candidate.
- Remote HTTPS probes, four seconds apart: `2276a7d4df4ae14ca0859415e3ced049218811d5`, `2276a7d4df4ae14ca0859415e3ced049218811d5`.
- The configured SSH URL was auth-blocked; HTTPS was used for the readable canonical branch check. No remote SHA differed.
- Disk start: `82%` used, `11G` free. Only the existing PostgreSQL 18 host container was used; two temporary databases were removed after verification.

## Owner decision and package boundaries

P5 remains simulator-only. No YooKassa/Tinkoff-T-Bank implementation, SDK,
credential, merchant secret, webhook secret, external payment URL, network
request, payment instrument, real checkout, or real money exists. Real payment
go-live remains deferred until a dedicated later architecture and acceptance
stage.

`@product/billing` owns strict checkout contracts, `BillingProviderPort`,
provider-neutral orchestration, SHA-256 idempotency/fingerprint helpers, and
typed results. It depends only on `@product/commercial-catalog`, `zod`, and
Node standard library; it has no DB/Fastify/apps/device/Bridge dependency.
`@product/billing-simulator` depends only on `@product/billing`, uses provider
key exactly `simulator`, and has no DB/HTTP/fetch/axios/undici/outbound network,
clock, randomness, or credentials.

## Migration, table, and physical integrity

- Migration files are exactly `0000..0010`; `0011` is absent.
- `0009_p5_1_subscription_billing_foundation.sql` is byte-identical with SHA-256 `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`.
- `0010_p5_3_checkout_intents.sql` SHA-256: `28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`.
- Migration ran twice successfully on PostgreSQL 18.
- Exactly one new table exists: `checkout_intents`; no other P5.3 table was added.
- States are exactly `CREATING`, `READY`, `FAILED`.
- The table stores no raw provider request/response, payload, secret, URL, or arbitrary JSON column.
- FKs use account/price-revision/plan-revision/payment `ON DELETE RESTRICT`; delete is rejected.
- Physical checks enforce provider machine key, lowercase SHA-256 hashes, safe amount/currency/interval ranges, safe opaque provider strings/reference, stable failure code, and timestamp ordering.
- Insert requires `CREATING` with all provider/payment/failure/completion fields null.
- The trigger verifies published exact price/plan revisions, exact plan relationship, exact monetary/interval terms, and the admitted half-open price window. It deliberately does not re-evaluate mutable stable plan/price status or sale assignment.
- Only `CREATING -> READY` and `CREATING -> FAILED` are allowed. READY requires all provider/reference/payment fields and a matching `PENDING` payment; FAILED requires a failure code/completion and discards all provider/payment references. Terminal identity/snapshot fields are immutable.
- Required account/key, partial provider checkout/payment, and partial payment uniqueness constraints are present.

## Provider, idempotency, and admission

The port input contains only `providerRequestId` (the checkout intent UUID),
amount, currency, and frozen billing interval terms. CREATED results contain
bounded opaque `providerCheckoutId`, `providerPaymentId`, and
`checkoutReference`; REJECTED and UNAVAILABLE are values. The reference is a
non-secret opaque simulator token, never a URL. Simulator SUCCESS, REJECTED,
UNAVAILABLE, and UNAVAILABLE_THEN_SUCCESS scenarios are deterministic;
domain-separated SHA-256 IDs are stable for a request ID and differ for a
different request ID.

The raw idempotency key is never persisted, audited, logged, or sent to the
provider. Its lower-case SHA-256 uses
`product-control-plane/checkout-idempotency/v1`. The request fingerprint uses
`product-control-plane/checkout-request/v1` and only account ID plus exact
price-revision ID; provider is excluded. Same account/key plus a different
fingerprint returns `IDEMPOTENCY_KEY_REUSED`; another account may reuse the raw
key. A provider mismatch returns `CHECKOUT_PROVIDER_MISMATCH`.

New admission captures one server `now` and calls the exact P4.5
`PurchasableOfferResolver`. All P4.5 codes are preserved, and rejected
pre-admission requests create neither intent, payment, nor audit. The admitted
plan revision, price revision, amount, currency, interval, and admitted time
are immutable. A retry of an admitted CREATING intent does not rerun P4.5 and
survives later sale closure/selection change; a new request after closure does
not.

## Authorization, locking, and payment

The repository requires account existence, an `ACCOUNT_USER` actor who is an
`OWNER`, and account status `ACTIVE`. Any current subscription other than
`EXPIRED` blocks the new-subscription-only flow. Expired history is allowed.
No renewal, migration, upgrade/downgrade, subscription activation, or
commercial device-limit production wiring was added.

Prepare and finalization reuse `p5-subscription-account:<accountId>` exactly.
Prepare locks account, rechecks policy/idempotency, and atomically writes the
CREATING intent plus `CHECKOUT_INTENT_CREATED`. Finalization locks account then
checkout `FOR UPDATE`, rechecks account/current subscription, and atomically
writes payment, checkout terminal state, and audit. No DB transaction or lock
is held during the provider call.

SUCCESS creates exactly one P5.1 payment with account exact, provider
`simulator`, exact admitted price/terms, matching idempotency hash and
fingerprint, `PENDING`, `subscription_id NULL`, and no subscription transition.
P5.3 creates no `billing_events`. Concurrent same-key calls converge on one
intent/payment/reference because providerRequestId is the intent ID and the
provider contract is idempotent. Manual grant and account-suspension races are
rechecked at finalization and produce no payment when they win during the
provider call. READY replay while suspended/current is safe rejection without
mutating financial history or returning the reference.

## Audit and documentation

Exact actions are `CHECKOUT_INTENT_CREATED`, `CHECKOUT_READY`, and
`CHECKOUT_FAILED`, targeting `CHECKOUT_INTENT` with `ACCOUNT_USER` actor and
the supplied correlation ID. Safe metadata is allowlisted and excludes raw
keys, checkout/provider references, raw payloads, credentials, and secrets.
Intent+CREATED audit, payment+READY+audit, and FAILED+audit are atomic.
Injected prepare/READY/FAILED audit failures roll back their complete write;
retry recovers. Replay, provider unavailable retry, and pre-admission
rejection add no audit.

ADR-0022 records the simulator-only owner decision, checkout-only port,
immutable snapshot, provider-independent idempotency, lock/race policy,
audit atomicity, opaque reference rule, compensation/reference-retention
review required before real provider side effects, and deferred P5.4 event
ingestion. `ROADMAP.md` records P5.3 `ACTIVE` and P5.4 `PLANNED`; P5.3 is not
marked done.

## Test and freeze gates

- Unit: `356/356`, zero failures and zero skip/todo; P5.3 package coverage is billing `51/51` plus simulator `11/11`.
- Real PostgreSQL integration: `620/620`, zero failures and zero skip/todo; P5.3 is `102/102`.
- Retained suites: P5.2 `90`, P5.1 `94`, P4.6 `38`, P4.5 `52`, P4.4 `48`, P4.3 `52`, P4.2 `21`, P4.1 `30`.
- Crypto: `12/12`.
- E2E: `24/24`, zero failures/skips/retries.
- DB-down install, lint, format check, typecheck, unit test, OpenAPI check, Bridge guard, and build: PASS.
- DB-up lint, format check, typecheck, unit test, full integration, migrations twice, OpenAPI check twice, Bridge guard, and build: PASS.
- OpenAPI remains 16 route/method tuples; both checks retain SHA `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- No HTTP route, bootstrap change, production device-limit change, or Bridge change.

## Recovery/final state

After all gates, a Git-aware patch/archive/manifest freeze was created under
`/var/backups/product-control-plane/git/`; the manifest records the technical
ID, base, hashes, sorted untracked candidates, ADR/evidence/roadmap/migration
hashes, and freeze verification. The repository intentionally remains dirty
with these uncommitted P5.3 candidates. No commit, push, deployment, or P5.4
work was performed.

## P5.3 LOCAL CORRECTION V2

The prior local candidate was reopened before commit or push because its
same-key idempotency proof did not prevent a cross-idempotency multi-checkout
race. Its historical migration SHA was
`efaafbff25b75b9844f2b9e30a2f9288b0ea2102c52166292eefb0a5b5c09d77`.
The correction adds stable `CHECKOUT_IN_PROGRESS`, account-lock serialized
different-key admission, one-CREATING-per-account physical uniqueness in 0010,
and READY/PENDING blocking. READY payment states unsupported by P5.3 fail
closed; P5.4 owns their later policy. FAILED history does not block a new
attempt. No remote history existed for the prior local candidate.

The V2 migration first and second runs passed against a fresh disposable
PostgreSQL 18 database. Full DB-up and DB-down acceptance passed under the
retained Node 24 runtime; E2E passed `24/24`. The final recovery freeze was
recreated and byte-for-byte verified after these results.
