# VK Mini App M5 owner policy freeze — 2026-08-30

Status: **FROZEN — documentation-only; M5 code gate remains BLOCKED**

## 1. Authority and relation to revalidation

Authority order is current official VK Developer documentation, current official
VKCOM source, sanitized registered-app staging evidence, then owner decisions.
A missing VK fact is `UNRESOLVED_VK_CONTRACT`; an official conflict is
`OFFICIAL_CONFLICT`. This ADR never converts an owner decision into a VK
requirement. `VK_PLATFORM_M5_IMPLEMENTATION_REVALIDATION_2026-08-30.md`
remains the dated evidence ADR: it proves signature verification, but not a VK
freshness TTL or `vk_ts` unit. This ADR closes owner-policy, architecture, and
product decisions only.

## A. VERIFIED VK CONTRACT

- Verify signed launch parameters using the current official VK signature
  contract before using `vk_user_id` for authorization.
- `vk_ts` is signature-generation time, but `VK_TS_UNIT = STAGING_REQUIRED`
  and `VK_MANDATED_FRESHNESS_TTL = UNRESOLVED`.
- `https://api.autopostmanager.ru` is `CURRENT_SERVED_ORIGIN` only, not proof
  of a VK-registered development or production origin.

## B. OUR_SECURITY_POLICY

### S1 — freshness and replay

`OUR_LAUNCH_MAX_AGE_SECONDS = 300`; `OUR_LAUNCH_FUTURE_CLOCK_SKEW_SECONDS =
60`. Neither is a VK requirement. Do not activate the 300-second test until
real staging proves how `vk_ts` maps to server time. Once normalized, accept
only age `<= 300` seconds and timestamps at most 60 seconds in the future.

Derive SHA-256 launch fingerprint from canonical verified signed material, and
never persist raw query or `sign`. A repeated still-fresh fingerprint revokes
prior active sessions from that fingerprint and gets a fresh token. It never
extends the original acceptance window; purge records at its replay horizon.
If staging is incompatible, return `SECURITY_POLICY_STAGING_CONFLICT` and
revise policy explicitly later. `S1_POLICY = OWNER_APPROVED`;
`S1_RUNTIME_ENABLEMENT = STAGING_REQUIRED`.

### S2 and S3 — sessions and M6 deferral

`SESSION_TTL_SECONDS = 900`, absolute/non-sliding; ordinary use never extends
`expires_at`; no refresh token or public refresh endpoint. Renewal requires
another accepted signed-launch bootstrap; expired/revoked sessions fail closed.
`S2_POLICY = OWNER_APPROVED`.

`S3_M5_STANDALONE_REQUIRED = no`; `S3_STATUS = DEFER_TO_M6`. Do not reactivate
the retired Bot calendar handoff or change Bot `open_app`.

### S4 — bearer token

Server-side CSPRNG, minimum 256 bits; V1 may use `secrets.token_urlsafe(32)`.
Return opaque URL-safe token once and subsequently use `Authorization: Bearer
<opaque-session-token>`. Persist SHA-256(token) only. Never persist/log/metric
the raw token or put it in errors. Frontend memory only: no local/session
storage, cookies, URL/hash/query, analytics payload, or third-party script.
`S4_TOKEN_ENTROPY = >=256 bits`; `S4_TOKEN_FORMAT = opaque URL-safe token`;
`S4_TOKEN_STORAGE = SHA-256 hash only`; `S4_POLICY = OWNER_APPROVED`.

### S5 — origins

Exact allowlist only: scheme + host + explicit non-default port. No wildcard,
suffix wildcard, regex broadening, Origin reflection, User-Agent/Referer
bypass. State-changing requests require allowed Origin; allow Authorization;
HTTPS outside local development. After staging, configure
`KIP_VK_MINIAPP_ALLOWED_ORIGINS` to exact proved registered origins only.
`S5_POLICY_RULE = OWNER_APPROVED`; `S5_ALLOWED_ORIGIN_VALUES = STAGING_REQUIRED`.

### S6 and S7 — lifecycle and retention

Every successful bootstrap issues a new token. Repeat fresh fingerprints revoke
associated active sessions before/while replacement issues; no sliding renewal
or public refresh. Backend disablement prevents existing session use, and
app-id/protected-key/origin security rotation invalidates pre-rotation sessions.
Operator revocation stays internal. Different valid launches for one user may
have independent sessions. `S6_POLICY = OWNER_APPROVED`.

Raw launch material is `REQUEST_MEMORY_ONLY`: never SQLite, logs, exception
text, API errors, metrics, analytics, browser storage, handoff records, or
results. Only verified app/user IDs, session times, token hash, non-reversible
SHA-256 fingerprint, and minimal reason enums may persist. Sanitized staging
keeps only non-secret/non-identity gate outcomes. `S7_DERIVED_FINGERPRINT =
SHA256_ONLY`; `S7_POLICY = OWNER_APPROVED`.

## C. OUR_APPLICATION_ARCHITECTURE

`POST /v1/recommendations/resolve` is unchanged and frozen by
`DATA_API_CONTRACT.md`. No second Core, no self-HTTP: M5 calls
`RecommendationApplicationService.resolve(...)` directly.

