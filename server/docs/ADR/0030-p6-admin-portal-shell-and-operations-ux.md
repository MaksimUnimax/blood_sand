# ADR-0030 — P6 admin portal shell and operations UX

Status: Accepted — P6.5 remote implementation acceptance complete
Date: 2026-09-09

## Decision

P6.5 is a UI/BFF delivery over the final accepted P6.4 control-plane base
(commit `fdf66f8c2cc89de0f861a20221ca0a26f342d2e8`). It does not add a server
domain layer, permission, route, migration, payment provider, or OpenAPI
operation. The accepted 67-method control-plane contract and migrations
0000–0012 remain byte-stable.

The dedicated `server/apps/admin` Next 15 application is the sole admin web
application. Browser requests use a strict same-origin BFF with a closed
51-tuple allowlist: the 49 accepted P6.1–P6.4 admin tuples and the two OTP
tuples. The BFF validates `CONTROL_PLANE_API_ORIGIN`, forwards only the
accepted cookie/content/CSRF headers, propagates only safe response headers,
uses `no-store`, and returns a generic 503 on upstream failure.

## Authentication and authority

The portal OTP and session protocol is reused through the BFF. Admin elevation
uses the readable portal CSRF cookie, and admin mutations use the readable
admin CSRF cookie. HttpOnly session cookies are never read by JavaScript and
OTP challenges, codes, CSRF values, email, and privileged page data remain
memory-only. `GET /v1/admin/me` is the UI session authority. Navigation and
action visibility use returned permissions, not locally reconstructed role
matrices; the API remains authoritative after rendering.

Explicit admin logout calls `DELETE /v1/admin/session` with the admin CSRF
authority, clears in-memory privileged state only after server success, and
does not silently re-elevate the portal session. A failed logout remains a
safe error state.

## Operations UX

The page architecture is `/login`, dashboard, account/user lookup and account
workspace, principals, audit, commercial plans/prices/entitlements, and
compatibility. The account workspace exposes only permission-available
subscription, device, billing, and entitlement sections. Accepted P6.1–P6.4
operations are represented with exact filters and request bodies, current
optimistic revisions/fingerprints, explicit reason fields, review/confirmation
for high-impact actions, re-fetch after success, and no optimistic domain
writes or mutation retries.

The shared mutation coordinator owns the pending/duplicate guard and treats
stale or conflict responses as terminal: it performs the resource-specific
authoritative read, invalidates the old review, makes no automatic retry, and
requires a new review against the refreshed state. Audit and billing views
display only their accepted safe projections. Compatibility publication is
revision-only and visibly reports that it does not activate a revision.

## Boundaries

There is no generic feature-rule UI, AI/profile UI, Health UI, diagnostics UI,
signing-key/config-release/rollout UI, or real payment provider integration.
P7, P8, and P9 remain planned domain stages. P6.6 owns the final P6 security
and architecture acceptance/hardening review. Payment go-live remains
deferred.


## Final acceptance

The Attempt 4 implementation was committed as `bc566930c36654a6dd57a8f9eb79872cdb89e8f5`, with parent `191f1a2d392f1e12cf5f0a34989a88e0788a9cb6` and tree `77b56750d0264f59affa7925fc076af1ba5085ca`. The normal push was fast-forward only. Exact-SHA Server CI run `34323694683` (`push`) completed successfully on that SHA, and the independent GitHub readback plus remote product-safety review passed D01–D04, logout CSRF, and the shipped E2E cwd regression. P6 remains ACTIVE, P6.5 is DONE, P6.6 is NEXT, and P7 remains planned/not started.
