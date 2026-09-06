# P4.2 Plan / Entitlement Commands — Local Evidence — 2026-09-06

Status: ACCEPTED — P4.2 DONE

Technical ID: `PRODUCT-CONTROL-PLANE-P4.2-PLAN-ENTITLEMENT-COMMANDS-LOCAL`  
Attempt: `1`

## BASE

- Branch: `feature/product-control-plane-server-2026-09-04`
- Required/local HEAD: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`
- Remote start check 1: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`
- Remote start check 2: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`
- Checks used GitHub SSH port 443 and were separated by four seconds.
- Start worktree: clean.
- Runtime: Node `24.20.0`, pnpm `10.34.5`, PostgreSQL `18.0`.

## ADR AND DOMAIN BOUNDARY

- ADR: `server/docs/ADR/0016-p4-plan-entitlement-command-and-publication-semantics.md`, Status: Accepted.
- Package: `@product/plans` in `server/packages/plans`.
- Allowed package dependencies: `@product/shared`, `zod`, and Node standard library crypto.
- `@product/plans` dependencies on `@product/db`, Fastify, `apps/*`, Bridge, and billing: NONE.
- PostgreSQL adapter: `server/packages/db/src/p4-plan-command-repository.ts`.
- HTTP/admin/public surface: NONE; OpenAPI unchanged.
- Internal command behavior is not authorization. P6 owns admin authentication/RBAC.

## COMMANDS

Implemented: create stable plan; create draft plan revision; update draft metadata; set typed draft entitlement; remove draft entitlement; publish exact revision; change plan status; create entitlement definition; update definition description; deprecate definition.

Prices and price revisions remain P4.3. Account overrides and resolution remain P4.4. Subscriptions and billing remain P5.

## LOCKING AND CONCURRENCY

- Same-plan aggregate lock: transaction-scoped PostgreSQL advisory lock `p4-plan:<planId>` for draft creation, draft edits, SET/REMOVE, publication, and status changes.
- Same-code plan creation: `p4-plan-code:<code>`.
- Definition creation: `p4-entitlement-definition:<entitlementKey>`.
- Revision allocation: `MAX(revision)+1` while holding the plan lock; concurrent drafts receive distinct server revisions; multiple drafts are allowed.
- Consumer definition rows: `FOR SHARE`, lexical key order for publication.
- Definition mutation/deprecation: `FOR UPDATE`.
- Definition deprecation is linearizable with SET/PUBLISH; no check-then-deprecate gap.
- Concurrent same-fingerprint writers: one commits and one returns `PLAN_DRAFT_STALE`; no lost update.

## FINGERPRINT

- Domain: `product-control-plane/plan-revision-content/v1`.
- Algorithm: SHA-256, lowercase hexadecimal.
- Canonical content: revision ID, plan ID, revision number, display name, description, and typed entitlements sorted by explicit code-unit lexical `entitlementKey` order.
- Entitlement order is independent of input/database row order; kind and exact safe-integer/boolean value are included.
- State, published time, audit metadata, and row order are excluded.
- Fingerprint is an optimistic concurrency token only, not a signature, credential, authorization artifact, or remote field.

## AUDIT

- Every changed mutation inserts exactly one `audit_events` row in the same PostgreSQL transaction.
- Audit failure rollback: PASS for normal mutation and publication; no partial state remains.
- Expected rejection: no audit. Semantic no-op: `changed=false`, no duplicate audit.
- Actions: `PLAN_CREATED`, `PLAN_REVISION_DRAFT_CREATED`, `PLAN_REVISION_DRAFT_UPDATED`, `PLAN_ENTITLEMENT_SET`, `PLAN_ENTITLEMENT_REMOVED`, `PLAN_REVISION_PUBLISHED`, `PLAN_STATUS_CHANGED`, `ENTITLEMENT_DEFINITION_CREATED`, `ENTITLEMENT_DEFINITION_DESCRIPTION_UPDATED`, `ENTITLEMENT_DEFINITION_DEPRECATED`.
- Plan targets use `PLAN`; revision/composition targets use `PLAN_REVISION`; definition targets use `ENTITLEMENT_DEFINITION` with NULL target ID.
- Safe metadata is bounded to IDs, codes, revisions, states, changed fields, fingerprints, value types, entitlement count, and deprecation time. Raw descriptions, bodies, values, secrets, tokens, seller/payment data are not recorded.
- Actor type/ID, correlation ID, and reason were physically verified.

## STATUS AND PUBLICATION

- DRAFT -> ACTIVE/HIDDEN requires at least one published revision; DRAFT -> ARCHIVED is allowed.
- ACTIVE -> HIDDEN/ARCHIVED; HIDDEN -> ACTIVE/ARCHIVED; ARCHIVED is terminal.
- ACTIVE/HIDDEN -> DRAFT is rejected; same-state is a no-op.
- Publication uses injected `publishedAt`, validates exact fingerprint and live non-deprecated typed definitions, freezes composition, audits once, and is idempotent on second publish.
- Deprecated definitions block future SET/PUBLISH but do not alter historical published data. Draft REMOVE remains allowed after deprecation.
- No current/active revision pointer exists.

## STAGING AND SECURITY

- Price commands: ABSENT.
- Account override commands/resolution: ABSENT.
- Subscriptions, billing, checkout, webhooks, provider adapters: ABSENT.
- Admin/public HTTP: ABSENT.
- Bootstrap changed: NO.
- Production device-limit behavior changed: NO; `PreEntitlementDeviceLimitResolver` baseline remains 1.
- Bridge changed/imported: NO.
- Ozon credentials, raw seller data, payment/card data, billing secrets, generic entitlement JSON, floating money, executable remote config, and SSH private keys in the repository: NONE.

## TESTS AND GATES

- Unit: `218 PASS`, baseline `203`, fail `0`, skip/todo `0`.
- P3.1 crypto: `12/12 PASS`.
- Integration: `144 PASS`, baseline `123`, new P4.2 `21`, fail `0`, skip/todo `0`.
- P4.1 physical persistence regression retained: `30 PASS`.
- E2E: `24/24 PASS`, fail `0`, skip `0`, retries `0`.
- DB-down: frozen install, lint, format, typecheck, unit, OpenAPI, Bridge guard, and build PASS with `DATABASE_URL` absent.
- DB-up: lint, format, typecheck, unit, integration, migration, OpenAPI, Bridge guard, and build PASS on PostgreSQL 18.
- OpenAPI: `15` routes; two generate/check runs both SHA-256 `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`; `POST /v1/bootstrap` remains once.
- Build: PASS.

## MIGRATIONS

- Files exactly `0000..0008`.
- New `0009`: NO.
- `0008` start SHA-256: `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1`.
- `0008` final SHA-256: `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1`.
- `0008` unchanged: YES.
- Historical `0000..0007` unchanged: YES.
- Fresh PostgreSQL 18 first migrate: PASS.
- Second migrate: PASS.

## ROADMAP

- P0 DONE; P1 DONE; P2 DONE; P3 DONE; P4 ACTIVE.
- P4.1 DONE; P4.2 DONE; P4.3 NEXT; P4.4 PLANNED; P4.5 PLANNED; P4.6 PLANNED.
- P5-P15 PLANNED.
- P4.2 is marked DONE and P4.3 is NEXT.

## HOST AND RECOVERY

- Only a disposable local PostgreSQL 18 validation container was used; it was removed after validation. No host service, PostgreSQL installation, Bridge, bootstrap, device-management, API, or migration history was changed.
- Recovery artifacts were created after all gates passed, without overwriting older artifacts; their exact bytes and hashes are recorded below.

- Patch: `/var/backups/product-control-plane/git/blood_sand-p4.2-local-accepted-uncommitted.patch`
- PATCH_BYTES: `96040`
- PATCH_SHA256: `de40519691e38df8da94f4b37d8778a4b64d38411a44e55629e01eab1168e3f6`
- Archive: `/var/backups/product-control-plane/git/blood_sand-p4.2-local-accepted-untracked.tar.gz`
- ARCHIVE_BYTES: `16864`
- ARCHIVE_SHA256: `16fa53c7011bf02abf029ce92b16f22d54e94637e834a2a6c78bd63973462e95`
- UNTRACKED_COUNT: `8`

## FINAL STATE

- Local worktree: clean after the committed P4.2 implementation and docs acceptance commits.
- Implementation commit: `edb32694f6bfe2b8433147ab85f84936f5735d28`.
- Code CI: `34008726667` — https://github.com/MaksimUnimax/blood_sand/actions/runs/34008726667 — SUCCESS.
- Final remote check 1: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`.
- Final remote check 2: `5bd0b857c27f477c1f31d5849ffe5e4ef5cb7a93`.

## REMOTE ACCEPTANCE

- Remote committed review: PASS.
- Unit: `218 PASS`.
- Integration: `144 PASS`, including `21` P4.2 tests and `30/30` P4.1 persistence regression.
- E2E: `24/24 PASS`.
- P3.1 crypto: `12/12 PASS`.
- OpenAPI: `15` routes; SHA-256 `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Migrations: `0000..0008` unchanged; no `0009`.
- Audit, concurrency, deprecation serialization, and publication review: PASS.
