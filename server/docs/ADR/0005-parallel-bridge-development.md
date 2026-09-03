# ADR-0005 — Develop Server and Bridge in Parallel Through a Versioned Seam

Date: 2026-09-03  
Status: Accepted

## Context

The Ozon Bridge is still under active reliability/product work, while the commercial server must begin now. Copying live Bridge internals repeatedly would couple two moving targets and create merge/regression risk.

## Decision

Develop the server on its own branch/directory using a versioned client/server integration contract and simulated extension fixtures.

Keep only pinned Bridge reference/provenance material under `server/reference/bridge/`.

Do not import active Bridge runtime source into server modules before roadmap P11.

At P11, fetch the then-current accepted Bridge version, perform a delta audit and integrate that version deliberately.

## Consequences

- Bridge work can continue independently;
- server architecture does not freeze today's extension;
- integration assumptions are explicit/testable;
- final integration requires a deliberate regression/delta pass rather than a blind copy.
