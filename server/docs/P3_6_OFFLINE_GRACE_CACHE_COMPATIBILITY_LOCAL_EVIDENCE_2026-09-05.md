# P3.6 Offline Grace, Cache, and Compatibility — Local Evidence

Status EXACT: **ACCEPTED — P3.6 DONE**

## BASE

- Canonical branch: `feature/product-control-plane-server-2026-09-04`
- Required base/committed HEAD: `a547cd1e6d764d8d6f9cc5732808ec352c79e27d`
- Remote start check 1: `a547cd1e6d764d8d6f9cc5732808ec352c79e27d`
- Remote start check 2: `a547cd1e6d764d8d6f9cc5732808ec352c79e27d` (4 seconds apart)
- Initial worktree: clean

## ADR

- ADR-0014: `docs/ADR/0014-p3-offline-grace-cache-and-client-freshness.md`
- Status: Accepted

## CRYPTO BOUNDARY

- P3.5 `verifyBootstrapEnvelope`: unchanged; it remains cryptographic/schema/canonical verification only.
- Cache use: exact signed envelope is reverified with the packaged trust ring on every load.
- Unknown signing keys and envelope tampering fail closed.

## CACHE

- Local cache version: `bootstrap_cache_v1`
- Store port: narrow async `BootstrapSnapshotStore` (`load`, `save`, `remove`)
- Reference store: deterministic `InMemoryBootstrapSnapshotStore`
- Stored authority: exact `SignedBootstrapEnvelopeV1`
- Binding: control-plane origin, activated device, contract version, extension version, browser family/version, normalized detected-AI context
- `lastConfigVersion`: derived only from a verified matching cache; server still returns a full snapshot
- Auth secrets cached: NO
- Seller/business data cached: NO
- Bridge browser-storage adapter: deferred to P11

## CLOCK

- Trusted server-time high-watermark: persisted per origin/device/contract and rejected when a live signed observation moves backward
- Wall-time high-watermark: persisted and only moved forward
- Monotonic anchor: injected `monotonicNowMs()` plus effective-time anchor
- Wall rollback: effective time remains non-decreasing; monotonic elapsed time continues to advance it in-process
- Monotonic rollback: cached use fails closed as `CLOCK_UNSAFE`; a later valid live bootstrap may re-anchor
- Restart limitation: elapsed time while the process is stopped cannot be proven without trusted hardware/external time; restart uses signed server-time, persisted wall-time, and current wall clock as practical mitigation

## FRESHNESS

- `FRESH`: effective time `< expiresAt`
- `OFFLINE_GRACE`: `expiresAt <= effective time < offlineGraceUntil`
- `EXPIRED`: effective time `>= offlineGraceUntil`
- Exact boundary tests: one millisecond before expiry, exact expiry, one millisecond before grace end, exact grace end
- Local grace extension: NO; signed timestamps are never rewritten or re-signed

## ONLINE POLICY

- Live-first: YES
- Valid live snapshot is authoritative and replaces the matching cache, including blocked compatibility policy
- Signed server-time replay/rollback: rejected as `SERVER_TIME_ROLLBACK`
- Lower `configVersion` with newer/non-decreasing signed server time: accepted
- Transport/no-HTTP-response failure: bounded matching-cache fallback permitted
- Any HTTP response: no same-attempt cache fallback, including 503
- HTTP 401/403: device cache removed; no cached fallback
- HTTP 200 verification failure: `SECURITY_FAILURE`; no fallback and no overwrite
- Cache-save failure: valid live policy remains usable

## COMPATIBILITY

- Shared precedence: `MAINTENANCE` -> `UNSUPPORTED_BROWSER` -> `UPDATE_REQUIRED` -> `UPDATE_RECOMMENDED` -> `READY`
- `READY`: usable
- `UPDATE_RECOMMENDED`: usable actionable advisory
- `UPDATE_REQUIRED`: explicit blocked state
- `UNSUPPORTED_BROWSER`: explicit blocked state
- `MAINTENANCE`: explicit blocked state
- Blocked signed policy is cached and preserved during genuine offline fallback

## TESTS

- Unit total: **201 passed**, 0 failed, 0 skipped/todo
- P3.5 baseline: 173
- P3.1 crypto: 12/12 PASS
- New P3.6 client policy/cache tests: 28
- Integration total: **93 passed**, 0 failed, 0 skipped/todo
- E2E total: **24 passed**, 0 failed, 0 skipped, 0 retries
- P3.5 E2E baseline: 17
- New P3.6 physical E2E cases: 7 (fresh cache, offline grace, grace expiry, tamper, online denial, UPDATE_REQUIRED, UNSUPPORTED_BROWSER)

## MIGRATIONS

- Files: `0000..0007`
- Latest: `0007_p3_3_features_rollouts.sql`
- Historical migrations unchanged from base: YES
- New `0008`: NO
- Fresh PostgreSQL first migration: PASS
- Second migration: PASS

