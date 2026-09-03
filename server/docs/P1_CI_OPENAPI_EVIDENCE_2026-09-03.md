# P1.4 CI and OpenAPI evidence — 2026-09-03

Status: LOCAL CANDIDATE. P1.4 is not marked DONE because no GitHub-hosted run has
occurred.

## Baseline and versions

- base: `7f373ed1c5c1c1c139920125e90e0affb8f07f17`;
- P1.3: ACCEPTED / DONE;
- Node: `24.20.0` (`node:24-bookworm`);
- pnpm: `10.15.1`;
- Fastify: `5.6.0`;
- Zod: `4.1.5`;
- fastify-type-provider-zod: `6.1.0`;
- @fastify/swagger: `9.8.1`;
- Prettier: `3.6.2`;
- actionlint: `1.7.12` (`rhysd/actionlint@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`).

## Generated contract

- artifact: `server/openapi/openapi.json` (tracked; generated, never hand-edited);
- OpenAPI version: `3.1.0`;
- source: Fastify routes plus shared Zod contracts in `packages/contracts`;
- documented paths: `/health/live`, `/health/ready` only;
- excluded paths tested: `/v1/auth/otp/request`, `/v1/bootstrap`,
  `/v1/billing/checkouts`, and `/test-controlled-error`;
- first SHA-256: `b5ef282f343899344af731859c551d075a32c4d288adc4aad3bb9bc4584b8485`;
- second SHA-256: `b5ef282f343899344af731859c551d075a32c4d288adc4aad3bb9bc4584b8485`;
- deterministic: YES;
- `pnpm openapi:generate`: PASS with PostgreSQL down;
- `pnpm openapi:check`: PASS with PostgreSQL down.

The unit test covers byte comparison for an identical artifact (pass) and modified
artifact (fail), and verifies generated route inclusion/exclusion.

## Checks

- `pnpm format:check`: PASS;
- `docker run --rm --user 0:0 ... rhysd/actionlint:1.7.12 /repo/.github/workflows/server-ci.yml`: PASS;
- workflow: `.github/workflows/server-ci.yml`, Node `24.20.0`, pnpm `10.15.1`,
  PostgreSQL `18.0`, disposable CI-only credentials, healthcheck, minimum
  `contents: read` permission and duplicate-run cancellation.

## Local CI-equivalent

Fresh PostgreSQL 18 was started healthy in the disposable project
`product-control-plane-p1-4-ci-local` using the repository Compose service
definition values (the VPS lacks both Compose clients, so the equivalent isolated
container/network/volume labels were created directly). It was loopback-bound at
`127.0.0.1:55432` only.

All commands exited `0` in `node:24-bookworm`:

1. `pnpm install --frozen-lockfile`;
2. `pnpm lint`;
3. `pnpm format:check`;
4. `pnpm typecheck`;
5. `pnpm test` (16 tests);
6. `pnpm test:integration` (1 real PostgreSQL test);
7. `pnpm db:migrate` after integration (idempotent CLI validation);
8. `pnpm openapi:check`;
9. `pnpm bridge:guard`;
10. `pnpm build`.

With PostgreSQL stopped, `pnpm test` (16 tests), `pnpm openapi:generate`, and
`pnpm openapi:check` all passed. The final database-down frozen install, lint,
format, typecheck, unit, OpenAPI check, Bridge guard, and build pass also completed.

Cleanup removed only the P1.4 disposable container, volume, and network. Ports
`5432` and `55432` were free afterward.

## Remote CI

`GITHUB_ACTIONS_REMOTE_RUN: NOT_RUN`.

Reason: the accepted local branch is not yet synchronized to GitHub. Actual GitHub
Actions execution remains required for P1.4 DONE.
