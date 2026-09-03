# ADR-0001 — Start as a Modular Monolith

Date: 2026-09-03  
Status: Accepted

## Context

The product needs auth, billing, entitlements, configuration, health, admin and diagnostics, but initial scale is small and the team must optimize for implementation speed and operational simplicity.

## Decision

Build one modular TypeScript control-plane codebase with clear domain packages, a stateless API process, worker process(es), web apps and health runners using one primary PostgreSQL database.

Do not split into microservices initially.

## Consequences

Positive:

- simpler transactions and consistency;
- lower infrastructure/support cost;
- easier Codex task boundaries;
- one schema/migration authority;
- simpler local/CI environment.

Required discipline:

- module boundaries and dependency direction are enforced;
- external providers are adapters;
- domain code is not embedded in HTTP/UI layers;
- extraction later occurs behind existing contracts only when measured need exists.

## Rejected baseline alternatives

- independent auth/billing/config microservices;
- Kubernetes/service mesh;
- event-bus-first distributed architecture.