## OPENAPI

- Route count: 15
- Generation/check run 1 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`
- Generation/check run 2 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`
- Expected SHA match: YES
- Deterministic: YES

## DB-DOWN

- Fresh validation copy: `/tmp/p36-validation.iQuxt5`
- Frozen install: PASS
- Lint: PASS
- Format check: PASS
- Typecheck: PASS
- Unit: PASS (201)
- OpenAPI: PASS
- Bridge guard: PASS
- Build: PASS
- `DATABASE_URL`: absent

## DB-UP

- PostgreSQL: 18.0, fresh disposable loopback instance
- Lint: PASS
- Format check: PASS
- Typecheck: PASS
- Unit: PASS (201)
- Integration: PASS (93)
- Migrate: PASS (first and second run)
- OpenAPI: PASS
- Bridge guard: PASS
- Build: PASS

## PLAYWRIGHT

- Version: 1.62.1
- Chrome for Testing: 151.0.7922.34
- Chromium revision: 1234
- Disposable browser cache: `/tmp/p36-playwright.NdocLi`
- Launch/close smoke: PASS
- Full `PRODUCT_CONTROL_PLANE_E2E=1 pnpm test:e2e`: PASS, 24 passed, 0 failed, 0 skipped, 0 retries

## SECURITY

- `REAL_CONFIG_PRIVATE_KEY_TRACKED`: NONE
- `STATIC_TEST_PRIVATE_KEY_TRACKED`: NONE (tests generate ephemeral keys; no static private material)
- `PRIVATE_KEY_DB_COLUMN`: NONE
- `CLIENT_REMOTE_KEY_FETCH`: NONE
- `CLIENT_TOFU`: NONE
- `CLIENT_DYNAMIC_TRUST_UPDATE`: NONE
- `UNSIGNED_PAYLOAD_CACHE_AUTHORITY`: NONE
- `ACCESS_TOKEN_IN_BOOTSTRAP_CACHE`: NONE
- `REFRESH_TOKEN_IN_BOOTSTRAP_CACHE`: NONE
- `OZON_CREDENTIAL_PATH`: NONE
- `RAW_SELLER_DATA`: NONE
- `EXECUTABLE_REMOTE_CONFIG`: NONE
- `ARBITRARY_REMOTE_URL_METHOD_HEADERS`: NONE
- `BRIDGE_RUNTIME_IMPORT`: NONE
- `SSH_PRIVATE_KEY_TRACKED`: NONE

## HOST

- Canonical host/workspace: `/opt/product-control-plane-src/blood_sand`
- Bridge runtime: unchanged/not touched
- PostgreSQL and browser resources: disposable local validation resources only

## HISTORICAL LOCAL ROADMAP STATE (before remote acceptance)

- P0: DONE
- P1: DONE
- P2: DONE
- P3: ACTIVE
- P3.1: DONE
- P3.2: DONE
- P3.3: DONE
- P3.4: DONE
- P3.5: DONE
- P3.6: ACTIVE
- P3.7: PLANNED
- P4-P15: PLANNED

At the historical local checkpoint, no commit was created and no push was
performed. The following remote acceptance finalized that checkpoint. Do not
start P3.7 as part of this acceptance.

## REMOTE ACCEPTANCE

- Implementation commit: `b796240518af2fe0c61f2d43f9f5d2bee0cc3d87`
- Canonical branch: `feature/product-control-plane-server-2026-09-04`
- Code-bearing Server CI: run `33947150898`
- Code CI URL: `https://github.com/MaksimUnimax/blood_sand/actions/runs/33947150898`
- Code CI head: `b796240518af2fe0c61f2d43f9f5d2bee0cc3d87`
- Code CI conclusion: SUCCESS
- Code CI canonical steps: all PASS; E2E completed and was not skipped
- Remote implementation content review: PASS
- Remote implementation history: exactly one commit from the required base
- Unit: 201 passed; P3.1 crypto 12/12 PASS
- Integration: 93 passed
- E2E: 24 passed, 0 skipped; P3.5 baseline 17 plus 7 physical P3.6 cases
- OpenAPI: 15 routes; SHA-256 `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`
- Migrations: `0000..0007` only; no `0008`; historical SQL unchanged
- Cache review: `bootstrap_cache_v1`, exact signed envelope authority, strict context binding, fail-closed parsing, and packaged-key re-verification PASS
- Clock/freshness review: server-time and wall-time high-watermarks, monotonic anchor/rollback handling, restart limitation, and exact freshness boundaries PASS
- Online policy review: live-first, transport-only fallback, no HTTP same-attempt fallback, 401/403 invalidation, 503/verification/time-rollback fail-closed behavior PASS
- Compatibility review: shared precedence and blocked-policy cache preservation PASS
- Security review: no unsigned cache authority, cached auth/provider/seller secrets, dynamic trust expansion, remote key fetch, executable remote config, Bridge import, or tracked private keys
