# P4.6 Security / Architecture Final Acceptance — Local Evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P4.6-COMMERCIAL-SECURITY-ARCHITECTURE-FINAL-AUDIT-LOCAL`

Attempt: `1`

Status: **ACCEPTED — P4.6 DONE / P4 FINAL ACCEPTED**

This is a local acceptance record for the complete P4 commercial foundation. It is not a production launch security gate and does not start P5.

## Base and accepted ancestry

- Branch: `feature/product-control-plane-server-2026-09-04`
- Base/current HEAD: `178e21c1dd3874fe6d6bd350be69a9c840c87f67`
- P3 final: `56733bbbe4633d66e940e9eebbce0cd728849f40`
- P4.1 final: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`
- P4.2 final: `20cf3adbef703ad4cb5a478dbab8a81e731b8609`
- P4.3 final: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- P4.4 final: `3631412c8780da857932ea957b32ce231cef54d1`
- P4.5 final: `178e21c1dd3874fe6d6bd350be69a9c840c87f67`
- `P4_ACCEPTED_CHAIN_LINEAR=YES`: each checkpoint descends linearly from the preceding checkpoint.

The remote was checked twice at the start and twice at the end, with 3–5 seconds between checks. Every check returned `178e21c1dd3874fe6d6bd350be69a9c840c87f67`.

## Durability checkpoints

All five existing accepted bundles were present, had the required byte length and SHA-256, and passed `git bundle verify`. They were not overwritten.

| Checkpoint | Bytes | SHA-256 | Verification |
| --- | ---: | --- | --- |
| P4.1 | 3,761,838 | `d343838060a8ece48287a35afc22b222bb428e83e9192d9f0bac26f2946fe9c4` | PASS |
| P4.2 | 3,782,801 | `fb96260b7794cb756c262599b973a39b63014873e57d8bc756052c36fc6baf7c` | PASS |
| P4.3 | 3,805,619 | `3bd5373784ef5f290f422b878dda307c750b9707d8d1351f8d72982dcd00ea47` | PASS |
| P4.4 | 3,827,231 | `2813edb9902bf4f386a393fdc358c417c854f73d777c10bb39500594a5bf53f6` | PASS |
| P4.5 | 3,859,443 | `bcb692a72ed0a3718c6100e670c0d2f07a4954e5730056664dacfc4673906405` | PASS |

`ALL_HASHES_MATCH=YES`; `ALL_VERIFY_PASS=YES`.

## P4 diff, workflow and supply chain

The complete P3-final to P4.5-final diff contains 56 changed files. Every file was classified as P4.1 persistence, P4.2 plans and entitlements, P4.3 pricing, P4.4 resolution and overrides, P4.5 catalog/read interfaces, or documentation/test/wiring. No file was unexplained.

The classified implementation areas are:

- P4.1: commercial migration/schema and persistence adapters.
- P4.2: plans, entitlement definitions, plan revisions, commands, adapters, tests and ADR/evidence.
- P4.3: prices, price revisions, sale assignments, selection, adapters, tests and ADR/evidence.
- P4.4: account overrides, entitlement resolution, device-limit port/adapter, adapters, tests and ADR/evidence.
- P4.5: public catalog contracts/route, P5/P6 read interfaces, API wiring, tests and ADR/evidence.
- Documentation/test/wiring: roadmap, API contract updates, OpenAPI and accepted evidence, plus the pre-existing P2 auth integration wiring in the full P4 diff.

`P4_BRIDGE_SOURCE_DIFF=EMPTY`: the requested P3-to-P4 diff for `tooling/llm-api-bridges/ozon-seller` is empty. No Bridge source was changed.

`.github/workflows/server-ci.yml` has no P4 workflow drift. The workflow still uses SHA-pinned actions, Node `24.20.0`, pnpm `10.34.5`, and the committed lockfile. No unpinned external action was introduced.

## Migration and schema scope

`0000` through `0008` are the complete migration set; `0009` is absent. Historical hashes are unchanged:

```text
0000 9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56
0001 0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f
0002 f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449
0003 ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6
0004 38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d
0005 6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21
0006 37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f
0007 1c8c32d6f9ea073788507736f06daaa67dee2f74465d2b990eb7fbcc67d0abe6
0008 d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1
```

The commercial schema remains exactly: `plans`, `plan_revisions`, `entitlement_definitions`, `plan_entitlements`, `account_entitlement_overrides`, `prices`, `price_revisions`, and `price_sale_assignments`. There is no `subscriptions`, `payments`, `billing_events`, `checkout_intents`, `account_current_plan`, `account_plan_assignments`, or `account_current_price`, and no current-plan/current-price surrogate column. The live migrated schema was inspected; `accounts` remains limited to its existing identity/status fields.

Both migration runs passed and produced no schema drift. `MIGRATION_CHANGED=NO`; `SCHEMA_CHANGED=NO`.

## Architecture and security audit

The commercial domain dependency graph passed:

```text
plans ───────────────┐
pricing ──────────────┼──> shared / zod
entitlements ────────┘
commercial-catalog ──> plans / pricing / shared / zod
db adapters ─────────> domain packages
```

The domain packages do not import `@product/db`, Fastify, `apps/*`, Bridge runtime, billing provider code, or subscription implementation. The dependency direction is one-way toward the domain from DB adapters: `COMMERCIAL_DOMAIN_DEPENDENCY_GRAPH=PASS`.

All P4 DB adapter values use parameterized SQL placeholders. Interpolated SQL is restricted to static controlled structure such as fixed lock modes and fixed optional predicates; public/user values are not used as SQL identifiers or fragments. Expected business errors are mapped at the domain/API boundary and do not expose SQLSTATE or raw SQL.

The P4 lock graph was inspected, not inferred from deadlock absence:

- plan mutation: `p4-plan:<planId>`;
- price mutation: `p4-plan:<planId>` then `p4-price:<priceId>`;
- price creation: `p4-plan:<planId>` then `p4-price-code:<code>`;
- account entitlement mutation: `p4-account-entitlement:<accountId>:<entitlementKey>` plus the account/definition row locks;
- definition consumers use `FOR SHARE`, while definition mutation/deprecation uses `FOR UPDATE`;
- P4.5 catalog/read paths use read-only MVCC/`REPEATABLE READ` and no commercial mutation lock.

No lock-order cycle was found: `P4_LOCK_GRAPH_CYCLE_FOUND=NO`.

The P4.1 physical protections remain active: stable identities, published revisions and compositions are immutable; entitlement semantic identity is immutable; deprecation is one-way; sale assignments and account overrides are append-only; and historical commercial references are protected from destructive cascade.

## Stage audits

### P4.2 plans and entitlement definitions

PASS. Revision numbers are server allocated. Draft fingerprints protect against stale updates. Published revision composition cannot be mutated. Plan archival is terminal, and ACTIVE/HIDDEN requires a published revision. Entitlement identity, type and classification are stable; deprecation blocks future composition SET/publication as contracted. All accepted command mutations and their audit events commit atomically, with no audit for rejected, read-only or semantic no-op operations. No P6 HTTP/admin RBAC transport was added.

### P4.3 prices and grandfathering

PASS. Price revisions are server allocated and use integer minor units, uppercase currency and DAY/MONTH/YEAR intervals. Published revisions are immutable. Plan locks precede price locks. Assignments are append-only and highest effective `assignment_revision` is authoritative. `NULL` closes a window; selection is `[from,to)`; expiry fails closed with no fallback. A 19000-to-29000 switch preserves the old published revision and selects the new one only after its effective time.

### P4.4 commercial entitlement resolution

PASS. Resolution takes an explicit `planRevisionId`; no account current-plan authority exists. Override SET/CLEAR history is append-only with server revision allocation, expected-latest concurrency, duplicate no-op handling, supersession-first ordering, no older-row resurrection, and linearizable SET/deprecation coordination. CLEAR is allowed after deprecation. Historical deprecated definitions and archived-plan exact published revisions remain readable internally. Explanation objects are bounded and do not expose freeform override reasons.

`device.max_active` exists as a stable commercial key and `AccountPlanRevisionBindingPort` exists as an abstract boundary. No concrete P5 binding is present and `BoundCommercialDeviceLimitResolver` is not production-wired. Production remains `PreEntitlementDeviceLimitResolver` with `PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT=1`.

### P4.5 public catalog and P5/P6 boundaries

PASS. `GET /v1/plans/public` is public, requires `marketKey` and `channelKey`, rejects unknown fields, and returns `Cache-Control: no-store`. The response is commercial metadata only: no account, subscription, override, explanation, audit, payment or seller data. Public sellability exactly follows P4.3: active plan and price, exact market/channel, highest effective assignment revision, NULL closure, no fallback, exact published plan revision, and `[from,to)` boundaries.

`PurchasableOfferResolver` requires the exact currently selected sellable `priceRevisionId`; a merely published historical revision is insufficient. It contains no eligibility, subscription, payment, checkout or provider logic. `CommercialCatalogInspectionReader` is internal-only and retains all plan/price history, including non-public historical states, without admin HTTP, RBAC, mutation transport, or freeform assignment reason.

## Bootstrap, data plane and remote capability boundaries

Production bootstrap remains:

```json
{
  "subscription": { "state": "NONE", "planRevision": null },
  "entitlements": {}
}
```

No commercial state is wired into bootstrap, and the production device-limit baseline remains 1. Review of the actual P4-changed DTO, schema, persistence and route boundaries found no new storage or transport for Ozon credentials, raw seller orders/finance/datasets, customer contact data, complete AI conversations, payment data, or provider payloads. The commercial catalog carries only commercial metadata.

P4 did not expand the P3 remote capability boundary: no arbitrary JavaScript, `eval`, WASM, remote module URL, or provider URL/method/header/auth expansion was introduced.

## API and OpenAPI

The generated OpenAPI contains exactly 16 route/method tuples. Two independent generation/check runs produced the exact accepted SHA:

`038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`

`GET /v1/plans/public` occurs once and `POST /v1/bootstrap` occurs once. No subscription, billing, checkout or admin commercial mutation route exists. `OPENAPI_CHANGED=NO`.

## Cross-stage real PostgreSQL assurance

Added `server/integration/p4-6-commercial-final-audit.integration.test.ts` with 38 distinct named real-PostgreSQL cases. The suite covers the full lifecycle and exact IDs/terms/value across P4.3 selection, P4.4 resolution, P4.5 public catalog and the P5 exact resolver; immutable history; grandfathering; NULL closure; effective-time boundary and no-fallback behavior; non-monotonic assignment authority; plan/archive and entitlement/deprecation serialization; stale expected-latest concurrency; SET/CLEAR and no-resurrection behavior; public/internal separation; zero-audit reads; no-op history; injected audit rollback; repeatable-read catalog coherence; device-limit adapter boundary; and exact money/currency/period preservation.

The suite passed `38/38`, `0` failures, `0` skips/todos. Its assertions inspect final database state, rollback absence, immutable rereads, history/audit counts, and serialized privacy boundaries.

## Regression gates

- DB-down install/lint/format/typecheck/unit/OpenAPI/Bridge/build: PASS.
- DB-up lint/format/typecheck/unit/integration/migrations/OpenAPI/Bridge/build: PASS.
- Unit: `253/253`, 0 failures, 0 skips/todos.
- Crypto: `12/12`.
- Integration: `334` passed, 0 failures, 0 skips/todos. This is the accepted 296 baseline plus 38 P4.6 cases; stage totals remain P4.1 `30`, P4.2 `21`, P4.3 `52`, P4.4 `48`, P4.5 `52`.
- E2E: `24/24`, 0 failures, 0 skips, 0 retries.
- First and second database migrations: PASS.
- OpenAPI generation/check twice: exact accepted SHA both times.

## Findings and corrections

- CRITICAL open: 0.
- HIGH open: 0.
- MEDIUM open affecting P4 correctness/security: 0.
- LOW open: 0.
- INFORMATIONAL open: 1 existing build warning from the Next.js ESLint plugin detection; it is unrelated to P4 correctness/security and has no P4 acceptance impact.

No P4 implementation defect was found and no product source correction was made. The only candidate implementation addition is the dedicated P4.6 cross-stage audit suite. No migration, schema, OpenAPI, workflow, lockfile, package, Bridge or production bootstrap change was made.

## Deferred production gates

`P4_SECURITY_ARCHITECTURE_AUDIT=PASS` means the P4 commercial foundation is internally coherent and locally accepted. `PRODUCTION_LAUNCH_SECURITY_GATE=DEFERRED` remains explicit. The following are later-stage gates, not P4 failures: billing webhook authentication/idempotency, payment reconciliation, subscription lifecycle, checkout, admin MFA/RBAC, diagnostics secret-field rejection/privacy, production backup restore drill, production secret separation validation, and current Bridge integration with final credential/raw seller-payload boundary acceptance at P11. P4 local acceptance is not permission to launch real users.

## Roadmap and freeze

The roadmap is finalized as P4 DONE, with P4.1–P4.6 DONE and P5 NEXT. P5 is not started and no P5 implementation was executed.

Initial root disk was approximately 80% used with 12 GiB free; final validation remains below the 85% safety threshold. Only the exact disposable P4.6 PostgreSQL container, temporary extraction directory and temporary E2E result output are to be removed after freeze verification. Protected host services remain active.

Recovery artifacts are recorded outside the repository in the final manifest:

`/var/backups/product-control-plane/git/blood_sand-p4.6-local-accepted-uncommitted.patch`

`/var/backups/product-control-plane/git/blood_sand-p4.6-local-accepted-untracked.tar.gz`

`/var/backups/product-control-plane/git/blood_sand-p4.6-local-accepted.manifest.txt`

The candidate is frozen only after tracked-diff byte comparison and exact untracked member/content comparison pass. No commit or push was performed before the audit commit.

## Remote finalization

- `P4_6_AUDIT_SHA=7c934f1a597add7508d9fb35c89ba4a250cce661`.
- Audit-head Server CI: run `34024595887`, [workflow run](https://github.com/MaksimUnimax/blood_sand/actions/runs/34024595887), `SUCCESS`.
- `REMOTE_P4_FINAL_REVIEW=PASS`.
- Regression results: unit `253/253`; integration `334`; P4.6 `38`; P4.5 `52`; P4.4 `48`; P4.3 `52`; P4.2 `21`; P4.1 `30`; crypto `12/12`; E2E `24/24`.
- OpenAPI: `16` route/method tuples; SHA `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- Migrations: `0000..0008`; migration `0008` SHA `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1`.
- Open findings: Critical `0`; High `0`; material Medium `0`; Low `0`; Informational `1` existing Next.js ESLint-plugin warning.
- Product defects found in P4.6: `NONE`; product defects corrected: `NONE`.
- `P4_SECURITY_ARCHITECTURE_AUDIT=PASS`.
- `PRODUCTION_LAUNCH_SECURITY_GATE=DEFERRED`.
- P5 execution: `NOT EXECUTED`.
