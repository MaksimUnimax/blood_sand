# Product Control Plane — Security Architecture

Status: normative security baseline  
Date: 2026-09-03

## 1. Security objective

The commercial server must add identity, licensing, billing, configuration and operations without weakening the existing bridge's strongest security property: external AI text and remote server configuration cannot directly control arbitrary provider transport/auth behavior.

The baseline product minimizes server possession of seller-sensitive data.

## 2. Trust boundaries

### T1 — User browser / extension

Trusted to hold:

- Ozon credentials;
- local provider state;
- signed control-plane snapshot;
- extension session material;
- AI conversation binding state.

Not trusted merely because code runs on a user device: all server requests are authenticated/authorized and untrusted inputs are validated.

### T2 — Product control plane

Trusted for:

- account identity;
- subscription/entitlement policy;
- signed configuration;
- device/session authorization;
- admin policy;
- safe diagnostics metadata.

Not trusted to expand packaged provider capabilities.

### T3 — AI website

Untrusted for transport/security decisions. AI output is data to parse/validate, never authority for arbitrary URL/method/header/auth.

### T4 — Ozon/provider API

External provider. Credentials remain client-side in the baseline architecture.

### T5 — Billing/email/notification providers

External systems behind adapters. Their callbacks/responses are untrusted until provider-specific validation completes.

### T6 — Admin operators

Privileged but not omnipotent. Access is RBAC-controlled and actions are audited.

### T7 — Health runner accounts/browsers

Operational infrastructure with dedicated test accounts/secrets. It must be isolated from real user seller data and user sessions.

## 3. Fundamental invariants

### S-001 — Ozon credentials stay out of the product server

The baseline server MUST NOT accept, persist or log Ozon Client ID/API Key.

### S-002 — Raw seller data stays out of control-plane storage

The baseline server MUST NOT persist full Ozon responses/orders/finance/sales/customer payloads or full AI conversations.

### S-003 — Server cannot expand packaged extension capability

Effective capability:

`local packaged allowlist ∩ server entitlement ∩ remote health/policy`

The server may disable/restrict but cannot invent a provider operation, host, method, header, auth scheme or executable adapter logic not already packaged and locally validated.

### S-004 — Remote config is declarative only

No JavaScript/WASM/eval/script URL/remote module payloads in adapter profiles.

Every profile is schema validated, versioned and signed.

### S-005 — Published security-relevant revisions are immutable

Published adapter profiles/config releases/prices/plans are not silently edited. New revision + rollout/rollback only.

## 4. Authentication design

### 4.1 User authentication

Initial method: passwordless email OTP.

Requirements:

- cryptographically secure random code/token;
- short expiration;
- one-time use;
- attempt limit;
- request rate limit by email/IP/risk context;
- OTP stored as a salted/peppered secure hash or equivalent verification artifact, not plaintext;
- uniform outward errors where needed to reduce account enumeration;
- audit security-relevant events without storing OTP value.

### 4.2 Device authorization

The extension receives an expiring device authorization request. User confirms it from the authenticated portal.

Security requirements:

- high-entropy `device_code` never derived from human `user_code`;
- human code short-lived and rate-limited;
- device request bound to intended app/client type;
- exchange is single-use;
- device metadata shown to user before approval;
- no session token returned until approval;
- explicit denial/expiry states.

### 4.3 Access tokens

Use short-lived signed tokens with minimal claims.

Claims should include only what is required for request authentication/routing, e.g. subject/session/device/account IDs, token version, issue/expiry times and audience/issuer.

Do not embed a long-lived entitlement snapshot in access tokens; entitlements change independently and are resolved/bootstrap-cached separately.

### 4.4 Refresh tokens

Refresh tokens are opaque high-entropy secrets.

Server stores only a strong hash plus session/token-family metadata.

Rotation rules:

1. valid refresh token used;
2. old token atomically invalidated;
3. new refresh token issued;
4. reuse of an already-rotated token is detected;
5. configured response revokes token family/session and records a security event.

## 5. Session/device revocation

Revoking a device MUST:

- mark device revoked;
- revoke active refresh-token family;
- prevent future refresh/bootstrap authorization;
- not delete audit history;
- not require deletion/reset of locally stored Ozon credentials by the server, because the server never possessed them.

Client UX may separately offer local credential removal.

## 6. Bootstrap/config signing

The server signs configuration snapshots using an asymmetric signing key (Ed25519 preferred baseline).

- private signing key: production secret-management boundary only;
- public verification key: packaged in extension/client;
- payload includes config version, issue time, expiry, contract version and relevant device/account policy context;
- client verifies signature before applying;
- invalid/tampered/unknown-key payload fails closed to the last valid allowed snapshot or explicit unavailable state according to offline policy;
- key rotation must be designed with overlapping trusted public keys/version identifiers.

A signed server payload is not allowed to bypass local schema/security validation.

## 7. Offline grace security

Offline grace exists for availability, not permanent license bypass.

Snapshot must contain:

- issued time;
- normal expiry;
- offline-grace deadline;
- subscription/account/device state at issuance;
- config/profile revisions;
- signature/key ID.

Policy requirements:

- first-time authorization requires server;
- revoked/suspended state takes effect when client next reaches server;
- grace duration is bounded and configurable;
- clock manipulation risk is mitigated using last-seen server time/monotonic local policy as practical;
- expired snapshot cannot be extended locally.

## 8. Authorization and RBAC

Roles are explicit. Initial internal examples:

- `admin_owner`;
- `admin_ops`;
- `admin_support`;
- `admin_billing_readonly`;
- account `owner`;
- future account member roles.