### `POST /v1/vk/miniapp/session`

Authorization is `VKLaunch <base64url>`: base64url UTF-8 bytes of exact signed
launch query without leading `?`. This is our unambiguous application transport,
not VK mandate. Require feature enabled + allowed Origin, bounded decode/parse,
official signature, expected app id, proven `vk_ts` normalization, S1 checks,
verified user, fingerprint rotation, token creation, hashed state persistence.

Success HTTP 200:

```json
{"api_version":"v1","session":{"token_type":"Bearer","session_token":"<opaque>","expires_in":900}}
```

Never return key, raw query, sign, fingerprint, user id, or internal id.
Untrusted/malformed/stale/future identity: HTTP 401 `MINIAPP_AUTH_INVALID`,
`Mini App authentication failed.` Feature/config unavailable: HTTP 503
`MINIAPP_UNAVAILABLE`, `Mini App service is unavailable.` Internal logs use
bounded non-secret reason enums only.

### `POST /v1/vk/miniapp/recommendations/resolve`

Require Bearer token. Accept only required `birth_day`, `birth_month`, `gender`
and optional `birth_year`; reject `marketplace`, `channel`, `availability`,
`destination`, `product_key`, `chertog`, `reason_code`, `vk_user_id`, and
unknown fields. Backend supplies `marketplace = null`.

Invalid/missing/expired/revoked sessions are HTTP 401 `MINIAPP_SESSION_INVALID`
with `Mini App session is invalid.` Preserve existing M2-equivalent errors
(`MALFORMED_JSON`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`,
`INVALID_REQUEST`, `CONFIGURATION_UNAVAILABLE`, `CORE_ERROR`, `INTERNAL_ERROR`)
without FastAPI/Pydantic default bodies.

HTTP 200 embeds immutable exact M2 success JSON as `result` and enriches only:

```text
{
  "result": <exact existing M2 success JSON object>,
  "product_actions": [
    {"destination":"vk","label":"VK","url":"<server-resolved>"},
    {"destination":"ozon","label":"Ozon","url":"<server-resolved>"},
    {"destination":"wildberries","label":"Wildberries","url":"<server-resolved>"}
  ]
}
```

URLs resolve server-side from `recommendation_product_links.v1.json`; frontend
owns no registry. Reuse X-Request-Id/X-Result-Id where compatible. Actions do
not alter product, Chertog, reason, or semantic computation.

## D. OUR_PRODUCT_POLICY

Flow remains Start → Date → Gender → Result → Product action → Start over.
Result is one card with `Посмотреть оберег` and `Подобрать снова`. The first
opens a separate screen with destinations, in order: VK, Ozon, Wildberries, for
the same already-selected product; it is not a catalogue carousel. Restart
clears active date/gender state.

`M5_INITIAL_RESOLVE_MARKETPLACE = null`. Thus Voron + male gets base semantic
result; a later Wildberries click does not activate `kolyadnik → alatyr` and
does not re-run the resolver. A future marketplace-bound-before-resolution flow
is separate.

`M5_MISSING_DESTINATION_BEHAVIOR = HIDE_ONLY_MISSING_DESTINATION`. Preserve
semantic result; if all unavailable, show neutral temporary-links text and
restart. No stock/product/semantic fallback.

## E. STAGING_REQUIRED and resulting status

Still required: current control-plane registration; protected enabled/app-id/key
config; exact registered dev/prod origins; real registered-app Init, launch,
signature fixtures; `vk_ts` unit semantics; selected-client evidence. Do not
reopen existing app-ID 54743026 evidence, 200 public route, supported deploy
precedence, signature revalidation, or synthetic wrong-app/signature rejection.

```text
S1_LAUNCH_POLICY=OWNER_APPROVED
S1_RUNTIME_ENABLEMENT=STAGING_REQUIRED
S2_SESSION_TTL_POLICY=OWNER_APPROVED
S3_HANDOFF_POLICY=DEFER_TO_M6
S4_TOKEN_POLICY=OWNER_APPROVED
S5_ALLOWED_ORIGIN_RULE=OWNER_APPROVED
S5_ALLOWED_ORIGIN_VALUES=STAGING_REQUIRED
S6_SESSION_LIFECYCLE_POLICY=OWNER_APPROVED
S7_RAW_LAUNCH_RETENTION_POLICY=OWNER_APPROVED
M5_HTTP_CONTRACT=FROZEN
MINIAPP_PRODUCT_ACTION_CONTRACT=FROZEN
M5_INITIAL_MARKETPLACE_MODE=NEUTRAL_NULL
M5_PRODUCT_DESTINATIONS=VK,OZON,WILDBERRIES
M5_DESTINATION_SELECTION_CHANGES_SEMANTIC_RESULT=no
M5_WB_OVERRIDE_ON_POST_RESULT_CLICK=no
FINAL_ILLUSTRATIONS_REQUIRED_FOR_M5_CODE_ENTRY=no
FINAL_ILLUSTRATIONS_REQUIRED_FOR_FINAL_UI_ACCEPTANCE=yes
M5_CODE_GATE=BLOCKED
```
