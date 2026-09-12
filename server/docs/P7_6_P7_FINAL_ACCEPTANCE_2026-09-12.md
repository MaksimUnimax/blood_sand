# P7.6 Whole-P7 Final Local Acceptance — 2026-09-12

## Result and identity

TECHNICAL_ID: `PRODUCT-CONTROL-PLANE-P7_6-P7-SECURITY-ARCHITECTURE-FULL-REGRESSION-FINAL-LOCAL-ACCEPTANCE-2026-09-12`

This is a docs-only local acceptance candidate. The audit was performed in the
fresh isolated worktree at `/opt/product-control-plane-src/blood_sand-p7.6-final-acceptance`.

- AUDITED_CANONICAL_SHA: `c65453c1cd33d9615ef8871894e468294bdba452`
- AUDITED_CANONICAL_TREE: `4f937204d98548ae6d7c14f923fcfa67da56f9c3`
- AUDIT_HEAD: `c65453c1cd33d9615ef8871894e468294bdba452`
- Node: `/root/.nvm/versions/node/v24.20.0/bin/node` (`v24.20.0`)
- pnpm: `10.34.5`
- provider calls: `0`
- COMMIT: `NO`
- PUSH: `NO`
- P8: `NOT STARTED`

The accepted lineage is P7.1 `8c540e95`, P7.2 `868e0873`, P7.3 `aa58b373`,
P7.4 `5f256cc7`, P7.4 post-acceptance correction `6fec9075`, P7.5
implementation `6a377772b3e8a2ac90f234eb22cb2380fbf26a81` (tree
`f16334a8819d87c8b2d5fd2307367d4cc8015a22`), and P7.5 docs-finalization
`c65453c1cd33d9615ef8871894e468294bdba452` (tree
`4f937204d98548ae6d7c14f923fcfa67da56f9c3`). P7.4 correction CI #89 was
successful; P7.5 implementation CI #91 (`34680020529`) and docs-finalization
CI #92 (`34680482671`) were successful and had all mandatory Server CI steps
green.

## Resource and execution authority

Disk measurements were taken with `df -B1 /`:

- FREE_DISK_START: `8598728704` bytes
- FREE_DISK_PRE_INTEGRATION: `8995483648` bytes
- FREE_DISK_PRE_E2E: `8837328896` bytes
- FREE_DISK_END_AFTER_TEST_CLEANUP: `8716693504` bytes
- hard floor: `8589934592` bytes

The only cleanup was removal of two explicitly task-created PostgreSQL 18.0
containers and their tmpfs-backed data, plus the task-created Playwright
`server/test-results` output. CLEANUP_BYTES from two clean, remotely accepted,
immutable-frozen historical P7 worktrees was `437387264`; no source authority,
Git objects, caches, backups, Bridge data, or seller/provider data was removed.
Docker cleanup left `NEW_CONTAINERS_LEFT=0` and `NEW_VOLUMES_LEFT=0`.

## Whole-stage security and architecture audit

The audit independently reviewed P7.1 persistence/schema, P7.2 lifecycle and
assignment authority, P7.3 bootstrap resolution and signing, P7.4 API/RBAC,
and P7.5 BFF/operator UX composition. The result is:

- REMOTE_EXECUTABLE_CODE: `NO`
- REMOTE_CAPABILITY_EXPANSION: `NO`
- ONE_SERVER_CANONICAL_FINGERPRINT_AUTHORITY: `YES`
- CLIENT_AUTHORITATIVE_PROFILE_HASH: `NO`
- ILLEGAL_LIFECYCLE_PATHS: `0`
- AUTO_MUTATION_RETRY: `0`
- SAFE_ROLLBACK: `PASS`
- REMOTE_TRUSTED_HOST_EXPANSION: `NO`
- REMOTE_DETECTOR_CODE: `NO`
- RAW_INTERNAL_ERROR_EXPOSURE: `0` in API/UI responses
- SECRET_LOGGED: `0`

