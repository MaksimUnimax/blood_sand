# P3 Security / Architecture Audit — 2026-09-05

Status: **PASS — P3 SECURITY / ARCHITECTURE AUDIT**

Technical ID: `PRODUCT-CONTROL-PLANE-P3.7-SECURITY-ARCHITECTURE-FINAL-AUDIT-LOCAL`
Attempt: `1`

## Scope and reproducibility

- Canonical checkout: `/opt/product-control-plane-src/blood_sand`.
- Branch: `feature/product-control-plane-server-2026-09-04`.
- Audited range: P2 final `0ca219b078294bd57eb575a0ebf08ae32070237b` through P3 HEAD `d955278fcaefc2fcd116fa64427108cb7735193c`.
- Initial worktree: clean.
- Remote start checks, over the accepted deploy key on GitHub SSH port 443, both returned `d955278fcaefc2fcd116fa64427108cb7735193c`.
- Validation runtime: Node `24.20.0`, pnpm `10.34.5`, PostgreSQL `18.0`, Docker Engine `29.1.3`.
- Host Node, pnpm, PostgreSQL, MySQL, nginx, Apache, and protected services were not modified. PostgreSQL and Playwright resources were disposable.

## History and ancestry

Expected checkpoints are all ancestors, in order: P3.1 implementation `bde40d98571c1e5f541322f4c888d37ce5aab665`; P3.1 docs `b77b569d51014851322d1caa2da01f785310e161`; P3.2 implementation `d68b522aca38215ac5b45f1d457bbae5038f3624`; P3.2 docs `d6fae7cd4f49d70eac7b8dda9e189f317dc31052`; P3.3 implementation `6c8114761ba083ee7bec5c420824950709eacb24`; P3.3 docs `7155c080527d3bfa9a2dc71c99c4f4b33ab95727`; P3.4 implementation `0d094dc6e809b95e2273406059e0ac66e061e8ef`; P3.4 docs `4dd3001a7a95ab816a8ebbaa0afd0743a542ad47`; P3.4 docs correction `4955962b6c0e651a6f72bee68cb033e98571ef20`; P3.5 implementation `77456f2c2e492fdd521dcafdad9e0bfe26ab6af6`; P3.5 docs `a547cd1e6d764d8d6f9cc5732808ec352c79e27d`; P3.6 implementation `b796240518af2fe0c61f2d43f9f5d2bee0cc3d87`; P3.6 docs/current HEAD `d955278fcaefc2fcd116fa64427108cb7735193c`.

The range is a linear 13-commit chain with no merge commits. Changed paths are confined to the Server P3 implementation, tests, contracts, migrations, OpenAPI, and evidence/docs. There is no Bridge implementation commit, seller/product work, unrelated history, or old-branch merge contamination. `tooling/llm-api-bridges/ozon-seller` is unchanged in the range.

## Architecture and staged truth

PASS. The final architecture remains a modular monolith in which the control plane is separate from the seller data plane. P3 contains no live Bridge runtime dependency, Ozon credential ownership, raw seller-response persistence, AI conversation persistence, or executable remote configuration. The staged snapshot is `account ACTIVE`, `subscription NONE/null`, `devicePolicy ACTIVE`, `entitlements {}`, P3 boolean `features`, and `ai UNCONFIGURED`; no P4/P5/P7/P8 domain rows or semantics are fabricated.

## Wire contract, authentication, and HTTP

PASS. `POST /v1/bootstrap` is registered once in `server/apps/api/src/bootstrap-routes.ts`. The strict request is `contractVersion`, SemVer `extensionVersion`, strict `browser { family, version }`, UUID `deviceId`, nullable non-negative integer `lastConfigVersion`, and optional strict object `detectedAi { family, surface, variant? }`; arrays and unknown fields are rejected. The response is a complete signed snapshot, never a delta, 304, ETag, conditional response, or server-cache response. `lastConfigVersion` does not change response form.

The payload schema in `server/packages/contracts/src/index.ts` enforces the P3 identifiers and strict fields, `devicePolicy.status` only, boolean feature map, and the staged subscription/entitlement/AI shape. Valid compatibility policy states are signed HTTP 200 responses: `UPDATE_RECOMMENDED`, `UPDATE_REQUIRED`, `UNSUPPORTED_BROWSER`, and `MAINTENANCE`; compatibility does not use HTTP 426.

The route reuses `ExtensionAuthService`. The live repository query checks active session, device, account, and owner user state, so valid JWT syntax alone cannot bypass persisted revocation/suspension. The authenticated principal supplies account and device identity; the body device must match it or the route returns 403 `DEVICE_MISMATCH`. No request-selected account identity is accepted.

## Cryptography and trust

