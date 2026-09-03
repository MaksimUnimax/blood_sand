# Server Architecture Documentation Index

This directory is the architecture/specification authority for the commercial control-plane track.

## Normative documents

- `ARCHITECTURE.md` — target architecture and module ownership.
- `REQUIREMENTS.md` — functional/non-functional requirements and acceptance gates.
- `ROADMAP.md` — Level 1 product roadmap + Level 2 current execution steps.
- `DEVELOPMENT_RULES.md` — architecture authority, Codex role, roadmap correlation, Definition of Done.
- `SECURITY.md` — trust boundaries and security requirements.
- `INTEGRATION_CONTRACT.md` — versioned seam with the future integrated Bridge.
- `TECH_STACK.md` — implementation technologies and explicit non-selections.
- `DATA_MODEL.md` — logical entities/invariants before physical migrations.
- `API_CONTRACTS.md` — endpoint map, errors, idempotency and contract conventions.
- `BILLING_AND_PLANS.md` — pricing revisions, subscriptions, billing/webhooks.
- `HEALTH_SYSTEM.md` — controlled-browser compatibility monitoring and repair loop.
- `TEST_STRATEGY.md` — deterministic test layers and acceptance evidence.

## Implementation packet

- `P1_CODEX_IMPLEMENTATION_PACKET.md` — first coding task after P0 architecture acceptance.

## Architecture decisions

See `ADR/`.

Current accepted decisions:

- modular monolith;
- control-plane/data-plane separation;
- browser-family modularity;
- declarative non-executable remote config;
- parallel Bridge/server development through a versioned seam.

## Bridge reference

See `../reference/bridge/`.

These files are reference/provenance only. They are not imports and do not freeze the evolving Bridge implementation.