### Architecture consistency matrix

| Concern | Documented authority | Implemented authority | Evidence | Mismatch |
|---|---|---|---|---|
| registry hierarchy | ADR-0031; DATA_MODEL | adapter-registry schemas and SQL FKs | `packages/adapter-registry`, migrations 0013–0014 | NO |
| profile schema | ADR-0031; REQUIREMENTS | strict `adapter_profile_v1` / compatibility parser | adapter-registry source/tests | NO |
| fingerprint | ADR-0031/0033 | server canonical `{content, compatibility}` SHA-256 | `validateProfileContent` / `profileRevisionFingerprint` | NO |
| revision lifecycle | ADR-0032 | DB guards plus lifecycle repository | migration 0013; P7 lifecycle integration | NO |
| assignment scope | ADR-0032 | adapter/surface/variant/browser/subject schema and composite checks | migration 0014; P7.2 correction integration | NO |
| rollout algorithm | ADR-0032; ADR-0009 | P3 `selectRolloutCandidateV1` with `ai.profile.assignment` | adapter-registry source/tests | NO |
| cohort seed | ADR-0032 | server-generated 32-byte seed, internal only | assignment repository and SQL checks | NO |
| rollback | ADR-0032 | explicit target, expected latest revision, transactional mutation | P7 lifecycle/API tests and E2E | NO |
| bootstrap detection | ADR-0033 | packaged HTTPS `chatgpt.com` detector | simulated detector/tests | NO |
| resolution precedence | ADR-0033 | unsupported, disabled, no-profile, incompatibility, resolved precedence | AI resolution source and P7.3 integration | NO |
| variant/default semantics | ADR-0033 | exact eligible scope first, default only under accepted absence rule | P7.3 integration/tests | NO |
| compatibility | ADR-0033 | bounded browser/version compatibility validation | bootstrap resolver and contracts | NO |
| signed binding | ADR-0033; P3 ADR-0009 | signed context-bound response and strict client verification | bootstrap signing and simulated client tests | NO |
| trusted host | ADR-0031/0033 | packaged host only; profile cannot add origin | detector and source scan | NO |
| admin API | ADR-0034 | explicit registered P7 routes | `admin-ai-routes.ts`; OpenAPI check | NO |
| RBAC | ADR-0034 | six server permissions and role matrix | admin-auth source/tests; route guard | NO |
| transaction auth | ADR-0034; P6 ADR-0026 | row lock and current-grant ACTIVE check in mutation transaction | `admin-mutation-authorization.ts`; main wiring | NO |
| CSRF | P6 ADR-0026; ADR-0034 | admin session/CSRF route boundary | admin route guard/API tests | NO |
| read privacy | SECURITY; ADR-0034 | safe projections, bounded pagination, no seed/reason/actor | P7 read repository and schemas | NO |
| audit | SECURITY; ADR-0034 | append-only business mutation audit without secrets | command repository and DB audit guards | NO |
| BFF | ADR-0035 | exact route tuple allowlist and fixed server origin | `control-plane-route.ts` tests | NO |
| permission UI | ADR-0035 | `/v1/admin/me` permissions | `admin-ai.tsx`, P7.5 E2E | NO |
| profile editor | ADR-0035 | bounded structured editor only | `admin-ai.tsx`, admin-ai tests | NO |
| stale handling | ADR-0032/0035 | authoritative refresh, terminal conflict, no retry | mutation coordinator and E2E | NO |
| seller-data boundary | ARCHITECTURE; ADR-0031 | no Ozon/WB credential, payload, or provider transport authority | focused source scan | NO |
| Bridge boundary | ADR-0031; reference bridge baseline | no active Bridge import or source delta | `pnpm bridge:guard` | NO |
| P8 boundary | ADR-0031/0032/0034 | no health runner, classification, evidence, or auto rollback | source/docs scan; ROADMAP | NO |
| P9 boundary | ADR-0031/0034 | diagnostics/notifications remain planned | ROADMAP and ADRs | NO |
| production boundary | ROADMAP; ADR-0031 | no nginx/TLS/deployment work | ROADMAP and changed-path check | NO |

