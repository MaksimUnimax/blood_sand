# VK Mini App M5 backend foundation — 2026-08-30

START_HEAD: `5af16bf87900e5619cb334447e7362fa4a613b38`.

This local-only implementation adds standalone signed-launch bootstrap and
authenticated recommendation resolve. Migration V8 adds
`vk_miniapp_standalone_sessions`; historical `vk_miniapp_handoffs` and
`vk_miniapp_sessions` are unchanged.

## Implementation decisions

- Enabled standalone configuration is decoupled from owner/handoff fields and
  fails closed unless the frozen App ID, 900-second session TTL, exact HTTPS
  origins, and 300/60-second policies are explicitly configured.
- `VKLaunch` carries strict base64url launch material. The existing official
  verifier is reused, `vk_ts` is treated as Unix seconds, and SHA-256 launch
  fingerprints support rotation only until the original launch horizon.
- Opaque 256-bit bearer tokens are stored only as SHA-256 hashes. Sessions are
  absolute/non-sliding. Fresh enabled-runtime initialization conservatively
  revokes existing standalone sessions; this is `OUR_V1_IMPLEMENTATION_DETAIL`,
  not a VK contract.
- M5-only exact-Origin CORS and preflight are implemented without changing M2.
  The retired calendar HTTP routes are constructor-only legacy behavior and are
  absent from normal application construction.
- Authenticated resolve calls `RecommendationApplicationService.resolve()` once
  directly, with `marketplace=None`, embeds the existing M2 serialization, and
  adds independently validated server-resolved actions in VK/Ozon/Wildberries
  order. Voron/male remains `kolyadnik`.

## Local acceptance

Executed: `.venv/bin/python -m unittest discover -s recommendations/tests -p
'test_*.py'`; `git diff --check`.

Privacy audit: no raw launch query, sign, bearer token, or protected key is
persisted or emitted by the new M5 paths. Deployment status: **NOT_DEPLOYED**.

Next slice: `M5_BACKEND_STAGING_DEPLOYMENT_AND_REAL_SESSION_BOOTSTRAP_ACCEPTANCE`.

## Pre-deployment hardening

Date: 2026-08-30. Deployment was **not** performed.

- Official-source revalidation: current VK Developer launch-parameter pages
  remained inaccessible from this environment; current official `VKCOM/vk-bridge`
  source remained consistent with the recorded contract for
  `VKWebAppInit`/`VKWebAppGetLaunchParams` and the launch fields used here.
  Result: `OFFICIAL_SOURCE_REVALIDATION=PARTIAL_NO_CONFLICT`.  `vk_ts` remains
  seconds from the registered-app staging evidence, and no VK freshness TTL was
  invented.
- Standalone `VKMiniAppConfig.from_environment()` now reads only the seven M5
  policy fields when enabled.  Historical OWNER_ID, handoff secret, and
  handoff TTL constructor fields remain available but are ignored by the
  environment-created standalone configuration.  A one-shot construction using
  the real staging EnvironmentFiles plus command-scoped M5 policy values
  passed; the configured legacy owner setting was present, non-secretly
  observed only as present, and ignored.
- Replay fingerprinting now hashes the same canonical sorted `vk_*` material
  used for signature verification, not the raw launch query.  It never stores
  canonical material, `sign`, the raw query, envelope, or bearer token.
- Fingerprint cleanup is strictly after the accepted launch horizon.  Thus a
  replay at exactly 300 seconds rotates the predecessor; at 301 seconds the
  launch is rejected, while a still-live 900-second application session remains
  usable after fingerprint cleanup.
- M5-only exact-origin CORS is now attached centrally after M5 route and error
  handling.  It covers allowed-origin error envelopes without adding global
  CORS or changing M2.
- The explicit acceptance mapping is in
  `test_vk_miniapp_m5_backend.py`: configuration/fail-closed and malformed
  legacy environment cases (`test_environment_config_is_standalone_and_fail_closed`);
  signed transport, timestamp, storage, canonical replay, replay horizon and
  TTL cases (`test_bootstrap_boundaries_and_private_storage`,
  `test_canonical_replay_and_exact_horizon_rotation`,
  `test_rotation_absolute_ttl_and_fingerprint_cleanup`); M5 error CORS and
  M2 isolation (`test_m5_error_cors_is_central_and_m2_unchanged`); lifecycle
  operator/restart isolation (`test_operator_and_restart_revocation_leave_bot_tables_alone`);
  and resolve parity/actions/Voron/retired transport (`test_resolve_parity_actions_cors_and_retired_routes`).
- A SQLite backup copy of the real staging DB migrated V7→V8: required
  historical row counts were unchanged, the new standalone table existed,
  foreign-key and integrity checks passed, and a second initialize was
  idempotent.  The live DB remains V7 and unmodified.
- Full regression: `.venv/bin/python -m unittest discover -s
  recommendations/tests -p 'test_*.py'` — 146 tests passed.  `uv` is absent in
  this server environment, so the existing project virtualenv was used.
  `git diff --check` passed.
