# P3.5 Simulated Client Key Rotation — Local Evidence

Status: ACCEPTED — P3.5 DONE

## Base

- Branch: `feature/product-control-plane-server-2026-09-04`
- Base HEAD: `4955962b6c0e651a6f72bee68cb033e98571ef20`
- Implementation HEAD: `77456f2c2e492fdd521dcafdad9e0bfe26ab6af6`
- Remote start check 1: `4955962b6c0e651a6f72bee68cb033e98571ef20`
- Remote start check 2: `4955962b6c0e651a6f72bee68cb033e98571ef20` (4 seconds apart).
- Implementation commit: `77456f2c2e492fdd521dcafdad9e0bfe26ab6af6`
- Implementation commit message: `feat(server): add config signing key rotation`.
- Canonical branch: `feature/product-control-plane-server-2026-09-04`.
- Implementation push: normal fast-forward; remote after push matched the implementation SHA.
- Code CI: Server CI run `33944080418` — [successful run](https://github.com/MaksimUnimax/blood_sand/actions/runs/33944080418), exact implementation head, push event.
- Remote implementation review: PASS; expected P3.5 scope only.

## ADR

- Accepted decision record: [ADR-0013](ADR/0013-p3-signing-key-lifecycle-and-client-trust.md).
- Server signing lifecycle and client packaged trust are separate trust domains.
- Server lifecycle revocation prevents new server signing but does not retroactively remove a public key from an already shipped client's packaged trust ring.

## Acceptance attempt history

- Attempt 1: initial local acceptance was later invalidated during remote
  acceptance diff review because the PAUSED retirement guard counted both
  baseline and candidate config releases as selectable.
- Attempt 2: corrective local re-acceptance passed all required local gates.

## PAUSED RETIREMENT CORRECTION

- The old guard incorrectly treated `PAUSED` like `ACTIVE`, protecting both
  baseline and candidate keys.
- Accepted P3.3 is the source of truth: `PAUSED` selects baseline directly,
  while `RETIRED` selects ordinary latest config.
- A shared pure state semantic helper maps `ACTIVE` to `COHORT`, `PAUSED` to
  `BASELINE_ONLY`, and `RETIRED` to `ORDINARY_LATEST`; the resolver and
  retirement guard both use it.
- The isolated real-PG regression protects the PAUSED baseline and permits
  candidate-key retirement when that candidate is not otherwise selectable.
- ACTIVE continues to protect both baseline and candidate, including at 0 and
  10000 bps. RETIRED and no-rollout continue to use ordinary latest.

## Lifecycle

- States: `UNREGISTERED`, `REGISTERED`, `ACTIVE`, `RETIRED`, `REVOKED`, plus invalid fail-closed results.
- Valid sequences: `REGISTERED`; `REGISTERED -> ACTIVATED`; `REGISTERED -> ACTIVATED -> RETIRED`; and `REVOKED` from `REGISTERED`, `ACTIVE`, or `RETIRED`.
- Invalid sequences reject first-event activation/retirement, duplicate events, reactivation, post-revocation mutation, and every impossible transition.
- Resolver never uses latest-event-wins semantics; event ordering is strictly monotonic by `(occurred_at, id)`.
- Publication uses a server-controlled lifecycle clock and deterministic `latest + 1 ms` advancement.
- Registration, exact P3.4 metadata adoption, lifecycle mutation, audit atomicity, per-key advisory serialization, active-only publication, retirement in-use guard, and emergency in-use revocation are covered by real PostgreSQL tests.
- Retirement follows the accepted P3.3 selectable-release semantics. Revocation is not blocked by currently selected configuration.

## Signer ring

- Canonical API-only secret: `CONFIG_SIGNING_KEY_RING_JSON`, strict version-1 JSON, 1–8 Ed25519 PKCS#8 private PEM entries.
- Legacy `CONFIG_SIGNING_KEY_ID` plus `CONFIG_SIGNING_PRIVATE_KEY_PEM_B64` remains a singleton compatibility fallback; incomplete or ambiguous configurations fail closed.
- Ring validation rejects unknown fields, malformed/non-canonical Base64, public keys, non-Ed25519 keys, duplicate IDs, duplicate public fingerprints, empty rings, and more than eight keys.
- Public SPKI DER, Ed25519 algorithm, and lowercase SHA-256 fingerprint are derived/bound internally.
- Every configured private entry is bound at API startup to exact immutable `signing_keys` metadata; all entries may be preloaded before activation.
- Every bootstrap issuance resolves the P3.3 key ID, reads current lifecycle from PostgreSQL, requires `ACTIVE`, rechecks immutable metadata, and signs with the exact ring entry.
- No ACTIVE/REVOKED lifecycle cache is used.
- Private material is API process secret configuration only; it is never stored in PostgreSQL, emitted to clients, or logged.

## Client trust

- `SimulatedExtensionClient` accepts a packaged public-key ring, defensively copies it, and has no remote trust expansion, key discovery, TOFU, or dynamic trust-update method.
- Its typed bootstrap method uses activated credentials and the client device ID, distinguishes HTTP errors from verification failures, and reuses P3.1 `verifyBootstrapEnvelope`.
- Old ring K1-only verifies K1 and rejects K2 as `UNKNOWN_SIGNING_KEY`.
- Overlap ring K1+K2 verifies both K1 and K2.
- New ring K2-only verifies K2.
- Tampered payloads, tampered signatures, malformed envelopes, and all accepted P3.1 verification failure classes fail closed.
- No freshness, cache, expiry, offline-grace, clock, or anti-downgrade decision was added; those remain P3.6.
- An old K1 envelope remains cryptographically verifiable by a client build that still packages K1 after server-side K1 revocation.

## Rotation drill

1. K1 was registered and active.
2. K2 public metadata was registered.
3. The API was configured with a bound K1+K2 private ring.
4. The overlap client packaged K1+K2.
5. K2 was activated while K1 remained active.
6. A K2-signed configuration was published.
7. A two-key baseline/candidate rollout produced K1-signed and K2-signed bootstrap responses, both verified by the overlap client.
8. After cutover, K1 was no longer selectable; retirement was then accepted.
9. K1 signing was no longer eligible, while K2 bootstrap continued.

## Revocation drill

- With K1 active and currently selected, emergency K1 revocation succeeded despite the in-use configuration.
- The next K1 bootstrap failed closed with HTTP 503 / `BOOTSTRAP_UNAVAILABLE`.
- The client-side packaged-trust limitation is explicitly documented above and in ADR-0013.

## Remote acceptance

- Corrected PAUSED baseline-only semantics were verified in the committed remote
  implementation: baseline retirement is blocked and the non-selectable
  candidate retires successfully.
- ACTIVE protects both baseline and candidate; RETIRED and no-rollout protect
  ordinary latest only. The shared rollout-state semantic helper is used by
  both P3.3 resolution and P3.5 retirement safety.
- Unit total: **173 passed**; integration total: **93 passed**; Playwright E2E
  total: **17 passed**.
- OpenAPI: **15 routes**, SHA-256
  `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Migrations: `0000..0007` only; no `0008`.
- All canonical Server CI steps passed, including real PostgreSQL integration,
  migration, build, Chromium installation, and E2E with no skipped E2E.

## Tests

- Unit total: **173 passed**, 0 failed, 0 skipped/todo.
- P3.4 unit baseline: 145 retained.
- P3.1 cryptographic baseline: **12/12 PASS**.
- Focused lifecycle, signer-ring configuration, and simulated-client tests pass, including all requested valid/invalid matrices and trust-ring/tamper/error cases.
- Integration total: **93 passed**, 0 failed, 0 skipped/todo.
- P3.4 integration baseline: 81 retained.
- New P3.5 integration tests: 12, covering registration/adoption, transitions, concurrency, audit rollback, active publication, paused/active/retired/no-rollout retirement and revocation safety, corrupt lifecycle, and two-key signing.
- Playwright E2E total: **17 passed**, 0 failed, 0 skipped, 0 retries.
- P3.4 E2E baseline: 13 retained.
- New P3.5 E2E tests: 4, covering K1 verification, K2 overlap verification, old-client unknown-key rejection, and revoked-server-key 503 behavior.

## Migrations

- Files: `0000` through `0007` only.
- Historical migrations `0000..0007` are unchanged from base.
- No `0008` exists.
- First migrator run: PASS.
- Second migrator run: PASS.

## OpenAPI

- Public route count: 15.
- Generation/check run 1 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Generation/check run 2 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Deterministic and unchanged; no lifecycle HTTP route was added.

## Validation gates

- DB-down fresh validation copy: frozen install, lint, format check, typecheck, unit tests, OpenAPI check, bridge guard, and build all PASS.
- DB-up PostgreSQL 18.0: lint, format check, typecheck, unit tests, 93 integration tests, migration (fresh and idempotent second run), OpenAPI check, bridge guard, and build all PASS.
- Node: 24.20.0. pnpm: 10.34.5.
- Playwright: 1.62.1. Chromium launch/close smoke PASS. Chromium revision: 1234. Chrome for Testing: 151.0.7922.34.
- E2E retained `PRODUCT_CONTROL_PLANE_E2E=1`, loopback, and disposable test database interlocks.

## Security

- `REAL_CONFIG_PRIVATE_KEY_TRACKED`: NONE
- `STATIC_TEST_PRIVATE_KEY_TRACKED`: NONE
- `PRIVATE_KEY_DB_COLUMN`: NONE
- `PRIVATE_KEY_LOG_OUTPUT`: NONE
- `PRIVATE_KEY_HTTP_OUTPUT`: NONE
- `CONFIG_SIGNING_RING_LOGGED`: NO
- `CLIENT_REMOTE_KEY_FETCH`: NONE
- `CLIENT_TOFU`: NONE
- `CLIENT_DYNAMIC_TRUST_UPDATE`: NONE
- `OZON_CREDENTIAL_PATH`: NONE
- `RAW_SELLER_DATA`: NONE
- `EXECUTABLE_REMOTE_CONFIG`: NONE
- `ARBITRARY_REMOTE_URL_METHOD_HEADERS`: NONE
- `BRIDGE_RUNTIME_IMPORT`: NONE
- `SSH_PRIVATE_KEY_TRACKED`: NONE

## Host and final state

- Host/workspace: `/opt/product-control-plane-src/blood_sand`, unchanged.
- Roadmap: P0/P1/P2 done; P3 active; P3.1/P3.2/P3.3/P3.4/P3.5 done; P3.6 next; P3.7 and P4–P15 planned.
- The implementation was committed and pushed; this evidence finalization is the docs-only acceptance commit.
- P3.6 was not started.