PASS. `server/packages/remote-config/src/index.ts` signs and verifies Ed25519 envelopes with `envelopeVersion=bootstrap_envelope_v1`, `algorithm=Ed25519`, `keyId`, base64url canonical UTF-8 JSON `payload`, and base64url `signature`. The signature domain is exactly UTF-8 `product-control-plane/bootstrap-snapshot/v1`, NUL, UTF-8 `keyId`, NUL, payload bytes.

Canonicalization recursively sorts plain-object keys, preserves array order, and accepts only null, boolean, string, safe integer, array, and ordinary plain-object values. Floats, non-finite values, `-0`, bigint, undefined, functions, symbols, Date, Map, Set, and custom-prototype objects reject. The verifier order is strict envelope, packaged key-ID lookup, exact payload-byte decode, signature verification, JSON parse, strict payload schema, re-canonicalization, and exact byte comparison. Unknown keys, tampering, malformed encodings, invalid JSON/schema, and non-canonical bytes fail closed.

Access-token signing and config signing use separate roles, environment names, loaders, keys, and signature domains; config verification never treats an access-token public key as the config trust key. The P3.1 focused crypto evidence is 12/12 PASS.

## Config private-key boundary and signer ring

PASS. Config private material is loaded only by the API process from secret configuration. It is absent from PostgreSQL, audit events, HTTP responses, frontend/client cache, Bridge paths, repository contents, logs, and evidence. `CONFIG_SIGNING_KEY_RING_JSON` is strict version 1 with 1–8 Ed25519 private PKCS#8 PEM entries, canonical Base64, unique IDs, and unique derived public fingerprints. Exact derived SPKI DER and SHA-256 metadata binding is required for every entry at startup. The legacy singleton fallback is used only when the ring is absent; ring plus legacy configuration is rejected. Every issuance reselects the exact configured key, reads current DB lifecycle/events, requires `ACTIVE`, rechecks public metadata coherence, and signs; no lifecycle cache delays revocation.

The packaged client trust root is local input only. There is no remote trust-root delivery, key-discovery endpoint, DB lookup by client, TOFU, or dynamic `addTrustedKey` path. Server `REVOKED` prevents new signing but cannot mathematically invalidate an already shipped packaged public key; old envelopes remain constrained by P3.6 freshness/offline policy.

## Key lifecycle and rollout semantics

PASS. The lifecycle is `UNREGISTERED -> REGISTERED -> ACTIVE -> RETIRED`, with `REVOKED` terminal from registered/active/retired and invalid sequences failing closed. Events are append-only, strictly ordered, serialized per key with a PostgreSQL transaction advisory lock, and mutation plus audit are atomic. Publication requires `ACTIVE`; retirement is blocked for a selectable key, while emergency revoke is permitted in use and new signing under revoked state fails closed.

The single `configRolloutSelectionModeV1` helper maps `ACTIVE -> COHORT`, `PAUSED -> BASELINE_ONLY`, and `RETIRED -> ORDINARY_LATEST`. P3.3 resolution and P3.5 retirement safety use the same semantic source. Deterministic cohorts use the fixed SHA-256 rollout domain, rollout identity, seed, subject kind, and stable account/device identifier. The published release source graph pins immutable revisions, so later latest-revision changes cannot rewrite historical meaning.

The mandatory real-PostgreSQL PAUSED regression passed: the PAUSED baseline key cannot retire, while the PAUSED candidate key can retire when otherwise unused. ACTIVE protects both potential selections; RETIRED/no-rollout protect ordinary latest.

## Persistence and migrations

PASS. P3 persistence is migrations `0000..0007` only, with no `0008`. Published records, public signing metadata, lifecycle events, config releases, links, feature rules, rollouts, and compatibility revisions are immutable/restrict-protected as accepted. `config_releases.config_version` is generated identity. PostgreSQL stores public signing metadata only; no private-key column exists. Signing events are append-only.

Migration hashes are unchanged against their accepted historical checkpoints. Current SHA-256 values are: `0000` `9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56`; `0001` `0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f`; `0002` `f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449`; `0003` `ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6`; `0004` `38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d`; `0005` `6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21`; `0006` `37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f`; `0007` `1c8c32d6f9ea073788507736f06daaa67dee2f74465d2b990eb7fbcc67d0abe6`.

## Capability and seller-data boundary

PASS. P3 server-delivered data is typed declarative boolean/config policy. No JavaScript, WASM, eval/code-to-execute, script/module URL, arbitrary network URL, HTTP method, header, cookie/auth value, or provider-operation instruction exists in the accepted payload or profile schema. Server booleans can only gate packaged behavior. Unknown remote keys/strategies cannot create client operations. There is no P7 executable AI profile surface.

