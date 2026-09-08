# P6.4 behavioral real-PG matrix ledger — 2026-09-08

Authoritative test file: `integration/p6-4-admin-commercial.integration.test.ts`.
Every row below is one explicit test instance against PostgreSQL 18. `HTTP`
means Fastify `app.inject()` through the production P6.4 controller, service,
and repositories with real admin authentication. `DB_ADAPTER` is limited to
transaction-time race coordination where HTTP cannot deterministically pause
between authority checks.

| ID | Status | Entrypoint | Behavior proven |
|---|---|---|---|
| A01 | PASS_COUNTED | HTTP | OWNER plan.manage mutation persists |
| A02 | PASS_COUNTED | HTTP | OWNER price.manage mutation persists |
| A03 | PASS_COUNTED | HTTP | OWNER entitlement-definition mutation persists |
| A04 | PASS_COUNTED | HTTP | OWNER entitlement.override mutation persists |
| A05 | PASS_COUNTED | HTTP | OWNER compatibility.manage publication persists |
| A06 | PASS_COUNTED | HTTP | ADMIN_OPS compatibility.read succeeds |
| A07 | PASS_COUNTED | HTTP | ADMIN_OPS compatibility.manage is denied with no mutation |
| A08 | PASS_COUNTED | HTTP | ADMIN_OPS plan.manage is denied with no mutation |
| A09 | PASS_COUNTED | HTTP | ADMIN_OPS price.manage is denied with no mutation |
| A10 | PASS_COUNTED | HTTP | ADMIN_OPS entitlement.override is denied with no mutation |
| A11 | PASS_COUNTED | HTTP | ADMIN_SUPPORT commercial mutation is denied |
| A12 | PASS_COUNTED | HTTP | ADMIN_BILLING_READONLY commercial mutation is denied |
| A13 | PASS_COUNTED | DB_ADAPTER | Revoked role is denied at transaction-time with no domain or audit write |
| A14 | PASS_COUNTED | DB_ADAPTER | Suspended principal is denied at transaction-time with no domain or audit write |
| B01 | PASS_COUNTED | HTTP | Plan safe fields persist |
| B02 | PASS_COUNTED | HTTP | Duplicate plan code conflicts without a second row |
| B03 | PASS_COUNTED | HTTP | Draft plan revision 1 persists in DRAFT state |
| B04 | PASS_COUNTED | HTTP | New draft for archived plan is rejected |
| B05 | PASS_COUNTED | HTTP | Inspected fingerprint equals accepted P4 calculation |
| B06 | PASS_COUNTED | HTTP | Draft content update changes persisted fingerprint |
| B07 | PASS_COUNTED | HTTP | Semantic no-op returns changed=false without audit mutation |
| B08 | PASS_COUNTED | HTTP | Stale plan fingerprint maps to ADMIN_STATE_STALE |
| B09 | PASS_COUNTED | HTTP | BOOLEAN entitlement value persists with type |
| B10 | PASS_COUNTED | HTTP | INTEGER entitlement value persists with type |
| B11 | PASS_COUNTED | HTTP | Entitlement type mismatch preserves draft |
| B12 | PASS_COUNTED | HTTP | Deprecated definition rejects new draft SET |
| B13 | PASS_COUNTED | HTTP | Existing entitlement removal changes fingerprint and persistence |
| B14 | PASS_COUNTED | HTTP | Absent removal preserves accepted P4 changed=false semantics |
| B15 | PASS_COUNTED | HTTP | Published plan revision is immutable and published |
| B16 | PASS_COUNTED | HTTP | Published revision update is rejected and unchanged |
| B17 | PASS_COUNTED | HTTP | Draft plan cannot activate without published revision |
| B18 | PASS_COUNTED | HTTP | Valid published revision permits activation |
| B19 | PASS_COUNTED | HTTP | Active plan transitions to HIDDEN |
| B20 | PASS_COUNTED | HTTP | Injected audit failure rolls plan mutation back |
| C01 | PASS_COUNTED | HTTP | Price plan/code/market/channel/status persist |
| C02 | PASS_COUNTED | HTTP | Duplicate price code conflicts without duplicate row |
| C03 | PASS_COUNTED | HTTP | Missing-plan price is rejected |
| C04 | PASS_COUNTED | HTTP | Archived-plan price is rejected |
| C05 | PASS_COUNTED | HTTP | Draft price revision binds to valid published plan revision |
| C06 | PASS_COUNTED | HTTP | Cross-plan plan revision is rejected |
| C07 | OMITTED_INAPPLICABLE | HTTP | Accepted P4 semantics permit unpublished plan revision drafting; no P6.4 rejection branch exists |
| C08 | PASS_COUNTED | HTTP | Draft price terms update fingerprint |
| C09 | PASS_COUNTED | HTTP | Semantic no-op price update returns changed=false |
| C10 | PASS_COUNTED | HTTP | Stale price fingerprint maps to ADMIN_STATE_STALE |
| C11 | PASS_COUNTED | HTTP | Valid draft price revision publishes |
| C12 | PASS_COUNTED | HTTP | Published price revision rejects draft update |
| C13 | PASS_COUNTED | HTTP | Price cannot activate without required revision |
| C14 | PASS_COUNTED | HTTP | Valid price status transition persists |
| C15 | PASS_COUNTED | HTTP | Stale expected price status maps to ADMIN_STATE_STALE |
| C16 | PASS_COUNTED | HTTP | First sale assignment creates assignmentRevision |
| C17 | PASS_COUNTED | HTTP | Stale assignment revision maps to ADMIN_STATE_STALE |
| C18 | PASS_COUNTED | HTTP | Assignment outside effective window is rejected |
| C19 | PASS_COUNTED | HTTP | Null selected price closes sale per P4 semantics |
| C20 | PASS_COUNTED | HTTP | Price inspection proves persisted fingerprint and safe terms |
| C21 | PASS_COUNTED | HTTP | Injected audit failure rolls price mutation back |
| D01 | PASS_COUNTED | HTTP | BOOLEAN/CAPABILITY definition persists |
| D02 | PASS_COUNTED | HTTP | INTEGER/LIMIT definition persists |
| D03 | PASS_COUNTED | HTTP | Duplicate definition is rejected |
| D04 | PASS_COUNTED | HTTP | Definition description update persists |
| D05 | PASS_COUNTED | HTTP | Stale description maps to ADMIN_STATE_STALE |
| D06 | PASS_COUNTED | HTTP | Definition deprecation persists deprecatedAt |
| D07 | PASS_COUNTED | HTTP | Deprecated definition rejects new override SET |
| D08 | PASS_COUNTED | HTTP | Exact entitlementKey filter returns only requested definition |
| D09 | PASS_COUNTED | HTTP | Safe definition projection excludes audit data |
| D10 | PASS_COUNTED | HTTP | Injected audit failure rolls definition mutation back |
| E01 | PASS_COUNTED | HTTP | First override SET creates revision 1 |
| E02 | PASS_COUNTED | HTTP | Expected revision SET creates next revision |
| E03 | PASS_COUNTED | HTTP | CLEAR creates next accepted revision |
| E04 | PASS_COUNTED | HTTP | Stale latest revision maps to ADMIN_STATE_STALE |
| E05 | PASS_COUNTED | HTTP | Wrong typed value creates no new revision |
| E06 | PASS_COUNTED | HTTP | Unknown definition is rejected |
| E07 | PASS_COUNTED | HTTP | Missing account creates no override row |
| E08 | PASS_COUNTED | HTTP | Future override is inactive before effectiveFrom |
| E09 | PASS_COUNTED | HTTP | Active SET supersedes plan value |
| E10 | PASS_COUNTED | HTTP | Expired override falls back to plan value |
| E11 | PASS_COUNTED | HTTP | Active CLEAR falls back to plan value |
| E12 | PASS_COUNTED | HTTP | History ordering and continuation are distinct and complete |
| E13 | PASS_COUNTED | HTTP | Override cursor is isolated by account and filter |
| E14 | PASS_COUNTED | HTTP | Operator reason is absent from safe history projection |
| E15 | PASS_COUNTED | HTTP | Injected audit failure rolls override mutation back |
| F01 | PASS_COUNTED | HTTP | OWNER publishes global compatibility revision |
| F02 | PASS_COUNTED | HTTP | OWNER publishes chrome-scoped revision |
| F03 | PASS_COUNTED | HTTP | OWNER publishes yandex_chromium revision |
| F04 | PASS_COUNTED | HTTP | Same-policy publishes increase deterministically |
| F05 | PASS_COUNTED | HTTP | Blocked versions persist and read sorted |
| F06 | PASS_COUNTED | HTTP | Invalid minimum/recommended relationship is rejected |
| F07 | PASS_COUNTED | HTTP | Maintenance mode/code invariant is enforced |
| F08 | PASS_COUNTED | DB_ADAPTER | Transaction-time compatibility denial writes neither revision nor audit |
| F09 | PASS_COUNTED | HTTP | Concurrent same-policy publication has distinct sequential revisions |
| F10 | PASS_COUNTED | HTTP | Injected audit failure rolls compatibility publication back |
| F11 | PASS_COUNTED | HTTP | Publication creates no config release |
| F12 | PASS_COUNTED | HTTP | Publication mutates no bootstrap/config rollout |
| F13 | PASS_COUNTED | HTTP | Unlinked policy has empty linkedConfigVersions |
| F14 | PASS_COUNTED | HTTP | Existing SYSTEM compatibility publication/read path works |
| G01 | PASS_COUNTED | HTTP | Plan exact filters and ordering are stable |
| G02 | PASS_COUNTED | HTTP | Plan cursor rejects incompatible status scope |
| G03 | PASS_COUNTED | HTTP | Price exact plan/market/channel filters work |
| G04 | PASS_COUNTED | HTTP | Price cursor rejects incompatible query scope |
| G05 | PASS_COUNTED | HTTP | Plan inspection returns safe revisions/fingerprint without audit reason |
| G06 | PASS_COUNTED | HTTP | Price inspection returns safe assignments without freeform reason |
| G07 | PASS_COUNTED | HTTP | Definition cursor is canonical and deterministic |
| G08 | PASS_COUNTED | HTTP | Override history cursor isolation and projection are safe |
| G09 | PASS_COUNTED | HTTP | Effective entitlement returns accepted P4 source/value resolution |
| G10 | PASS_COUNTED | HTTP | Compatibility read excludes signing/config secret material |
| H01 | PASS_COUNTED | HTTP | Concurrent plan updates yield one winner and one stale |
| H02 | PASS_COUNTED | HTTP | Concurrent price updates yield one winner and one stale |
| H03 | PASS_COUNTED | HTTP | Concurrent assignments yield one winner and one stale |
| H04 | PASS_COUNTED | HTTP | Concurrent overrides yield one winner and one stale |
| H05 | PASS_COUNTED | DB_ADAPTER | Role-revoke race never authorizes stale session snapshot |
| H06 | PASS_COUNTED | HTTP | P6.3 subscription mutation retains shared admin authorization |
| H07 | PASS_COUNTED | HTTP | P6.2 principal transaction-time authorization remains intact |
| H08 | PASS_COUNTED | HTTP | P4 catalog and price-grandfathering authority remains intact |
| H09 | PASS_COUNTED | HTTP | P3 compatibility resolution is unchanged without config release |

## Count reconciliation

- Physical instances: 113.
- Counted meaningful distinct behaviors: 112 (`A=14, B=20, C=20, D=10,
  E=15, F=14, G=10, H=9`).
- Omitted: 1 (`C07`), for the accepted P4 semantic stated in its row.
- HTTP-backed: 110. DB-adapter-only: 3 (`A13`, `A14`, `H05`).
- No matrix-ID generation loop, duplicate row, UUID-only variant, renamed
  duplicate, schema-existence assertion, or no-exception-only case is used.
