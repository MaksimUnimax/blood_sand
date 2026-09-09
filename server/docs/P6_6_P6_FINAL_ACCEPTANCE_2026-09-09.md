# P6.6 P6 Final Acceptance — 2026-09-09

## Authority and scope

- Technical ID: PRODUCT-CONTROL-PLANE-P6.6-SECURITY-ARCHITECTURE-FULL-REGRESSION-FINAL-ACCEPTANCE
- Audited commit: 208b99ebc284fff9f37f50fce2cb80ce172a480b
- Branch: feature/product-control-plane-server-2026-09-04
- Execution host: Easyscript (root@78.17.68.165)
- Audit worktree: fresh disposable worktree at the exact audited commit; clean before and after audit.
- Runtime: Node v24.20.0, pnpm 10.34.5.

This is the P6 whole-stage security, architecture, and regression acceptance.
It does not implement product capabilities, P7 AI registry/profile
administration, P8 Health, P9 diagnostics, Bridge integration, or real payment
provider connectivity.

Accepted lineage: P6.1 admin identity/session/RBAC foundation; P6.2 admin
read plane, support device revoke, and principal/role management; P6.3
subscription and billing administration through accepted P5 authorities; P6.4
plan/price/entitlement/compatibility policy administration; and P6.5 admin
portal shell and operations UX. Accepted P6.5 implementation:
bc566930c36654a6dd57a8f9eb79872cdb89e8f5. Accepted tree:
77b56750d0264f59affa7925fc076af1ba5085ca. P6.5 finalization:
11735cd1997a982530f03de85acfe1ed996ee751.

ADR-0026 contains an earlier dated statement that P6.2 had not started. That
sentence is historical context superseded by later P6 ADRs and the current
ROADMAP, not current roadmap authority.

## Security acceptance

| Area | Result | Evidence |
|---|---|---|
| Admin identity separation | PASS | Persisted admin principal and role grants; exactly ADMIN_OWNER, ADMIN_OPS, ADMIN_SUPPORT, and ADMIN_BILLING_READONLY. Account ownership, membership, account role, email/domain, subscription, environment, and client state do not grant admin privilege. |
| Privileged sessions | PASS | Separate pcp_admin_session, opaque server-side token hash, 30-minute lifetime, Portal source session and same-user binding, 15-minute source freshness boundary, live source dependency, and fail-closed revocation/expiry/suspension. |
| CSRF | PASS | Portal CSRF only for elevation; pcp_admin_csrf for admin logout and all applicable admin mutations; logout invalidates the persisted admin session. |
| Browser auth storage | PASS | No auth token in localStorage, sessionStorage, or IndexedDB; no JavaScript-readable privileged session secret. |
| Bootstrap | PASS | Local/operator-only pnpm admin:bootstrap-owner -- email; verified active user; bounded normalized email; global serialization; deterministic first owner; atomic audit; no network bootstrap or generic SQL runbook. |
| RBAC | PASS | All 49 allowlisted admin operation tuples have server-side exact permission guards. Support and billing-readonly mutation boundaries are denied server-side. |
| Read privacy | PASS | Safe projections exclude Ozon/provider credentials, raw seller payloads, conversations, tokens, OTPs, CSRF secrets, signing keys, and unrelated secrets. |

~~~text
ADMIN_IDENTITY_SECURITY=PASS
ADMIN_SESSION_SECURITY=PASS
CSRF_SECURITY=PASS
BOOTSTRAP_SECURITY=PASS
RBAC_MATRIX=PASS
ACCOUNT_OWNER_IMPLIES_ADMIN=NO
EMAIL_HEURISTIC_IMPLIES_ADMIN=NO
CLIENT_UI_IMPLIES_PERMISSION=NO
SERVER_RBAC_AUTHORITY=YES
AUTH_TOKEN_IN_LOCALSTORAGE=0
AUTH_TOKEN_IN_SESSIONSTORAGE=0
AUTH_TOKEN_IN_INDEXEDDB=0
JS_READABLE_ADMIN_SESSION_SECRET=0
JS_READABLE_PORTAL_SESSION_SECRET=0
PORTAL_CSRF_USED_FOR_ADMIN_MUTATION_UNSAFE=0
ADMIN_MUTATION_WITHOUT_REQUIRED_CSRF=0
NETWORK_ADMIN_BOOTSTRAP_BACKDOOR=NO
MULTIPLE_FIRST_OWNER_RACE=PREVENTED
BOOTSTRAP_AUDITED=YES
~~~

## RBAC inventory

The mechanically reviewed inventory contains 49 admin operation tuples:
P6.2 read and principal/device operations, P6.3 subscription/billing
operations, and P6.4 commercial operations. Session create/read/logout are
separately protected by source/admin session and CSRF rules and are not
operation-permission tuples.

