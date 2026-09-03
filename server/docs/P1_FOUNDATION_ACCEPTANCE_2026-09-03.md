# P1 foundation acceptance — 2026-09-03

## Accepted commit lineage

- BASE: `11f648ee8ab3ed2d24ea595707908bc7da60c5d6`
- P1.1 original: `35936872d0f758d339f6f93e6c95577668ac75d8`
- Corrective: `ba2ff8ddf65870c833345785a743e15916ad134c`

## Verification record

P1.2 attempt 1: `FAILED_IMPLEMENTATION`.

Reasons:

- generated Next lint failure;
- incomplete migration lifecycle;
- worker missing PostgreSQL lifecycle;
- README missing PostgreSQL stop/reset semantics.

Corrective result: `PASS`.

P1.2 attempt 2: `PASS`.

Accepted evidence:

- Node 24.20.0;
- pnpm 10.15.1;
- frozen install PASS;
- lint PASS;
- typecheck PASS;
- 12 tests PASS;
- build PASS;
- Compose config PASS;
- Bridge guard PASS;
- security PASS;
- no Bridge source import;
- no production deployment;
- PostgreSQL real integration NOT YET RUN.

Status: P1.1 = ACCEPTED / DONE; P1.2 = ACCEPTED / DONE; P1.3 = NEXT.
P1 overall remains active and is not DONE.

## GitHub and local durability

At acceptance time, the GitHub remote branch is behind the local accepted candidate.

- Known remote: `11f648ee8ab3ed2d24ea595707908bc7da60c5d6`
- Local accepted candidate before this documentation checkpoint:
  `ba2ff8ddf65870c833345785a743e15916ad134c`

GitHub HTTPS write authentication is not configured on this VPS, and recent GitHub
anonymous smart-HTTP transport behavior required a process-local HTTP/1.1 workaround
for cloning.

LOCAL DURABILITY != OFFSITE DURABILITY.

GitHub synchronization remains required when a safe write channel is available. The
local backup is not offsite disaster recovery.
