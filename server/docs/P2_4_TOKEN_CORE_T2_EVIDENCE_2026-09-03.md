# P2.4 Token Core T2 Evidence — 2026-09-03

Status: ACCEPTED — P2.4 DONE.

An initial local token-core candidate was later found incomplete during final API
closeout: it derived the Ed25519 access signing key from `AUTH_ROOT_SECRET_B64`
and had no mandatory JWT `kid`; it also lacked the PostgreSQL refresh-IP abuse
limiter. This evidence supersedes any earlier local acceptance claim.

The corrected candidate keeps root material exclusively for refresh lookup,
rotation, idempotency, and the HMAC-pseudonymous rate key. Access signing loads
an independently configured PKCS#8 Ed25519 private key and validates an active
key id. JWT verification requires the exact configured `kid`.

Real PostgreSQL 18 integration tests cover normal rotation, deterministic
same-idempotency replay and concurrency, changed-key reuse compromise, expired
replay reuse, inactive principals, active access authorization, privacy, 100-way
refresh-IP concurrency (60 allowed), invalid-refresh consumption, and replay
consumption. The refresh rate bucket action is `EXTENSION_REFRESH_IP`, 60
attempts per 15 minutes; only an HMAC pseudonym is persisted.

Migration `0004_p2_4_token_core.sql` remains limited to refresh rotation
metadata. No P2.5 scope is included.

Implementation commit: `0616cbcf007c1f36ddd08d7801dfcc8f1a5848d6`.
GitHub Server CI push run: `33755515868` — success.