~~~text
ADMIN_ROUTE_COUNT=49
ROUTES_WITHOUT_PERMISSION_GUARD=0
OVERPRIVILEGED_SUPPORT_PATHS=0
OVERPRIVILEGED_BILLING_READONLY_PATHS=0
ADMIN_ENDPOINT_WITHOUT_SERVER_PERMISSION_GUARD=0
~~~

## P6 composition and mutation safety

P6.3 grant, extend, suspend, and restore delegate to accepted P5
subscription command/state-machine authorities. P6.4 plan, price,
entitlement, and compatibility operations delegate to accepted P4/P3
authorities. Admin transport adds RBAC, reason, audit context, and concurrency
authority; it adds no competing subscription state machine or direct unsafe
subscription write path. Real payment-provider connectivity remains deferred.

The current P6.5 ledger was rechecked in the clean worktree:

~~~text
P6_5_MUTATION_PATH_COUNT=31
P6_5_DOMAIN_MUTATION_PATH_COUNT=29
P6_5_STALE_CAPABLE_COUNT=29
WITHOUT_PENDING_GUARD=0
WITHOUT_DUPLICATE_SUPPRESSION=0
CONFIRMATION_BYPASSES=0
EXPECTED_REVISION_NULL_UNSAFE=0
STALE_PATHS_WITHOUT_RELOAD=0
AUTO_MUTATION_RETRY_PATHS=0
P6_COMPETING_SUBSCRIPTION_AUTHORITY=NO
DIRECT_UNSAFE_SUBSCRIPTION_WRITE_BYPASS=0
PUBLISHED_REVISION_MUTATED_IN_PLACE=0
HISTORICAL_PRICE_REWRITE_PATH=0
COMMERCIAL_CONCURRENCY_BYPASS=0
D01=PASS
D02=PASS
D03=PASS
D04=PASS
LOGOUT_CSRF=PASS
~~~

The shared mutation coordinator has a pending guard, duplicate-submit
suppression, explicit reason and review/confirmation, and terminal
stale/conflict handling with authoritative reload. There is no automatic
mutation retry.

## Audit, BFF, and data-plane boundaries

All required security and commercial/admin mutations have append-only audit
evidence through the accepted audit authority. No required mutation lacks an
audit record. Audit projections exclude reasons, sensitive metadata, OTPs,
auth/session material, refresh tokens, CSRF secrets, signing material, Ozon
credentials, and raw seller payloads. Operator reasons are not returned in
inappropriate admin read projections.

The Portal/Admin BFF uses exact method/path tuple allowlists (49 admin tuples
and two OTP tuples), validated UUID/key path segments, fixed upstream origin,
and a narrow forwarded-header set. It does not accept an arbitrary target URL,
method, origin, provider header, or browser-controlled upstream.

P6 remains a control plane. Repository review found no Ozon credential
storage, raw seller data storage, arbitrary Ozon transport, orders/finance/
sales data authority, provider execution/cache/quota state, or baseline AI
conversation storage. Bridge remains independent. Remote configuration
intersects packaged capability with server policy and cannot inject
JavaScript, WASM, executable modules, provider URLs, arbitrary methods, or
arbitrary auth headers.

~~~text
MUTATION_WITHOUT_REQUIRED_AUDIT=0
APPEND_ONLY_AUDIT_AUTHORITY=YES
FORBIDDEN_SECRET_READ_EXPOSURE=0
RAW_SELLER_DATA_READ_EXPOSURE=0
SECRET_LOGGED=0
ARBITRARY_BFF_PROXY=NO
BFF_ALLOWLIST_BYPASS=0
BROWSER_CONTROLLED_CONTROL_PLANE_ORIGIN=NO
OZON_CREDENTIAL_SERVER_STORAGE=NO
RAW_SELLER_DATA_SERVER_STORAGE=NO
PROVIDER_TRANSPORT_MOVED_SERVER_SIDE=NO
REMOTE_EXECUTABLE_CODE=NO
REMOTE_CAPABILITY_EXPANSION=NO
~~~

## Architecture consistency matrix

