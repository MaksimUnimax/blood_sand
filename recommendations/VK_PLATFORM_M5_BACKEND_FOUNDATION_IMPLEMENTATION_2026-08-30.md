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
