# ADR-0034: P7 admin AI API and RBAC

Status: Implemented; remotely accepted

Date: 2026-09-11

## Decision

P7.4 exposes the accepted P7 registry, profile lifecycle, and assignment
authorities through a bounded transport-neutral `@product/admin-ai` service and
explicit `/v1/admin/ai/` HTTP routes. The service owns input/output schemas,
operation orchestration, and stable error classification. It has no Fastify,
Next, database, Bridge, provider SDK, or Playwright dependency.

The six and only six P7 permissions are:

| Permission | Meaning |
| --- | --- |
| `ai.registry.read` | Read the bounded adapter/surface/variant hierarchy |
| `ai.registry.manage` | Create and manage registry identity presentation/status |
| `ai.profile.read` | Read profiles and immutable revision history |
| `ai.profile.manage` | Create profiles and execute accepted revision lifecycle commands |
| `ai.assignment.read` | Read assignment scopes and revisions |
| `ai.assignment.manage` | Create and execute accepted assignment/rollout commands |

The role matrix is deterministic:

| Role | P7 permissions |
| --- | --- |
| `ADMIN_OWNER` | All six |
| `ADMIN_OPS` | All six |
| `ADMIN_SUPPORT` | The three read permissions only |
| `ADMIN_BILLING_READONLY` | None |

Existing P6 permissions and role behavior remain unchanged. No wildcard,
superuser, ownership, email, portal-membership, or machine-key inference is
introduced.

## Safe read model

`p7-admin-ai-read-repository.ts` is a dedicated adaptor. Lists use the
repository cursor/limit convention and cap a page at 100. Reads expose stable
identifiers, hierarchy, presentation/status, profile content and compatibility,
revision fingerprints/states, assignment mode/targets, and display timestamps.
They do not expose cohort seeds, stored reasons, actor IDs, sessions, CSRF
material, credentials, keys, raw audit rows, or arbitrary SQL columns.

## Route manifest

The manifest is explicit and bounded. There are 10 read operations:

```text
GET  /v1/admin/ai/registry/adapters
GET  /v1/admin/ai/registry/adapters/{adapter_id}/surfaces
GET  /v1/admin/ai/registry/surfaces/{surface_id}/variants
GET  /v1/admin/ai/profiles
GET  /v1/admin/ai/profiles/{profile_id}
GET  /v1/admin/ai/profiles/{profile_id}/revisions
GET  /v1/admin/ai/profiles/{profile_id}/revisions/{revision}
GET  /v1/admin/ai/assignments
GET  /v1/admin/ai/assignments/{assignment_id}
GET  /v1/admin/ai/assignments/{assignment_id}/revisions
```

There are 25 mutation operations:

```text
POST /v1/admin/ai/registry/adapters
POST /v1/admin/ai/registry/surfaces
POST /v1/admin/ai/registry/variants
POST /v1/admin/ai/profiles
POST /v1/admin/ai/registry/adapters/{adapter_id}/metadata
POST /v1/admin/ai/registry/adapters/{adapter_id}/status
POST /v1/admin/ai/registry/surfaces/{surface_id}/metadata
POST /v1/admin/ai/registry/surfaces/{surface_id}/status
POST /v1/admin/ai/registry/variants/{variant_id}/metadata
POST /v1/admin/ai/registry/variants/{variant_id}/status
POST /v1/admin/ai/profiles/{profile_id}/metadata
POST /v1/admin/ai/profiles/{profile_id}/status
POST /v1/admin/ai/profiles/{profile_id}/revisions
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/replace
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/candidate
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/publish
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/retire
POST /v1/admin/ai/assignments
POST /v1/admin/ai/assignments/{assignment_id}/direct
POST /v1/admin/ai/assignments/{assignment_id}/rollout
POST /v1/admin/ai/assignments/{assignment_id}/rollout/percentage
POST /v1/admin/ai/assignments/{assignment_id}/rollout/pause
POST /v1/admin/ai/assignments/{assignment_id}/rollout/resume
POST /v1/admin/ai/assignments/{assignment_id}/rollout/complete
POST /v1/admin/ai/assignments/{assignment_id}/rollback
```

The OpenAPI operation arithmetic is therefore base 67 plus 35 P7.4 operations,
for a final count of 102.

## Mutation authority and security

Every mutation uses the existing admin session and double-submit/HMAC CSRF
mechanism. The actor is always the authenticated admin subject; request bodies
cannot supply an actor principal ID. Route checks are followed by
`authorizeAdminMutationInTransaction` inside the same transaction as the P7
mutation. This rechecks current principal status and non-revoked grants, so a
role revocation or suspension after session creation cannot commit a P7 state or
audit event.

Registry identity fields are immutable after creation. There are no delete
routes. Adapter, surface, variant, and profile status/presentation updates use
an expected `updatedAt` and a row lock; last-write-wins updates are rejected.
Omitted mutable fields in partial registry updates retain their persisted value;
an explicit supplied value is applied according to its schema.
Only status transitions already represented by the accepted hierarchy are
exposed; no archive workflow is invented.

Profile commands delegate to P7.2. The API permits draft creation, exact
fingerprint-guarded draft replacement, candidate, publish, and retire. It does
not permit direct published creation, editing non-drafts, demotion, caller
timestamps, caller hashes, caller actors, or unsupported schema versions.

Assignment commands delegate to P7.2. Scope creation accepts only the accepted
hierarchy/browser/subject fields. The server creates the cohort seed; it is
never accepted from or returned to the caller. Every existing-assignment
mutation requires the latest assignment revision.

## Audit and errors

P7.2 profile and assignment commands remain the sole audit authority for those
business mutations. New registry commands append bounded metadata audit events
atomically with their changes. Neither audit path records profile content,
seeds, credentials, tokens, or secret material.

The transport maps failures to the stable contract categories: unauthenticated,
forbidden, invalid CSRF, not found, stale optimistic precondition, invalid
lifecycle, ineligible assignment target, invalid hierarchy binding, invalid
input, conflict, and service unavailable. SQL text, constraint names, stack
traces, seeds, and internal operator reasons are not returned.

## Boundaries

This ADR does not add a migration, UI, health runner, diagnostics,
notifications, Bridge integration, provider calls, live DOM access, remote
executable profile primitives, a signing plane, a rollout algorithm, or a new
bootstrap route. P7.3 resolution and signed-wire semantics are unchanged.
P7.5 owns UI; P8 owns health; P9 owns diagnostics/notifications; P11 owns
Bridge integration.
