# Product Control Plane Server

Commercial/server track for the browser bridge product.

## Current status

Architecture phase (`P0`) is being completed on:

`feature/product-control-plane-server-2026-09-03`

The active Ozon Bridge continues independently under:

`tooling/llm-api-bridges/ozon-seller/`

The server project MUST depend on the versioned client/server contract, not on live Bridge implementation internals, until the explicit integration gate.

## Product role

The server is the product **control plane**:

- identity/accounts;
- extension devices/sessions;
- plans/prices/subscriptions;
- billing;
- entitlements/features;
- signed remote configuration;
- AI adapter/profile registry;
- browser/extension compatibility;
- AI compatibility Health;
- safe diagnostics;
- admin/audit;
- notifications/operations.

The baseline server is NOT the seller data plane. Ozon credentials and normal raw seller data remain in the browser/extension path.

## Architecture index

Read in this order before implementation:

1. `docs/ARCHITECTURE.md` — system architecture and ownership boundaries.
2. `docs/REQUIREMENTS.md` — complete functional/non-functional technical specification.
3. `docs/ROADMAP.md` — two-level execution roadmap and current step.
4. `docs/DEVELOPMENT_RULES.md` — mandatory architecture/Codex workflow rules.
5. `docs/SECURITY.md` — trust boundaries, auth/session/config security.
6. `docs/INTEGRATION_CONTRACT.md` — future Bridge <-> server seam.
7. `docs/TECH_STACK.md` — approved implementation stack.
8. `docs/DATA_MODEL.md` — logical database/domain model.
9. `docs/API_CONTRACTS.md` — API surface/error/idempotency conventions.
10. `docs/BILLING_AND_PLANS.md` — plan/price/subscription architecture.
11. `docs/HEALTH_SYSTEM.md` — automated AI compatibility monitoring/repair loop.
12. `docs/TEST_STRATEGY.md` — test and acceptance layers.
13. `docs/ADR/` — accepted architecture decisions.
14. `reference/bridge/` — pinned Bridge reference/provenance only.

## First coding step

No application implementation should begin until P0 architecture consistency is accepted.

The prepared first Codex packet is:

`docs/P1_CODEX_IMPLEMENTATION_PACKET.md`

It creates only the reproducible engineering foundation: Node.js 24 LTS, pnpm/TypeScript/Fastify/PostgreSQL/Drizzle/test/CI shells. It intentionally does not implement auth/billing/AI Health/Ozon logic yet.

## Core invariant

`CONTROL PLANE != DATA PLANE`

and

`EFFECTIVE CLIENT CAPABILITY = PACKAGED CAPABILITY ∩ SERVER POLICY`

Remote server configuration may restrict packaged behavior but may not become arbitrary executable extension/provider control.