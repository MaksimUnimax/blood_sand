# Browser Bridge <-> Product Control Plane Integration Contract

Status: architectural contract; implementation schemas will be versioned under `server/packages/contracts/`  
Date: 2026-09-03

## 1. Purpose

This document is the stable seam between the evolving browser Bridge and the commercial server.

During parallel development the server uses a simulated client implementing this contract. The current Ozon Bridge is not modified merely to follow server implementation progress. At the integration roadmap gate, the then-current accepted Bridge build is adapted to this contract.

## 2. Ownership boundary

### Server owns

- user/account identity;
- authorized device/session state;
- subscription/commercial state;
- entitlements;
- feature policy;
- compatible client-version policy;
- AI adapter registry/health/profile revisions;
- signed configuration;
- safe diagnostic ingestion.

### Bridge/client owns

- Ozon credentials;
- Ozon request execution;
- provider quota/cache/prefetch state;
- provider response payloads;
- AI DOM binding and execution;
- conversation identity;
- bridge command/results state;
- local operation/security allowlists;
- local enforcement that remote config cannot expand packaged capabilities.

## 3. Contract version

Initial protocol family: `control_plane_v1`.

Every client request identifies a contract version. The server returns a deterministic unsupported-version error or compatibility response rather than guessing.

Breaking payload semantics require a new contract version.

## 4. Client identity model

A client request may carry:

```json
{
  "contract_version": "control_plane_v1",
  "extension_version": "1.0.0",
  "browser": {
    "family": "chrome",
    "version": "..."
  },
  "device_id": "...",
  "client_instance_id": "..."
}
```

`browser.family` is an explicit dimension. Initial values are expected to include `chrome` and later `yandex_chromium`; the contract MUST NOT equate the product with Chrome.

## 5. Device authorization API

Conceptual endpoints:

### `POST /v1/device-authorizations`

Creates an expiring activation request.

Returns:

- high-entropy `device_code`;
- human `user_code`;
- verification URL;
- expiry;
- polling interval.

### `GET/POST /v1/device-authorizations/{device_code}/token`

Returns one of:

- pending;
- denied;
- expired;
- approved + session credentials.

Actual method shape may be adjusted during API schema implementation, but security/idempotency semantics are fixed.

### Session credentials

- short-lived access token;
- opaque rotating refresh token;
- device/session identifiers;
- expiry metadata.

## 6. Refresh API

### `POST /v1/auth/refresh`

Input:

- current refresh token;
- device/client metadata required by policy.

Output:

- new access token;
- rotated refresh token;
- expiry.

Refresh rotation is atomic. Reuse of an invalidated token follows the security policy.

## 7. Bootstrap API

### `POST /v1/bootstrap`

This is the primary client control-plane call.

Conceptual request:

```json
{
  "contract_version": "control_plane_v1",
  "extension_version": "1.0.0",
  "browser": {
    "family": "chrome",
    "version": "..."
  },
  "device_id": "...",
  "last_config_version": 147,
  "detected_ai": {
    "family": "chatgpt",
    "surface": "work",
    "variant": "work_composer_v3"
  }
}
```

`detected_ai` is optional when the active tab is not a supported AI or detection has not completed.

Conceptual signed response payload:

```json
{
  "contract_version": "control_plane_v1",
  "config_version": 148,
  "issued_at": "...",
  "expires_at": "...",
  "offline_grace_until": "...",
  "server_time": "...",
  "account": {
    "status": "ACTIVE"
  },
  "subscription": {
    "state": "ACTIVE",
    "plan_revision": "seller-basic@3"
  },
  "device_policy": {
    "status": "ACTIVE"
  },
  "compatibility": {
    "extension": {
      "status": "SUPPORTED",
      "minimum_version": "1.0.0"
    },
    "browser": {
      "status": "SUPPORTED"
    }
  },
  "entitlements": {
    "source.ozon": true,
    "ozon.analytics": true,
    "ozon.performance": false
  },
  "features": {},
  "ai": {
    "status": "HEALTHY",
    "adapter": "chatgpt",
    "surface": "work",
    "profile_revision": 37
  }
}
```

The final implementation may split payload sections for caching, but the semantic snapshot must be coherent and versioned.

## 8. Signed snapshot envelope

The transport response must allow the extension to verify authenticity/integrity.

Conceptual envelope:

```json
{
  "key_id": "config-key-2026-01",
  "payload": { "...": "..." },
  "signature": "base64url..."
}
```

Ed25519 is the baseline signing algorithm. The extension packages trusted public key(s).

Signature verification does not replace local schema/security validation.

## 9. Capability resolution

The client MUST enforce:

```text
EFFECTIVE_CAPABILITY =
  PACKAGED_LOCAL_CAPABILITY
  ∩ SERVER_ENTITLEMENT
  ∩ REMOTE_FEATURE/HEALTH_POLICY
```

Examples:

- server can disable `ozon.analytics` for an expired plan;
- server can mark ChatGPT Work unavailable because health is BROKEN;
- server cannot invent `DELETE /some-provider-resource` if the extension does not package and allow that operation;
- server cannot supply arbitrary auth headers/URLs.