ARCHITECTURE_MISMATCH_COUNT: `0`.

## P7.1–P7.3 authority results

The stable adapter/surface/variant/profile hierarchy uses immutable UUID and
machine-key identity, permanent hierarchy references, positive unique revision
numbers, immutable published/retired history, and DB-enforced cross-hierarchy
rejection. The accepted profile schema permits bounded declarative strategies,
selectors, accessibility references, observations, contours, and compatibility
only. It contains no JavaScript, WASM, module, command, filesystem path,
arbitrary URL/method/header/credential, raw selector, or generic metadata escape
hatch.

Fingerprinting has one server authority over validated content plus
compatibility and fails closed on mismatch. Lifecycle is exactly DRAFT →
CANDIDATE → PUBLISHED → RETIRED; direct published creation, demotion, edits to
non-DRAFT revisions, published/retired deletion, in-place published mutation,
and historical rewrites are rejected.

Assignments support ACCOUNT/DEVICE and DIRECT/ROLLOUT/PAUSED. Seeds are
cryptographically generated by the server, cannot be caller supplied, are not
returned or rendered, and are not part of the read projection. The P3 rollout
primitive is reused with key `ai.profile.assignment`; percentage is bounded to
0..10000 basis points. Existing mutations require the latest expected revision;
stale/conflict is terminal and does not retry. PAUSED does not select a
candidate; COMPLETE and explicit rollback are deterministic, and retirement
guards protect active references.

The accepted resolution union is `UNCONFIGURED`, `UNAVAILABLE`, and
`RESOLVED`. Repository reason literals are `UNSUPPORTED_DETECTED_AI`,
`AI_DISABLED`, `NO_PROFILE`, and `PROFILE_INCOMPATIBLE`. Unknown hierarchy is
unsupported/fail-safe; inactive hierarchy is disabled; absent eligible profile
is no-profile; compatibility failure is incompatibility; only a fully
validated hierarchy, assignment, profile, fingerprint, and compatibility
resolves. Exact variants do not silently fall back when the exact selection is
ineligible; the surface default is considered only under the repository’s
accepted exact-absence/no-revision rule.

The exact packaged fixtures are `CHATGPT_STANDARD` → `chatgpt / standard /
standard_composer_v1` and `CHATGPT_WORK` → `chatgpt / work /
work_composer_v3`, independently resolved with no provider or live DOM calls.
STANDARD_RESOLUTION: `PASS`; WORK_RESOLUTION: `PASS`; CROSS_SURFACE_BINDING:
`NO`; WRONG_SURFACE_PROFILE_ACCEPTED: `NO`.

Signed bootstrap binding covers the accepted subject, browser, detected AI,
surface/variant, profile revision, snapshot/config context, expiry/version, and
signature fields defined by ADR-0033. Signature validation and tamper rejection
pass; Standard/Work replay across context is prevented. The detector accepts
only packaged HTTPS `https://chatgpt.com`; remote data cannot add a host,
detector code, navigation target, or fetch origin.

## P7.4 API, RBAC, privacy, and mutation security

The mechanically expanded P7 inventory is READ `10`, MUTATION `25`, P7_TOTAL
`35`. The corrected assignment routes are `/direct`, `/rollout`, `/percentage`,
`/pause`, `/resume`, `/complete`, and `/rollback`; stale nested rollout routes
are rejected. Successful mutation serialization is exactly revision,
mode, baselineProfileRevisionId, candidateProfileRevisionId, percentageBps,
createdAt; internal IDs, assignment ID, cohort seed, reason, and actor are not
returned. POST_COMMIT_SERIALIZATION_500_REGRESSION: `NO`.

