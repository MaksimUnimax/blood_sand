# P3.2 local acceptance evidence — 2026-09-04

Status: **ACCEPTED — P3.2 DONE**

This is local acceptance for `PRODUCT-CONTROL-PLANE-P3.2-COMPATIBILITY-CONFIG-SIGNING-PERSISTENCE-LOCAL`, attempt 2. No commit, push, host runtime change, product deployment, or P3.3 work was performed.

## Base and recovery

- Canonical branch: `feature/product-control-plane-server-2026-09-03`.
- Base HEAD and independently queried remote HEAD: `b77b569d51014851322d1caa2da01f785310e161`.
- Attempt 1 classification is corrected from `BLOCKED_INFRASTRUCTURE` to `FAILED / INCOMPLETE LOCAL ACCEPTANCE`: Docker, Node, pnpm, PostgreSQL, and DB-up integration were usable; only the incomplete disposable browser provisioning and missing final gates remained.
- Before this document was added, the candidate was preserved at `/var/backups/product-control-plane/git/blood_sand-p3.2-attempt1-uncommitted.patch` (`67bdc35bcca5ef6591ca7209da760f2e1a983b1a0211da36a6ad4934ff83cd42`) and `/var/backups/product-control-plane/git/blood_sand-p3.2-attempt1-untracked.tar.gz` (`b4046674e549faf9b0bf49bb8dc11ffd8a8667c3526d16441c7c63560189694d`).
- Untracked source/test count at backup: 9. The candidate was copied to a disposable validation tree excluding generated and runtime artifacts.
- Before remote-acceptance review, the locally accepted candidate was additionally preserved at `/var/backups/product-control-plane/git/blood_sand-p3.2-local-accepted-uncommitted.patch` (`67bdc35bcca5ef6591ca7209da760f2e1a983b1a0211da36a6ad4934ff83cd42`) and `/var/backups/product-control-plane/git/blood_sand-p3.2-local-accepted-untracked.tar.gz` (`88f00d0c9b407a758cee8acabbe5ddd0e16bde4875577db8fb475f1b046691d5`); untracked source/test count: 8.

## P3.2 implementation boundary

- ADR: `docs/ADR/0010-p3-persistence-immutability.md`.
- Catalog ports: `@product/compatibility` and the `@product/remote-config` read-only catalog port; PostgreSQL readers are fail-closed for corrupt persisted rows.
- Migration: `0006_p3_2_compatibility_config_signing.sql`; it creates nine P3.2 tables: extension releases/contracts/browsers, compatibility policy revisions/blocked versions, signing keys/events, and config releases/policy links.
- No route was created. In particular, `/v1/bootstrap` does not exist.
- Signing catalog data is public Ed25519 SPKI DER plus metadata/fingerprint only. The database has no private/secret signing-key column and no P3.2 JSON/JSONB policy bag.
- `config_releases.config_version` is `GENERATED ALWAYS AS IDENTITY`; integration proves generated versions are monotonic and an explicit caller assignment is rejected.
- Config/policy source pinning and signing-key rotation/history are preserved. Real PostgreSQL integration also proves FK/unique constraints, invalid/corrupt persisted rows fail closed, and valid Ed25519 SPKI catalog reads succeed.

## Migration evidence

- Fresh PostgreSQL 18 migration `0000` through `0006`: pass.
- A second normal migrator on the fresh database: pass.
- An independently constructed database migrated normally through accepted `0005` was upgraded by the normal migrator to `0006`: pass (migration journal 6 to 7); a retained P2 audit fixture remained present.
- Historical migration hashes remained unchanged:
  - `0000`: `9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56`
  - `0001`: `0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f`
  - `0002`: `f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449`
  - `0003`: `ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6`
  - `0004`: `38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d`
  - `0005`: `6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21`
- `0006` hash: `37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f`.
- Real PostgreSQL reports 18 P3.2 immutable triggers. UPDATE and DELETE are rejected for immutable/history tables, including `extension_releases`, `compatibility_policy_revisions`, `signing_keys`, `signing_key_events`, and `config_releases`.

## Exact disposable validation runtime

- Long-lived disposable `node:24.20.0-bookworm` container: Node `v24.20.0`, pnpm `10.34.5`.
- Fresh disposable PostgreSQL `18.6` container, loopback test URL and fail-closed `product_control_plane_test` database name for T4.
- `pnpm install --frozen-lockfile`: pass.
- DB-down (with `DATABASE_URL` absent): lint, format check, typecheck, unit, OpenAPI check, bridge guard, and full root build: pass. The executor's 30-second foreground cap was handled by retaining the same disposable container and polling the foreground command; the root `pnpm build` recorded exit code 0. No product configuration was changed.
- P3.1 focused remote-config crypto regression: 12/12 pass.
- DB-up integration: 8 files, 44/44 pass, 0 fail, 0 skip/todo.

## Browser and T4

- Project-pinned `@playwright/test` version: `1.62.1`.
- A persistent disposable `PLAYWRIGHT_BROWSERS_PATH` bind-mounted cache was shared by provisioning and test commands.
- Provisioning was split as required: `pnpm exec playwright install chromium`, then `pnpm exec playwright install-deps chromium`. No host packages or unrelated browser were used.
- Downloaded browser: Chrome for Testing `151.0.7922.34`, Playwright Chromium revision `1234`; executable exists in the configured cache and a launch/close smoke test passed.
- T4 with `PRODUCT_CONTROL_PLANE_E2E=1`, the fresh loopback PostgreSQL 18 test database, and that cache: 7/7 passed, 0 fail, 0 skip, 0 retries. Playwright's `test-results/.last-run.json` recorded `status: passed`.
- Remote-acceptance review strengthened the focused corrupt-row test to cover malformed fingerprint, invalid SPKI DER, and non-Ed25519 algorithm. The complete real PostgreSQL integration suite was rerun: 8 files, 44/44 pass; the disposable loopback PostgreSQL 18 Chromium T4 rerun: 7/7 pass.

## OpenAPI and boundaries

- OpenAPI was generated and checked twice DB-down; both byte-identical artifacts have 14 routes and SHA-256 `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`.
- Bridge guard passed. Candidate scans found no real config private key, Ozon credential, raw seller data, generic executable remote configuration, or Bridge runtime import.

## Roadmap and host

- Roadmap remains: P3 ACTIVE; P3.1 DONE; P3.2 ACTIVE; P3.3–P3.7 PLANNED; P4–P15 PLANNED.
- Host Node, pnpm, PostgreSQL, MySQL, protected services, and deployment state were unchanged. All containers, browser cache, validation copy, temporary pnpm material, and test outputs are disposable acceptance artifacts and are removed after acceptance.

Next: return to ChatGPT for P3.2 final remote acceptance. Do not begin P3.3.

## Remote acceptance

- Implementation SHA: `d68b522aca38215ac5b45f1d457bbae5038f3624`.
- Server CI: run `33845922701`, <https://github.com/MaksimUnimax/blood_sand/actions/runs/33845922701>, success.
- Remote compare review found only the expected P3.2 ADR, catalog/domain, DB schema/readers, migration metadata, wiring, tests, roadmap, and evidence files.
- The committed migration state is `0000` through `0006`, with `0006_p3_2_compatibility_config_signing.sql` latest; it has nine tables and nine dual-event immutability triggers (18 protections).
- Final OpenAPI remains 14 routes, SHA-256 `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`, without `/v1/bootstrap`.
