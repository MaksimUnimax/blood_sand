# P2.4 Token Refresh Acceptance Evidence — 2026-09-03

Status: LOCAL CANDIDATE — P2.4 ACTIVE.

The public surface is limited to `POST /v1/auth/refresh`. It requires a strict
43-character base64url refresh token body and a 16–128 character idempotency
key header. Success returns only bearer credentials with `Cache-Control:
no-store` and `Pragma: no-cache`; no cookies or account state are returned.

Security-invalid refresh results map uniformly to `401 AUTH_REFRESH_INVALID`.
The committed independent refresh-IP rate consume maps to `429
AUTH_RATE_LIMITED` with a safe deterministic `Retry-After` where available.
Unexpected service failures map to `503 SERVICE_UNAVAILABLE`.

OpenAPI is generated with fake services and ephemeral synthetic Ed25519 key
material, so it requires neither production keys nor a live database. The final
local generated OpenAPI SHA256 is recorded during final acceptance. Logs redact
tokens, idempotency keys, authorization, raw peer IP, root-secret aliases, and
access signing-key aliases. No P2.5 behavior is present.