The exactly six permissions are `ai.registry.read`, `ai.registry.manage`,
`ai.profile.read`, `ai.profile.manage`, `ai.assignment.read`, and
`ai.assignment.manage`. ADMIN_OWNER and ADMIN_OPS have all six;
ADMIN_SUPPORT has the three read permissions; ADMIN_BILLING_READONLY has none.
Authorization is server-side and does not infer wildcard, superuser,
account-owner, email, portal-membership, or UI-role authority.

Every mutation requires an authenticated admin session, admin CSRF, route
permission, and transaction-time ACTIVE/current-grant authorization in the
same authority boundary. Revoked-role and suspended-principal commits are
rejected, and denied mutations do not create the prohibited audit side effect.
Safe read projections exclude seed, stored operator reason, actor IDs where not
accepted, session/CSRF material, credentials, private signing material, raw
audit rows, SQL columns, provider credentials, seller payloads, and
conversation contents. Pagination is bounded at 100.

## P7.5 BFF and operator UX

The BFF inventory is P6 `49` + OTP `2` + P7 `35` = TOTAL `86`; MISSING `0`,
EXTRA `0`, and DUPLICATES `0`. There is no wildcard/generic AI proxy,
arbitrary target URL, or browser-controlled upstream origin. Route validation
rejects wrong methods, unknown routes, backslashes, empty/dot/dotdot segments,
encoded bypasses, invalid UUIDs, and non-positive revisions. The upstream
origin is fixed server configuration and only safe request headers are
forwarded.

The UI derives visibility from permissions returned by `GET /v1/admin/me`:
OWNER/OPS manage, SUPPORT read-only, and BILLING_READONLY has no AI navigation.
Direct route/API authority remains server-enforced. The editor is structured
and bounded; non-DRAFT revisions are read-only and the server fingerprint is
authoritative. No privileged draft is stored in localStorage, sessionStorage,
or IndexedDB. The only browser-readable cookie use is the accepted CSRF
boundary; the HttpOnly admin session remains unreadable to JavaScript.

Mutation coordination has a pending guard, duplicate-submit suppression,
explicit reason, confirmation for high-impact operations, one mutation attempt,
authoritative refresh, review invalidation, terminal stale/conflict handling,
and no optimistic business-state write or automatic retry. Errors are mapped to
safe messages and do not expose SQL, constraint names, stacks, arbitrary
internal error messages, secrets, or fake success after ADMIN_FORBIDDEN.

## Boundaries and source scan

P7 adds no Ozon or WB credential storage, raw seller payload storage, provider
transport/quota/cache authority, or AI conversation storage. Bridge is unchanged
by P7.6 and `pnpm bridge:guard` passed. P8 health runner execution, live health
checks, DRIFT/DEGRADED/BROKEN authority, incidents, candidate validation,
screenshots/evidence, scheduled smoke, and health-driven rollback are absent.
P9 diagnostics/notifications and P14 production/nginx/TLS/deployment remain
planned. P11 has not started.

Focused source scan results: PRODUCTION_SECRETS `0`; PRIVATE_KEYS `0`;
REMOTE_CODE_PATH `0`; ARBITRARY_FETCH_PATH `0`; GENERIC_BFF_PROXY `0`.
Development/test literals and the accepted readable CSRF cookie path were
reviewed in context and are not production secret or capability findings.

## Regression and contract gates

