# ADR-0029 — P6 Admin Commercial and Compatibility Operations

Status: Accepted  
Date: 2026-09-08  
Scope: P6.4 local admin operations

## Decision

P6.4 is the P6.3 final base for commercial catalog and compatibility-policy
operations. It adds the transport-neutral `@product/admin-commercial` package,
exactly 27 admin method/route tuples, and an OpenAPI target of 67 tuples. No
migration is added; PostgreSQL migrations remain 0000..0012.

The package composes the accepted P4 plan, price, entitlement-definition,
override, catalog inspection, and effective-entitlement resolver ports, and the
accepted P3 compatibility publication/read ports. It does not import the DB,
Fastify, Next, Bridge, or provider SDKs. P4 repositories expose optional
`beforeMutation` hooks that run in the same transaction before their existing
advisory locks. P6.4 supplies those hooks with the shared transaction-time
current-admin authorization: actor principal row `FOR UPDATE`, ACTIVE status,
current grants, recomputed permissions, and the exact permission.

Permissions are `plan.read`, `plan.manage`, `price.read`, `price.manage`,
`entitlement.read`, `entitlement.override`, `compatibility.read`, and
`compatibility.manage`. CSRF is required for every POST. P4 commands remain the
business and audit authority; there is no duplicate P6 audit.

The API exposes immutable plan/price revision history and P4 fingerprints,
typed entitlement-definition and account-override history, safe effective
entitlement explanations through the accepted resolver, and privacy-safe
compatibility revisions with sorted blocked versions and linked config
versions. Stored operator reasons are never returned. Compatibility publication
has a compatibility-specific SYSTEM-or-ADMIN context, uses `control_plane_v1`,
and publishes a revision only: it does not activate it, publish a config
release, select a signing key, mutate rollout state, or publish a feature rule.

Signing-key, config-release, rollout, and feature administration remain
SYSTEM-only P3 capabilities. AI/profile administration remains P7; health is
P8; diagnostics is P9; admin UI is P6.5; P6.6 owns remaining P6 capability
coverage and final acceptance. Real payment-provider go-live remains deferred.

## Consequences

All path bindings, optimistic fingerprints/revisions, grandfathering,
effective-window, type/deprecation, idempotency, and audit rollback behavior
remain owned by P4/P3 repositories. Direct P4 callers without hooks retain their
accepted behavior. Bridge behavior is unchanged.
