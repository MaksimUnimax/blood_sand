# ADR-0006 — Separate Portal Web Sessions from Extension Device Sessions

Date: 2026-09-03  
Status: Accepted

## Context

The portal authenticates a human web session, while an extension session is a
device-bound credential lifecycle with a refresh-token family. Treating these
as one entity would blur two distinct trust boundaries.

## Decision

`portal_sessions` authenticates the web portal human session. `sessions`
remains extension/device session state and is device-bound. A portal session
does not have a device token family or extension entitlement snapshot.

Future admin sessions remain a separate privileged boundary and are not
implemented in P2.1.

## Consequences

Portal logout/revocation and extension device/session revocation can evolve
independently without granting browser portal credentials device authority.