- UNIT: expected `1207`; actual `1207`; FAIL `0`; SKIP `0`; first-run-only `YES`; `pnpm test` exactly once; duration `34.78s`.
- INTEGRATION: expected `1487`; actual `1487`; FAIL `0`; SKIP `0`; first-run-only `YES`; `pnpm test:integration` exactly once; duration `174.00s`.
- MIGRATION_RUN_1: `PASS`; MIGRATION_RUN_2: `PASS`; fresh zero-to-current and idempotent second invocation.
- Migration range: `0000..0014`; `0014` SHA-256 `4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`; `0015_PRESENT=NO`.
- FORMAT: `PASS`; LINT: `PASS`; TYPECHECK: `PASS`; OPENAPI_CHECK: `PASS`; BRIDGE_GUARD: `PASS`; BUILD: `PASS`.
- OpenAPI operations: `102`; SHA-256 `9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`; SHA_MATCH `YES`; OPENAPI_CHANGED `NO`.
- E2E inventory: `72` tests in 7 files; full `pnpm test:e2e` exactly once with `retries: 0`, one worker, Chromium cache reused, loopback port `55461`, fresh tmpfs PostgreSQL `product-control-plane-p7.6-final-e2e-pg`, collected `72`, pass `72`, fail `0`, skip `0`, retry `0`, first-run-only `YES`, duration `328.93s`.

Exit-gate evidence is present for Standard, Work, unsupported, disabled,
no-profile, incompatible, exact/default variant behavior, signed/tampered
context, schema restrictions, lifecycle immutability, deterministic rollout,
pause/resume, rollback, stale revision, role revocation, principal
suspension, CSRF denial, Support read-only, BillingReadonly denial/no-nav, BFF
route rejection, seed non-exposure, stored-reason non-exposure, and the full
P7.5 browser flow. Primary evidence is the accepted P7.3 bootstrap integration
suite, P7.2 correction/lifecycle integration suites, P7.4 admin API tests,
P7.5 BFF/admin tests, and the 72-test E2E inventory and pass.

## Findings and protected-state result

- NEW P7.6 CRITICAL: `0`
- NEW P7.6 HIGH: `0`
- NEW P7.6 MEDIUM: `0`
- NEW P7.6 LOW: `0`
- Historical P7.5 Review LOW: the immutable Attempt1 manifest listed three focused unit files while the accepted focused run used four; bookkeeping-only, not a P7.6 product defect.
- Historical manifest bookkeeping LOW is not counted as a new P7.6 finding.

MAIN_C21_UNCHANGED: `YES`. Main HEAD and fingerprints remained:
`c21d612bb3bd09e3b8a5a41ebd1562ace1cf2b9e`, status
`ce02b35660aa538d79708e65fee70b07dfca75bea566e69ef5375c302d5b1515`, staged
`fc378bf73a227132e7341009da210a7fe3cfdf2daa06663579a45508158f02c2`, unstaged
and untracked `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
OLD_BLOCKED_P7_5_WIP_UNCHANGED: `YES`; its HEAD, diff SHA
`a74bb2be439f05e181c2d997a575d5a2447bc1d175624a8f9197270ad2b75456`,
archive SHA `6a242dd88a7ebca879cd951235c1cab38d552f921a5695b72e9aeb036f7cb858`,
and manifest SHA `dfa990d6f60349a8772e0dd6c40be0e1eb118a624b8dce34954d3bfce21b1dab`
remained unchanged.

## Local acceptance semantics

LOCAL_P7_6_ACCEPTANCE: `PASS`

P7_WHOLE_STAGE_LOCAL_ACCEPTANCE: `PASS`

PRODUCT_P7_ACCEPTABLE: `YES`

SECURITY_ACCEPTABLE: `YES`

ARCHITECTURE_ACCEPTABLE: `YES`

FULL_REGRESSION_ACCEPTABLE: `YES`

SAFE_FOR_MAIN_CHATGPT_ACCEPTANCE: `YES`

REMOTE_P7_6_ACCEPTANCE: `PENDING`

P7_FINAL_REMOTE_ACCEPTANCE: `PENDING`

SAFE_FOR_PUBLICATION: `PENDING_MAIN_CHATGPT_ACCEPTANCE`

SAFE_FOR_COMMIT: `NO`

SAFE_FOR_PUSH: `NO`

NEXT: `RETURN THE P7.6 WHOLE-P7 FINAL LOCAL-ACCEPTANCE RESULT TO MAIN CHATGPT.`