If remote config contains an unknown capability-expanding strategy, the extension fails closed for that strategy.

## 10. AI automatic detection contract

Normal UX does not require manual AI selection.

Responsibility split:

### Packaged client logic

- identifies active tab/host against packaged supported families;
- identifies AI family;
- identifies surface/variant using packaged detection capabilities;
- never trusts server to authorize an arbitrary host;
- reports safe detected identifiers to bootstrap.

### Server

- checks account entitlement;
- checks current health/maintenance state;
- resolves the allowed profile revision for the detected family/surface/variant/browser compatibility;
- returns declarative profile revision/config.

### Client

- validates profile schema/signature;
- verifies profile strategy types are packaged/supported;
- binds adapter.

## 11. AI rebind vs provider lifecycle

Changing active AI tab/surface/profile MAY reset/recreate:

- AI DOM observers;
- conversation binding;
- composer binding;
- delivery UI state that is explicitly conversation-local.

It MUST NOT reset merely because of AI rebind:

- Ozon credentials;
- provider quota timers;
- provider cache/prefetch state;
- durable provider execution ownership;
- already-completed provider work.

This separation is a required integration regression.

## 12. Browser modularity contract

Browser-specific facts are carried as compatibility/capability metadata.

The server account/subscription/entitlement APIs remain browser-independent.

A remote adapter profile can declare compatibility constraints such as supported browser families/versions, but browser-specific executable behavior remains packaged in browser/client code.

Chrome acceptance may precede Yandex Browser; that is a roadmap priority, not a protocol fork.

## 13. Diagnostics API

Conceptual endpoint:

### `POST /v1/diagnostics/events`

Events are schema allowlisted.

Example:

```json
{
  "event_version": 1,
  "extension_version": "1.0.0",
  "browser_family": "chrome",
  "ai_family": "chatgpt",
  "ai_surface": "work",
  "profile_revision": 37,
  "stage": "delivery",
  "error_code": "AI_COMPOSER_TIMEOUT",
  "duration_ms": 12034
}
```

No arbitrary nested payload/body field is permitted.

Forbidden:

- Ozon credentials;
- raw provider request/response;
- full conversation/prompt;
- customer PII;
- business report data.

## 14. Profile/config distribution

A profile revision is immutable after publish.

Profile schema may contain only known declarative primitives such as:

- selector strategies;
- accessibility-role/name strategies;
- packaged observation modes;
- timeout values constrained to accepted ranges;
- packaged feature toggles;
- expected contour metadata.

Profile schema MUST NOT contain:

- JavaScript source;
- `eval` expressions;
- remote module URLs;
- arbitrary HTTP instructions;
- arbitrary executable selectors/actions outside the packaged engine strategy vocabulary.

## 15. Rollout assignment

The server may assign profile/config revisions by stable rollout cohorts.

Requirements:

- assignment deterministic for a device/account unless rollout changes;
- percentages and target filters recorded as a rollout object;
- ability to pause/rollback;
- assignment observable in diagnostics/health;
- no silent historical rewrite.

## 16. Compatibility response states

Client compatibility should resolve to explicit states such as:

- `SUPPORTED`;
- `UPDATE_RECOMMENDED`;
- `UPDATE_REQUIRED`;
- `UNSUPPORTED_BROWSER`;
- `MAINTENANCE`.

The extension must show actionable UX rather than a generic network failure when server policy intentionally blocks an obsolete/incompatible client.

## 17. Offline behavior

Already-authorized client may use the last valid signed snapshot until `offline_grace_until` if server is temporarily unavailable.

The client MUST NOT locally extend that deadline.

When online again, fresh bootstrap takes precedence and can reflect revocation/suspension/health changes.

New activation, new payment proof and policy updates require server connectivity.

## 18. Error contract

Server APIs return stable error codes in addition to human-readable messages.

Examples:

- `AUTH_REQUIRED`;
- `DEVICE_REVOKED`;
- `DEVICE_LIMIT_REACHED`;
- `TOKEN_REUSE_DETECTED`;
- `SUBSCRIPTION_REQUIRED`;
- `CLIENT_UPDATE_REQUIRED`;
- `AI_ADAPTER_UNAVAILABLE`;
- `UNSUPPORTED_BROWSER`;
- `INVALID_CONTRACT_VERSION`;
- `RATE_LIMITED`.

Clients branch on codes, never on human message text.

## 19. Integration fixtures

Before real Bridge integration the server project must provide fixtures/reference clients for:

- device activation;
- refresh rotation;
- bootstrap request/response;
- signature verification;
- profile resolution;
- entitlement denial;
- AI health unavailable state;
- unsupported client version;
- offline snapshot;
- diagnostic event ingestion.

These fixtures are the development substitute for continuously importing the active Bridge.

## 20. Final Bridge integration delta audit

At P11:

1. identify the then-current accepted Bridge commit/artifact;
2. compare its AI/provider/session state ownership with this contract;
3. update only explicit contract gaps;
4. do not resurrect obsolete server assumptions from the old snapshot;
5. integrate auth/bootstrap/profile client code;
6. prove security boundaries;
7. run existing Bridge regression suite plus new server contract suite;
8. record exact integrated artifact/commit hashes.
