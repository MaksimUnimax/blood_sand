# P1.3 PostgreSQL integration evidence — 2026-09-03

Status: P1.3 implementation/evidence candidate awaiting ChatGPT acceptance.

## Baseline

- accepted base SHA: `a5507f0a5d6389015f118f87d8e0a04834e9c499`;
- PostgreSQL image: `postgres:18.0`;
- observed server: `18.0 (Debian 18.0-1.pgdg13+3)`;
- validation Node: `24.20.0` (`node:24-bookworm`);
- pnpm: `10.15.1`;
- isolated Compose project: `product-control-plane-p1-3`;
- development listener: `127.0.0.1:55432` only.

The database is the disposable development database `product_control_plane` with
the development-only Compose user. No production connection string or secret is
recorded here.

## Migration baseline

`packages/db/drizzle/0000_p1_migration_probe.sql` is canonical Drizzle history
and is referenced by `drizzle/meta/_journal.json`. It creates the narrow P1
infrastructure probe `__p1_migration_probe` and drops it in the same migration.
It introduces no Product Control Plane product schema or business table.

The integration suite uses the real `@product/db` runtime/factory, checks
readiness, runs `runMigrations` twice, queries Drizzle's migration metadata in
test-only code, runs a real `SELECT 1`, and closes the runtime.

## Cycle A — test harness from a fresh database

1. Started a fresh project-scoped volume and waited for PostgreSQL health
   `healthy`.
2. Ran `pnpm test:integration` in `node:24-bookworm`: PASS, 1 test.
3. Migration metadata count was 0 before the first migration, 1 after it, and
   1 after the second `runMigrations` call.
4. The `drizzle.__drizzle_migrations` metadata table existed; the temporary
   probe table was absent after migration; real query result was `1`.
5. PostgreSQL remained healthy. The exact Compose project was stopped with
   `down -v`; its container, network, disposable volume, and port `55432` were
   absent afterward.

## Cycle B — CLI migration from a fresh database

1. Recreated a new empty project-scoped volume and waited for health `healthy`.
2. Ran `pnpm db:migrate`: exit 0.
3. Ran `pnpm test:integration`: PASS, 1 test.
4. Direct test/tooling evidence: server version `18.0 (Debian
   18.0-1.pgdg13+3)`; database `product_control_plane`; migration metadata
   existed; migration record count was exactly 1; probe table was absent; real
   `SELECT 1` result was `1`.
5. The integration suite's second `runMigrations` remained idempotent and did
   not create another migration record. The project was stopped with `down -v`;
   its container, network, disposable volume, and port `55432` were absent.

## Isolation and cleanup

- MySQL was not queried or modified and remained loopback-bound at `127.0.0.1:3306`
  and `127.0.0.1:33060`.
- Legacy Bridge was not read or modified and remained active at
  `127.0.0.1:18083` (PID 654).
- `amnezia-awg` and `amnezia-awg2` remained running.
- No Product Control Plane PostgreSQL container, P1.3 volume, or P1.3 network
  remained after the final teardown; ports `5432` and `55432` were free.

P1 overall remains active. This document does not mark P1.3 or P1 as done.