Sensitive actions require narrowly scoped permissions.

Examples:

- support may revoke a device but may not edit price definitions;
- billing operator may inspect/reconcile billing but may not publish AI profiles;
- profile operator may stage/rollback adapter profile but may not grant arbitrary subscriptions unless separately permitted.

## 9. Admin security

Baseline production requirements:

- stronger authentication than end-user convenience flow where feasible;
- MFA before production launch;
- separate admin session/audience;
- short privileged session lifetime;
- re-authentication for highly sensitive operations where practical;
- RBAC enforcement server-side;
- complete admin audit trail;
- no admin UI-only security assumptions;
- production DB not exposed directly as normal support tooling.

## 10. Billing security

Payment provider callbacks:

- validate signature/authentication according to provider contract;
- validate merchant/account context;
- store immutable event identity;
- enforce idempotency/unique event handling;
- record raw provider payload only if required for dispute/reconciliation and then protect/retain it under a dedicated billing policy; never mix it with general logs;
- subscription mutation occurs only after validated event processing.

Return URL/query parameters do not authorize subscription activation.

## 11. Input validation

All external inputs are schema allowlisted.

Do not accept generic arbitrary JSON fields for diagnostics/config/admin mutation merely for convenience.

Validation layers:

1. HTTP content type/size policy;
2. schema validation;
3. domain invariant validation;
4. authorization;
5. persistence constraints.

Runtime resource limits must be documented as server safety limits, not falsely represented as provider/business rules.

## 12. Diagnostic privacy

Allowed diagnostic model is metadata-first.

Examples allowed:

- stable error code;
- stage/state;
- browser/extension version;
- AI family/surface/profile;
- timing/counts;
- pseudonymous device/account IDs internally.

Forbidden baseline fields:

- Ozon API keys;
- arbitrary request/response bodies;
- full prompt/conversation;
- customer names/phones/addresses;
- raw financial/order datasets.

Server MUST reject unknown/unapproved diagnostic fields rather than trusting the client to redact correctly.

## 13. Health evidence security

Health runner uses dedicated test accounts and test conversations.

Evidence may include:

- sanitized DOM fragments around named contours;
- element roles/attributes;
- screenshots from dedicated health accounts;
- selector/fallback result;
- timing/state transitions.

Evidence must not use real user sessions/business data.

Health-account cookies/session stores are secrets with separate access controls and rotation/recovery procedures.

## 14. Object storage

If object storage holds health screenshots/evidence:

- buckets private by default;
- access through service identity or signed short-lived URL;
- encryption at rest where provider supports;
- retention/automatic expiry;
- no public listing;
- object key names must not contain secrets/user PII;
- evidence references stored in DB with classification/retention metadata.

## 15. Secrets management

Production secrets include:

- DB credentials;
- config signing private key;
- access-token signing private key if separate;
- email provider credentials;
- billing provider credentials/webhook secrets;
- notification provider credentials;
- health test-account credentials/session material;
- object-storage credentials.

Rules:

- never commit `.env` with real values;
- local `.env.example` contains placeholders only;
- CI/staging/prod secrets are isolated;
- rotate compromised secrets;
- logging middleware must redact known secret headers/fields.

## 16. Web security

Portal/admin baseline:

- HTTPS;
- secure cookies if cookies used;
- HttpOnly/SameSite attributes;
- CSRF protection for cookie-authenticated mutations;
- CSP and standard security headers;
- output encoding/XSS prevention;
- no tokens in URL fragments/query where avoidable;
- origin/redirect allowlists;
- login/OTP abuse controls.

## 17. API abuse controls

Rate limiting/risk controls are especially required for:

- OTP request/verify;
- device start/poll/exchange;
- token refresh;
- checkout creation;
- public webhook endpoints (plus provider verification);
- diagnostic ingestion;
- health-trigger/admin endpoints.

Rate limits are operational security policy and must return explicit errors; they are independent from Ozon provider limits.

## 18. Database security

- least-privilege application DB role;
- separate migration role if practical;
- parameterized queries/ORM only;
- constraints for uniqueness/idempotency;
- encrypted backups;
- backup access restricted;
- production backups tested by restore drill;
- audit/billing history protected from casual deletion.

## 19. Supply chain / CI

Before production:

- lockfile committed;
- dependency update process;
- vulnerability scanning;
- CI branch protection/status checks where repository workflow permits;
- production deploy artifacts built reproducibly;
- no deploy from unreviewed workspace state;
- secrets not exposed to untrusted PR jobs.

## 20. Threat scenarios that tests must cover

1. stolen/expired device code;
2. OTP brute force/reuse;
3. refresh-token replay;
4. revoked device trying refresh/bootstrap;
5. tampered signed config;
6. server sends unknown remote capability/profile strategy;
7. diagnostic event containing forbidden secret/payload field;
8. duplicate/forged billing webhook;
9. stale price revision checkout;
10. unauthorized admin action;
11. admin action without audit record;
12. broken AI profile rollout and rollback;
13. compromised health run trying to inject data into production config;
14. cross-browser health failure incorrectly disabling unrelated browser family;
15. server outage during valid offline-grace window.

## 21. Security acceptance gate before real users

Production launch is blocked until:

- threat review completed;
- admin MFA/authorization accepted;
- refresh-token rotation/reuse tests pass;
- config-signing/tamper tests pass;
- payment webhook idempotency/verification passes;
- forbidden diagnostic data tests pass;
- backup restore drill passes;
- secrets/environment separation verified;
- Bridge integration proves Ozon credentials/raw seller data stay outside control-plane server;
- extension remote config cannot expand packaged provider security boundary.
