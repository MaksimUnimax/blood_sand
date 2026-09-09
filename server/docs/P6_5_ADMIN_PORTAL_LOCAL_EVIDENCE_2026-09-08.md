# P6.5 Admin Portal Local Evidence — 2026-09-08

Status: **P6.5 FINAL REMOTE ACCEPTANCE — PASS**

Technical ID: `PRODUCT-CONTROL-PLANE-P6.5-ADMIN-PORTAL-OPERATIONS-UX-LOCAL`
Attempt: `4` (accepted implementation)

## Historical acceptance and rejection record

1. The original P6.5 candidate local suite initially reported PASS; the
   first independent product-safety review rejected it for D01–D04.
2. Corrected candidate `1f869e85df877f2b4c6021d64a1411aa6cccddf8` was
   reconstructed; the second independent review rejected it because D02, D03,
   and D04 remained open, D01 had no behavioral proof, the admin logout CSRF
   regression existed, and the safety evidence was incomplete.
3. Attempt 3 was reconstructed as tree
   `1c03080bb400f83ddbf5211bb247a98844d78f0c`.
4. Attempt 3 received a product-safety PASS, but the shipped-entrypoint
   review rejected it because `pnpm test:e2e` ran from `server/e2e` and the
   migration command failed with `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND`.
5. Attempt 4 was reconstructed as tree
   `77b56750d0264f59affa7925fc076af1ba5085ca`.
6. Attempt 4 local acceptance passed all required safety, contract, build,
   and shipped-entrypoint E2E gates.
7. The independent Attempt 4 final review passed and marked it safe to commit.
8. The implementation commit, parent, and tree are recorded below.
9. The exact-SHA push-triggered Server CI result is recorded below.
10. Independent GitHub readback of the implementation commit is recorded
    below.
11. The remote product-safety verdict is recorded below; P6.5 is DONE and
    P6.6 remains NEXT.

## Base and runtime

- Canonical worktree: `/opt/product-control-plane-src/blood_sand`
- Branch: `feature/product-control-plane-server-2026-09-04`
- Historical Attempt 1–3 content base: `fdf66f8c2cc89de0f861a20221ca0a26f342d2e8`
- Final implementation parent: `191f1a2d392f1e12cf5f0a34989a88e0788a9cb6`
- Node: `v24.20.0`
- pnpm: `10.34.5`
- Host Node 12 used: `NO`
- Remote was read over accepted deploy-key SSH443 and HTTPS fallback; both matched.

## Admin application

The former P1 placeholder was replaced by one dedicated Next 15/React 19 admin application at `server/apps/admin/`.

Page routes:

`/login`, `/`, `/accounts`, `/accounts/[accountId]`, `/users`, `/principals`, `/audit`, `/commercial/plans`, `/commercial/plans/[planId]`, `/commercial/prices`, `/commercial/prices/[priceId]`, `/commercial/entitlements`, `/compatibility`.

The dashboard uses only `/v1/admin/me`; no invented aggregate endpoint or background domain prefetch exists. Navigation and action visibility use server-returned permissions. The layout is responsive, semantic, keyboard-operable, and exposes status/error feedback with live regions.

## BFF and authentication

- BFF route: `app/api/control-plane/[...path]/route.ts`.
- Origin validation: `CONTROL_PLANE_API_ORIGIN`, HTTP/HTTPS only, no credentials, query, hash, or non-root path.
- Closed static allowlist: **51 tuples** = **2 OTP tuples** + **49 accepted admin tuples** from P6.1–P6.4.
- Arbitrary `/v1/*`, future admin paths, extra segments, traversal, encoded slash/backslash abuse, and wrong methods are rejected with 404 before upstream access.
- Request headers forwarded: `content-type`, `cookie`, `x-csrf-token` only.
- Response headers forwarded: `content-type`, `cache-control`, `pragma`, `retry-after`, and `set-cookie` only.
- Every upstream request uses `cache: "no-store"`. Network failure returns safe `503 SERVICE_UNAVAILABLE`.
- Login starts with `/v1/admin/me`; current non-HttpOnly `pcp_csrf` can elevate through `/v1/admin/session`; otherwise the existing OTP request/verify flow is used and then elevation is performed.
- OTP challenge ID, OTP code, email, CSRF values, and session tokens remain out of persistent browser storage and URLs. Session-token cookies are never read by JavaScript.
- Explicit logout uses `DELETE /v1/admin/session` with `pcp_admin_csrf`, clears in-memory privileged state, and does not locally revoke or silently re-elevate the portal session.

## Exposed operations