The final Server P3 tree and P2-final..P3 history contain no server ownership/storage path for Ozon Client-Id/API-Key, raw seller responses, orders, products, finance payloads, provider cookies, or AI conversation text. The Bridge guard passes, no Server P3 runtime package imports `tooling/llm-api-bridges/ozon-seller`, and the active Bridge implementation was not modified.

## Cache, freshness, and compatibility

PASS. `bootstrap_cache_v1` stores the exact `SignedBootstrapEnvelopeV1`, never an unsigned payload as authority, and re-runs `verifyBootstrapEnvelope` with packaged trusted keys on every load/use. Binding includes normalized origin, activated device ID, contract version, extension version, browser family/version, and normalized detected-AI context; `lastConfigVersion` is excluded from binding and derived only from a verified matching cache. Cache contains no access/refresh token, OTP, private signing key, Ozon credential, seller data, or conversation text. A client without credentials cannot use cache for first authorization.

Policy is live-first. Verified live policy is authoritative and overwrites matching cache, including blocked policy. Cache fallback is permitted only for a no-HTTP transport failure. No HTTP response, including 503, receives same-attempt fallback. Online 401/403 invalidates cache. HTTP 200 crypto failure, noncanonical/unknown-key/tampered envelope, and signed server-time rollback fail closed without fallback or cache overwrite. A lower config version with non-decreasing signed server time is accepted.

Trusted server-time and wall-time high-watermarks, an in-process monotonic anchor, and non-decreasing effective time prevent wall rollback from extending lifetime; monotonic rollback fails closed. Freshness boundaries are exact: `now < expiresAt` is `FRESH`; `expiresAt <= now < offlineGraceUntil` is `OFFLINE_GRACE`; `now >= offlineGraceUntil` is `EXPIRED`. No local grace or signed-time mutation is possible. The accepted limitation is that an in-process monotonic clock cannot prove elapsed time while the process is stopped; this is practical rollback mitigation, not hardware-grade trusted time.

One client compatibility helper enforces `MAINTENANCE > UNSUPPORTED_BROWSER > UPDATE_REQUIRED > UPDATE_RECOMMENDED > READY`. READY and UPDATE_RECOMMENDED remain usable; the other three remain authoritative blocked states, including when cached.

## Logging, audit, and dependency boundaries

PASS. Production structured logging redacts authorization/JWT, cookies, tokens, idempotency keys, device/user secrets, auth roots, private signing material, and secret fields. Request bodies, raw detected-AI input, signed envelope/payload bytes, seller credentials/responses, and conversation text are not logged. Normal bootstrap reads do not emit per-request audit events. P3 durable mutations write append-only audit records transactionally with the state mutation.

Package boundaries pass: `@product/bootstrap` has no Fastify or DB dependency; `simulated-extension-client` has no DB dependency; `remote-config` has no Fastify/server-framework dependency; and no Bridge runtime import exists.

## Supply chain and vulnerability audit

PASS. Server CI pins `actions/checkout` `11d5960a326750d5838078e36cf38b85af677262`, `pnpm/action-setup` `b906affcce14559ad1aafd4ab0e942779e9f58b1`, and `actions/setup-node` `49933ea5288caeca8642d1e84afbd3f7d6820020`. Frozen install is used.

In a fresh validation copy, `pnpm audit --audit-level=high` and `pnpm audit --prod --audit-level=high` both completed successfully after no retry was needed. Critical: 0; high: 0. Moderate: 4 all-dependency findings and 3 production findings. Low: 0. Reported advisory IDs were `GHSA-67mh-4wv8-2f99` (all/development esbuild), `GHSA-fxqj-rqcc-2cmp` (all and production postcss), `GHSA-w2qp-rph6-63g4` (all and production fastify), and `GHSA-3m5p-2c4r-xxw2` (all and production fastify). No dependency or lockfile update was made.

## Secret scan

PASS. Current tracked tree and P2-final..P3 history contain no `BEGIN PRIVATE KEY`, OpenSSH private key, static reusable config private PEM/Base64 material, deploy SSH private key, Ozon credential, real password, or real token. Runtime-generated private test keys are ephemeral and allowed. The Ozon/raw files found outside Server are not P3 control-plane ownership or storage paths and contain no detected secret marker.

## P3 exit traceability matrix

