# ADR-0013: P3.5 signing-key lifecycle and client trust

Status: Accepted

## Decision

P3.5 separates two trust domains. Server PostgreSQL lifecycle events determine
whether the API may issue a new snapshot. The simulated extension's packaged
`TrustedConfigSigningKeyRing` determines whether an envelope is
cryptographically trusted by that client build. The server cannot make an
unknown public key trusted by sending it through the control plane.

The immutable `signing_keys` and `signing_key_events` tables are reused. The
pure lifecycle resolver recognizes `UNREGISTERED`, `REGISTERED`, `ACTIVE`,
`RETIRED`, and `REVOKED`, and returns an invalid fail-closed result for every
impossible sequence. Events are append-only, serialized with the per-key
`p3-signing-key:<keyId>` PostgreSQL advisory lock, and receive strictly
monotonic server-controlled timestamps.

Registration computes the Ed25519 SPKI SHA-256 fingerprint internally and can
adopt an exact P3.4 metadata-only row. Registration, activation, retirement,
and revocation each write their lifecycle event and audit record in one
transaction. Publication and signing require `ACTIVE`; retirement is blocked
while the key is selectable by the exact P3.3 bootstrap rollout semantics.
Emergency revocation is not blocked by configuration availability.

Bootstrap config rollout selection has one shared state interpretation:

- `ACTIVE`: baseline and candidate remain potentially selectable.
- `PAUSED`: baseline only is selectable.
- `RETIRED`: rollout is ignored; ordinary latest config is selectable.

With no `bootstrap.config` rollout, ordinary latest config is selectable. The
same pure selection-mode helper drives P3.3 resolution and the P3.5 retirement
in-use guard.

The API loads a bounded (1–8 entry) `CONFIG_SIGNING_KEY_RING_JSON` containing
canonical Base64 PKCS#8 Ed25519 private PEM values. The P3.4 singleton variables
remain an exclusive compatibility fallback. Every entry binds to exact public
metadata at startup, while lifecycle is rechecked from PostgreSQL for every
issuance. Private material remains API-process secret configuration only.

The client receives no public-key discovery, bootstrap-supplied trust, DB key
lookup, trust-on-first-use, or dynamic trust update mechanism. A different
packaged trust set is a new client instance. It verifies the existing P3.1
envelope, algorithm, key ID, signature, encoding, JSON, schema, and canonical
bytes only; freshness, cache reuse, offline grace, clock policy, and
anti-downgrade selection belong to P3.6.

Server lifecycle revocation prevents new server signing but does not
retroactively remove a public key from an already shipped client's packaged
trust ring. An old envelope can therefore remain mathematically valid for a
client build that still packages that public key. Hard client-side trust
removal requires a new packaged trusted-key set/client release or a separately
rooted revocation mechanism, neither of which is part of `control_plane_v1`.

## Safe rotation sequence

1. Register K2 public metadata.
2. Configure and bind the API ring containing K1 and K2.
3. Ship/simulate an overlap client packaging K1 and K2.
4. Activate K2 while K1 remains active.
5. Publish and select a K2 config; complete any K1-to-K2 rollout.
6. Retire K1 only after it is no longer selectable.
7. Remove K1 private material later; a future client may then remove K1 trust.

No P3.5 public HTTP lifecycle route or migration is introduced.
