# ADR-0014: P3.6 offline grace, cache, and client freshness

Status: Accepted

## Decision

P3.6 implements the reference policy in `@product/simulated-extension-client`.
The client stores the exact `SignedBootstrapEnvelopeV1`, never an unsigned
payload as authority, and re-runs the unchanged P3.5 `verifyBootstrapEnvelope`
with its packaged public-key ring before every cached use. The local record is
strictly versioned as `bootstrap_cache_v1` and is bound to the control-plane
origin, activated device, contract version, extension version, browser family
and version, and normalized detected-AI context. It contains no credentials,
provider secrets, seller data, or conversation content. The injected
`BootstrapSnapshotStore` is intentionally narrow; its deterministic in-memory
implementation is the reference store. A browser storage adapter is deferred
to P11.

`bootstrapWithPolicy` is online-first. A successful, verified live response is
authoritative and replaces the matching cache, including when its signed
compatibility state is blocked. A cache is considered only when the live fetch
fails without receiving an HTTP response. Any HTTP response, including 503,
does not receive same-attempt cache fallback. Online 401/403 removes the device
cache. A live verification failure or signed server-time rollback is a
security/freshness failure and never falls back or overwrites the cache.

The P3.5 verifier remains a cryptographic/schema verifier only. Live snapshots
must have `serverTime < expiresAt`. Config version is not a security clock: a
lower signed config version is accepted when signed server time is
non-decreasing. A signed server-time observation below the per-device/control-
plane high-watermark is rejected as `SERVER_TIME_ROLLBACK`.

## Freshness and clock policy

Effective offline time is the maximum of signed server time, the persisted
trusted server-time high-watermark, persisted wall-time high-watermark, current
wall time, and the in-process monotonic anchor plus elapsed monotonic time. The
freshness boundaries are exact: `effectiveNow < expiresAt` is `FRESH`,
`expiresAt <= effectiveNow < offlineGraceUntil` is `OFFLINE_GRACE`, and
`effectiveNow >= offlineGraceUntil` is `EXPIRED`. The client never modifies or
re-signs any signed timestamp, so local grace cannot be extended. A monotonic
clock rollback while an anchor is active fails closed as `CLOCK_UNSAFE`; a
successful live bootstrap may establish a new anchor.

A browser/process monotonic clock cannot prove elapsed time while the process is
stopped. Across restart P3.6 relies on the signed server-time floor, persisted
wall-time floor, and current wall clock. This is a practical rollback
mitigation, not a tamper-proof trusted-hardware guarantee.

## Compatibility and revocation limits

One pure resolver is used for live and cached snapshots, with precedence:
browser `MAINTENANCE`, browser `UNSUPPORTED_BROWSER`, extension
`UPDATE_REQUIRED`, extension `UPDATE_RECOMMENDED`, then `READY`.
`READY` and `UPDATE_RECOMMENDED` are usable; `UPDATE_REQUIRED`,
`UNSUPPORTED_BROWSER`, and `MAINTENANCE` remain explicit blocked states and are
cached as policy. P3.5 key revocation stops new legitimate server signing; a
previously valid signed snapshot can still be used only within this bounded
offline policy when there is genuinely no HTTP response. An online 503 is not
silently converted to cached success. Similarly, an online account/device
401/403 invalidates the cache so it cannot become an authorization bypass.

No server route, request/response schema, snapshot wire format, database table,
migration, Bridge runtime, refresh-token lifecycle, or provider state is
changed by P3.6.