| Exit requirement | Normative authority / section | Implementation mechanism | Exact proof | Result |
|---|---|---|---|---|
| A. Bootstrap contract compatibility | `TEST_STRATEGY.md` §9; ADR-0008; ADR-0012 | Strict Zod request/payload/envelope schemas; single `/v1/bootstrap`; full snapshot service | `packages/remote-config/src/index.test.ts` “enforces strict request fields and bounded SemVer/machine identifiers”; `apps/api/src/openapi.test.ts` “generates the implemented P3.4 API surface”; E2E bootstrap strict snapshot test | PASS; 15 OpenAPI routes, one bootstrap route |
| B. Ed25519 sign/verify | `TEST_STRATEGY.md` §9; ADR-0008 §Decision | `signBootstrapSnapshot`, canonical bytes, Ed25519 verifier, packaged ring | `packages/remote-config/src/index.test.ts` “signs and verifies a valid, canonical snapshot”; “supports overlapping config keys, but never an access-token key”; focused P3.1 result 12/12 | PASS |
| C. Tamper rejection | `SECURITY.md` §20 item 5; ADR-0008 §Decision | Verify exact signed bytes before schema/application; fail-closed typed errors | `packages/remote-config/src/index.test.ts` “rejects payload and signature tampering”; “rejects malformed encodings and signed invalid JSON/schema”; E2E K1/K2/unknown-key tests | PASS |
| D. Expiry/offline grace | `SECURITY.md` §7; ADR-0014 “Freshness and clock policy” | Signed `expiresAt`/`offlineGraceUntil`; high-watermarks and monotonic anchor; no local extension | `packages/simulated-extension-client/src/policy.test.ts` “classifies exact expiry and grace boundaries”, “uses monotonic progression when the wall clock rolls back”; E2E fresh-cache, grace, grace-end, tamper cases | PASS |
| E. Unsupported client/version | `TEST_STRATEGY.md` §9; `INTEGRATION_CONTRACT.md` §§16–17; ADR-0014 compatibility | Shared compatibility resolver and signed 200 policy states | `packages/simulated-extension-client/src/policy.test.ts` “uses one compatibility precedence resolver for all signed states”; E2E UPDATE_REQUIRED and UNSUPPORTED_BROWSER tests | PASS |
| F. No remote capability expansion | `ARCHITECTURE.md` §2.2–2.3; `SECURITY.md` §3 S-003/S-004; `INTEGRATION_CONTRACT.md` §§9,14 | Typed boolean feature map, strict signed payload, packaged trust root, no executable/profile/network instruction schema | `packages/remote-config/src/index.test.ts` strict/canonical/schema tests; `packages/simulated-extension-client/src/policy.test.ts` cache verification tests; `pnpm bridge:guard`; source scan of P3 payload/config paths | PASS; remote payload cannot expand packaged capability |

ROADMAP P3 exit mapping is explicit: valid -> signed snapshot E2E and crypto test; tampered -> crypto tamper tests and P3.6 E2E tamper; expired -> exact grace-boundary unit/E2E; offline -> transport-loss, fresh-cache, and offline-grace E2E; unsupported-client -> UPDATE_REQUIRED/UNSUPPORTED_BROWSER E2E; no remote capability expansion -> strict schema, packaged trust-root, declarative-only source scan, and bridge-boundary guard. All passed.

## Full regression evidence

- Unit: `pnpm test`, exactly 201 passed, 0 failed, 0 skipped/todo. P3.1 crypto: 12/12.
- Real PostgreSQL integration: fresh PostgreSQL 18.0, all 15 integration files executed, exactly 93 passed, 0 failed, 0 skipped/todo. P3.2/P3.3/P3.4/P3.5 physical suites executed. PAUSED baseline/candidate regression passed.
- Migrations: first run PASS and second run PASS from an empty database; `0000..0007` only.
- OpenAPI generation twice: 15 routes, `POST /v1/bootstrap` exactly once; both SHA-256 values `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- DB-down fresh-copy matrix: frozen install, lint, format check, typecheck, unit, OpenAPI, bridge guard, and build all PASS with `DATABASE_URL` absent.
- DB-up matrix: lint, format check, typecheck, unit, integration, migration, OpenAPI, bridge guard, and build all PASS.
- Playwright `1.62.1`; Chrome for Testing `151.0.7922.34`; Chromium revision `1234`; full `PRODUCT_CONTROL_PLANE_E2E=1 pnpm test:e2e`: 24/24 passed, 0 failed, 0 skipped, 0 retries.
- Physical E2E matrix includes P2 activation/security; P3.4 auth/strict request/signature; P3.5 K1, K2 overlap, unknown new key, revoked signer 503; P3.6 fresh cache, offline grace, grace expiration, tamper, online denial/cache invalidation, UPDATE_REQUIRED, and UNSUPPORTED_BROWSER.

## Intentional accepted limitations

- Restart clock defense is practical rollback mitigation, not trusted hardware.
- Server lifecycle revocation cannot remotely remove an already packaged client public key.
- The actual Bridge/browser persistent storage adapter is deferred to P11.
- Subscription, entitlements, and AI remain staged values until future roadmap stages.
- There is no live Bridge integration before P11.

No P3 correction finding exists. No product semantic, executable, test, schema, package, lockfile, migration, workflow, or Bridge file was changed during this audit.
