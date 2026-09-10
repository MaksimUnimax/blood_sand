# ADR-0031 - P7 AI adapter registry/profile authority and decomposition

Date: 2026-09-09
Status: Accepted for P7 decomposition and P7.1 local candidate

## Context

P6.6 is the accepted control-plane base. P7 is the next product stage for
server-managed AI adapter profiles. The existing P3 signed bootstrap and
config-release protocols, P4 entitlement authority, P6 admin authorization,
active Bridge, and P8 Health ownership remain independent boundaries.

## Decision

P7 owns the AI registry and profile authority:

`AI family -> surface -> optional variant -> stable profile -> immutable profile revision`.

An adapter is one stable AI family. A surface belongs permanently to exactly
one adapter. A variant belongs permanently to exactly one surface. A profile
belongs to one adapter and surface and may optionally bind one variant. A
revision repeats these hierarchy IDs and PostgreSQL composite foreign keys
reject a cross-hierarchy revision. Identity UUIDs and machine keys are
immutable; mutable display metadata and status are separate fields.

P7.1 creates only the persistence foundation and the strict
`adapter_profile_v1` declarative schema. Profile content is a closed Zod
object containing known page strategy identifiers, packaged selector
references, accessibility role/name primitives, bounded observation modes and
timeouts, fallback plans, critical-contour metadata, and a separate
`profile_compatibility_v1` object. It has no generic metadata bag, raw CSS,
URLs, methods, headers, credentials, provider operations, commands,
filesystem paths, modules, WASM, JavaScript, or evaluation expressions.
SHA-256 covers the canonical validated content plus compatibility object using
the accepted P3 canonical JSON ordering convention.

Profile revision states are `DRAFT`, `CANDIDATE`, `PUBLISHED`, and
`RETIRED`. The package transition helper permits draft-to-candidate,
candidate-to-published, and published-to-retired. PostgreSQL itself prevents
published content, checksum, schema, compatibility, identity, publication
metadata, and actor metadata from being rewritten; published deletion and
demotion fail. Retired history is fully immutable. Revision numbers are
positive and unique per stable profile.

P7.1 includes no assignment, rollout command, or profile resolution service.
Those are P7.2 authority. The profile schema can express browser families
`chrome` and `yandex_chromium` independently, plus bounded browser and
extension compatibility constraints; Chrome-first is not a server
architecture fork.

## Frozen P7 decomposition

- P7: ACTIVE - registry/profile administration and resolution.
- P7.1: ACTIVE - persistence foundation and strict declarative profile schema.
- P7.2: PLANNED - profile lifecycle commands, deterministic assignment,
  rollout/pause/rollback authority.
- P7.3: PLANNED - bootstrap AI resolution, signed wire contract, and
  simulated-client automatic selection.
- P7.4: PLANNED - admin API and P7 RBAC permissions.
- P7.5: PLANNED - admin portal AI adapter/profile operations UX.
- P7.6: PLANNED - P7 security, architecture, full regression, and final
  acceptance.

P8 remains PLANNED and owns actual AI Compatibility Health execution,
browser-runner classification, incidents, and health evidence. P9 remains
PLANNED and owns diagnostics/notification operational visibility. P14 remains
PLANNED; its P14.0 DNS prerequisite does not start production launch work.

## Explicit boundaries

P7.1 does not change bootstrap AI wire semantics, signed envelope semantics,
P3 config-release/rollout authority, OpenAPI routes, admin permissions,
Health, diagnostics, production ingress, or the active Ozon Bridge. It does
not store Ozon credentials, raw seller data, provider responses, conversations,
or provider transport state. It stores and validates declarative data but
does not execute a profile, fetch an AI page, run Playwright, or import Bridge
runtime code.

P7.2/P7.3 must introduce any future assignment or signed distribution
structure deliberately and version it at that later stage. P8 remains the
owner of candidate browser validation; a CANDIDATE database state here is
lifecycle storage only.