- Accounts/users: exact accepted filters, safe projections, cursor continuation, and account workspace.
- Account workspace: permission-separated subscription, device, billing, override history, and server-resolved effective entitlement sections.
- Subscription: grant, extend, suspend, restore with loaded state revision and no automatic replay.
- Devices: safe list and confirmed revoke, followed by re-read.
- Billing: safe payment, event, and reconciliation reads with cursor support; provider identities, raw payloads, hashes, event identity, and lease tokens are not rendered; no payment mutation exists.
- Principals/audit: list, create, exact role grant/revoke, suspend/restore, and safe audit projection. Accepted roles are `ADMIN_OWNER`, `ADMIN_OPS`, `ADMIN_SUPPORT`, and `ADMIN_BILLING_READONLY`; first-owner bootstrap remains CLI-only.
- Plans/prices: list/create, draft revision creation/update, entitlement set/remove, publish, status, archive, price sale assignment, and current server fingerprint use.
- Entitlement definitions: create, description update, deprecate, exact type/classification constraints, and the fixed note `Server entitlement does not add client capability by itself.`
- Compatibility: accepted revision publication fields only, with visible `REVISION_PUBLISHED_NOT_AUTO_ACTIVATED` and `linkedConfigVersions`; publishing is never labeled activation.

## Mutation and error safety

Mutations use the shared pending/duplicate guard where the accepted UI
coordinator is used. Required reasons are entered by the operator, cleared
only after success, and never logged. Stale/conflict responses are terminal:
the request count remains one, no automatic retry occurs, the affected
authoritative resource is re-read, the old review is invalidated, and the UI
requires a fresh review against the refreshed state. Draft entitlement SET
uses the shared review lifecycle. Override SET/CLEAR use the loaded
`revision`; if it is unavailable, dispatch fails closed. Admin logout sends
admin CSRF and clears in-memory state only after server success. High-impact
publish/archive/remove/deprecate/close-sale actions show target, action, and
reason before confirmation. Raw upstream bodies, stack traces, SQLSTATE, HTML,
and provider payloads are not displayed.

## Contract and boundary evidence

- No Fastify route, domain behavior, permission, database schema, migration, payment provider, or Bridge change.
- Control-plane OpenAPI remains **67 routes** with SHA256 `eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`; generation/check was run twice.
- Migrations remain `0000..0012`; `0012_p6_1_admin_security_foundation.sql` SHA256 is `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`; no `0013` exists; migration ran twice successfully.
- Generic feature-rule UI, AI/profile UI, Health UI, diagnostics UI, provider integration, P6.6, P7, P8, and P9 were not started.

## Test ledger and gates

P6.5 tests are physical and behavior-bearing; the Attempt 3 additions include
component/UI-path browser tests for D01–D04 and logout, plus no snapshot-only,
UUID-only, duplicate, semantic, or count-inflation cases.

| Group | Meaningful P6.5 unit/component/BFF cases | Admin browser cases |
|---|---:|---:|
| BFF | 76 | — |
| AUTH | 12 | 3 |
| PERMISSIONS | — | 3 |
| ACCOUNT | — | 7 |
| PRINCIPALS_AUDIT | — | 4 |
| COMMERCIAL | — | 9 |
| COMPATIBILITY | — | 1 |
| FAILURE_UX | — | 4 |
| **Previous candidate total** | **88** | **31** |
| **Attempt 3 additions** | **1** | **6** |
| **Attempt 3 total** | **89** | **37** |

- Full unit total: **1,103 passed in 58 files**.
- Full integration total: **1,456 passed in 32 files**. Retained stage counts remain P6.4 `113`, P6.3 `72`, P6.2 `106`, P6.1 `77`; P5 `80/152/120/116/102/90/94`; P4 `38/52/48/52/21/30`.
- Browser E2E: **69 passed, 0 skipped, 0 retries**, including the 6 new safety tests. Admin browser flows use the real BFF and real control-plane API with the disposable PostgreSQL fixture; safety tests use the actual rendered UI handlers and deterministic network controls for stale/error proof.
- D01 UI proof: double-click `1`, repeated confirm `1`, keyboard/repeated activation `1`; pending releases on success, ordinary error, and stale/conflict.
- D02 UI proof: initial `R1`, one mutation, zero automatic retries, authoritative refresh to `R2`, old review invalidated, fresh review required, later request uses `R2`.
- D03 UI proof: before confirm `0`, cancel `0`, one confirm `1`, double confirm `1`.
- D04 UI proof: SET and CLEAR source the server-loaded override `revision`; loaded `R7` is sent as `R7`, missing revision sends `0`, stale `R7` refreshes to `R8`, and the later request sends `R8`.
- Logout proof: DELETE `/v1/admin/session` sends `pcp_admin_csrf`, not `pcp_csrf`; server returns success and the subsequent admin-me check is unauthorized.
- Count integrity: `TAUTOLOGICAL=0`, `SNAPSHOT_ONLY_PADDING=0`, `DUPLICATE_ROWS=0`, `SEMANTIC_PADDING=0`, `UUID_ONLY_VARIANTS=0`, `COUNT_INFLATION_HELPERS=0`, `COUNT_INTEGRITY=PASS`.
- DB-down gates: install frozen, lint, format, typecheck, unit, OpenAPI, Bridge, and build passed.
- DB-up gates: lint, format, typecheck, unit, integration, migration twice, OpenAPI twice, Bridge, build, and E2E passed.