| Concern | Documented authority | Implemented authority | Evidence | Mismatch |
|---|---|---|---|---|
| Admin identity | Persisted admin principal/grant | admin-auth principal and grants | P6.1 docs, repository, integration tests | NO |
| Session | Persisted admin session plus Portal source | Server session repository and guard | SECURITY, routes, E2E | NO |
| CSRF | Portal/admin domains separated | pcp_csrf elevation; pcp_admin_csrf mutations | guard and logout E2E | NO |
| RBAC | Exact server permissions | requireAdminPermission and transaction authorization | route inventory, negative tests | NO |
| Account/user reads | Safe control-plane projections | Admin ops read repositories | P6.2 evidence/tests | NO |
| Device revoke | Device authority with admin permission | Accepted device command path | P6.2/P6.5 tests | NO |
| Subscription | Accepted P5 state machine | P6.3 command adapter | adapter/integration tests | NO |
| Billing reads | Safe billing authority | Read-only billing projections | P6.3 evidence/tests | NO |
| Plans | P4 catalog authority | P6.4 command adapter | catalog tests | NO |
| Prices | Immutable P4 revisions | Revision publication path | migration/integration tests | NO |
| Entitlements | P4 mappings/overrides | P6.4 guarded adapters | integration/E2E tests | NO |
| Compatibility | P3/P4 policy authority | Revision-only guarded operations | compatibility tests | NO |
| Admin UI/BFF | Fixed same-origin allowlist | Exact BFF tuple routing | BFF source/route tests | NO |
| Audit | Append-only mutation evidence | Accepted audit authority | audit repository/tests | NO |
| Seller-data boundary | Control plane excludes seller data | No credential/raw-data/provider authority | source scan/Bridge guard | NO |
| Future-stage boundary | P7/P8/P9 later stages | No future-domain implementation | route/source scan/ROADMAP | NO |
| Production readiness | MFA/payment/domain deployment deferred | Gates remain deferred | SECURITY/domain plan/ROADMAP | NO |

~~~text
ARCHITECTURE_MISMATCH_COUNT=0
~~~

## Domain and stage boundaries

Current domain authority contains selleragents.ru, api.selleragents.ru,
docs.selleragents.ru, and www.selleragents.ru with this topology:

~~~text
https://selleragents.ru/       -> Portal
https://selleragents.ru/admin/ -> Admin, same origin
https://api.selleragents.ru/   -> API
https://docs.selleragents.ru/  -> docs
www                             -> canonical redirect
~~~

No current authority introduces admin.selleragents.ru. MX records are not
accepted OTP delivery infrastructure. The domain is acquired and P14.0 is a
completed prerequisite, but P14 remains planned; no nginx/TLS or production
service deployment was performed.

~~~text
DOMAIN_DOCS_CONSISTENT=YES
P7_IMPLEMENTATION_STARTED=NO
P8_IMPLEMENTATION_STARTED=NO
P9_IMPLEMENTATION_STARTED=NO
P14_STARTED=NO
ADMIN_MFA_PRODUCTION_GATE=DEFERRED / correctly documented
REAL_PAYMENT_PROVIDER=NO
P14_0=DONE PREREQUISITE ONLY
~~~

## Contract and regression gates

All gates below were run from the clean disposable worktree on Node 24:

~~~text
FORMAT=PASS
LINT=PASS
TYPECHECK=PASS
UNIT_TOTAL=1103
UNIT_FAIL=0
INTEGRATION_FILES=32
INTEGRATION_TOTAL=1456
INTEGRATION_FAIL=0
MIGRATION_RUN_1=PASS
MIGRATION_RUN_2=PASS
OPENAPI_OPERATIONS=67
OPENAPI_SHA256=eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4
OPENAPI_CHANGED=NO
MIGRATION_RANGE=0000..0012
MIGRATION_0012_SHA256=9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679
MIGRATION_0013_PRESENT=NO
MIGRATION_CHANGED=NO
BRIDGE_CHANGED=NO
BRIDGE_GUARD=PASS
BUILD=PASS
E2E_ENTRYPOINT=pnpm test:e2e
E2E_TOTAL=69
E2E_FAIL=0
E2E_SKIP=0
E2E_RETRY=0
TEMPORARY_CWD_OVERRIDE=NO
DB_MIGRATE_FROM_SHIPPED_ENTRYPOINT=PASS
WEB_SERVERS_FROM_SHIPPED_ENTRYPOINT=PASS
~~~

The shipped server/e2e/playwright.config.ts uses repository-relative
package-root cwd for migration and web-server commands. The exact shipped
entrypoint ran all 69 tests with one worker and no retries. A preliminary
preflight rejection using a non-accepted database name was a disposable
contour naming error; a fresh e2e database was created and the unchanged
shipped entrypoint then passed 69/69 without a config or cwd override.

Focused source and redaction review found no committed production secrets,
private keys, session secrets, API keys, promoted OTP fixtures, or sensitive
debug logging. Security and Bridge guards passed.

## Findings and local verdict

~~~text
CRITICAL=0
HIGH=0
MEDIUM=0
MATERIAL_MEDIUM=0
LOW=0
LOCAL_P6_6_ACCEPTANCE=PASS
P6=ACTIVE
P6_6=ACTIVE / LOCAL PASS, REMOTE ACCEPTANCE PENDING
P7=PLANNED / NOT STARTED
~~~

This local verdict is not the final P6 verdict. Remote exact-SHA CI, GitHub
readback, and final security readback remain pending before P6 can be marked
DONE.