## Security and host evidence

Production admin source contains no `localStorage`, `sessionStorage`, `indexedDB`, `dangerouslySetInnerHTML`, console logging, remote fonts/assets, or external runtime scripts. Next headers set `poweredByHeader: false`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and camera/microphone/geolocation disabled.

At the final local gate capture, root usage was `84%` (`49,876,819,968 / 63,298,023,424` bytes used; `10,183,749,632` bytes free), inode usage was `30%`, and protected services were left active. Only disposable Next build output and Playwright output were removed.

## Attempt 4 shipped E2E contour correction

Attempt 4 reconstructed Attempt 3 exactly as tree 1c03080bb400f83ddbf5211bb247a98844d78f0c on VPS Easyscript. The shipped Playwright configuration executed its web-server command from server/e2e, so pnpm db:migrate failed with ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND; the package root containing db:migrate is server/.

The repair adds a deterministic cwd derived from the shipped config location to every Playwright web server and uses workspace-filtered portal/admin commands. It contains no VPS absolute path, shell cd, duplicate migration command, migration bypass, or temporary cwd override.

The actual shipped config regression proof passed: PLAYWRIGHT_DB_MIGRATE_CWD_HAS_PACKAGE_MANIFEST=YES, PLAYWRIGHT_DB_MIGRATE_SCRIPT_RESOLVES=YES, and TEMPORARY_CWD_CORRECTION_REQUIRED=NO. The exact shipped pnpm test:e2e entrypoint then passed 69 tests with 0 failures, 0 skips, and 0 retries. The explicit six-test safety rerun passed D01, D02, D03, D04, and logout CSRF.

Attempt 4 gates passed: format, lint, typecheck, unit/component (1,103), integration (1,456), OpenAPI, Bridge guard, build, and full shipped-entrypoint E2E. Product runtime behavior, control-plane API, OpenAPI, migrations, database schema, and Bridge remained unchanged; P6.6 and P7 were not started. Commit, push, and remote CI were intentionally unperformed at the freeze gate.

The final implementation and remote acceptance are recorded below.

## Final roadmap state

- P0–P5: `DONE / FINAL ACCEPTED`
- P6: `ACTIVE`
- P6.1: `DONE`
- P6.2: `DONE`
- P6.3: `DONE`
- P6.4: `DONE`
- P6.5: `DONE`
- P6.6: `NEXT`
- P7–P15: `PLANNED`

P6 remains ACTIVE. P6.5 is finalized; P6.6 is the next cursor. P7 remains planned and not started.

Domain documentation `docs/selleragents-domain-ingress-2026-09-09` was not merged.


## Final remote acceptance — 2026-09-09

- Remote head before reconstruction: `191f1a2d392f1e12cf5f0a34989a88e0788a9cb6`.
- Accepted Attempt 4 tree: `77b56750d0264f59affa7925fc076af1ba5085ca`.
- Implementation SHA: `bc566930c36654a6dd57a8f9eb79872cdb89e8f5`.
- Implementation parent/tree: `191f1a2d392f1e12cf5f0a34989a88e0788a9cb6` / `77b56750d0264f59affa7925fc076af1ba5085ca`; parent and tree match: **YES**.
- Normal push: fast-forward `191f1a2d..bc566930`; no force or ref rewriting.
- GitHub branch readback: head `bc566930c36654a6dd57a8f9eb79872cdb89e8f5`, parent `191f1a2d392f1e12cf5f0a34989a88e0788a9cb6`, tree `77b56750d0264f59affa7925fc076af1ba5085ca`; tree and accepted 33-path changed-file set match: **YES**.
- Exact-SHA Server CI: run `34323694683`, event `push`, head `bc566930c36654a6dd57a8f9eb79872cdb89e8f5`, status `completed`, conclusion `success`; server job `102375958125` completed every mandatory step successfully, including shipped `pnpm test:e2e`.
- Remote safety verdict: D01 **PASS**, D02 **PASS**, D03 **PASS**, D04 **PASS**, logout CSRF **PASS**. Confirmation bypasses: `0`; expected-revision-null unsafe paths: `0`; automatic mutation retry paths: `0`; admin endpoints using portal CSRF unsafely: `0`.
- Shipped E2E fix: **PASS**. Remote config resolves `cwd` from `__dirname` to `server/` for all web servers; the remote regression proof verifies the package manifest, the `db:migrate` script, one migration server, no shell `cd`, and no temporary override.
- Contract and scope: 67 OpenAPI operations with SHA256 `eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`; migrations `0000..0012`; migration 0012 SHA256 `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`; no 0013. OpenAPI, migrations, Bridge, provider, and payment-provider changes: **NO**. P6.6 and P7 started: **NO**.
- Findings: critical `0`, high `0`, material medium `0`; low `0`.
