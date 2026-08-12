# Wildberries LLM API Bridge v0.1.1

Production-candidate Manifest V3 extension for controlled **read-only** ChatGPT ↔ Wildberries Seller API access.

## Status

- executable production registry: **157 aliases**
- one `WB_API_V1` command: **at most one external WB API request**
- no hidden retry, pagination loop, fan-out, polling, or multi-request orchestration
- current connection check: `GET https://common-api.wildberries.ru/ping`
- credentials: local `Authorization: Bearer <token>` plus optional `X-Client-Secret` for Service/Basic token flows
- source regression: **344/344 checks PASS** (170 provider-matrix checks + 174 lifecycle/UI/worker tests)
- executable production line gate: **7043/7043**, uncovered **0**
- fresh-unpacked ZIP regression: full suite **PASS twice consecutively**
- source → production tree → fresh unpack byte identity: **17/17 PASS**
- deterministic ZIP rebuild: **byte-identical PASS**
- Chromium 144 `--pack-extension`: **PASS / exit 0**
- Chromium runtime load in this container: **ENVIRONMENT NOT VERIFIED** (headless registers no extension target)
- real seller-account acceptance: **NOT YET PERFORMED**

## Canonical release artifact

`wildberries-bridge-v0.1.1-extension.zip`

- bytes: `82701`
- SHA-256: `3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2`
- production files: **17**, including the complete unminified executable registry in `shared/wb_operations.js`

GitHub stores this byte-exact install artifact as base64 parts under `reference-0.1.1/archive-exact/`. Run `reference-0.1.1/rebuild_extension.py` to reconstruct and verify it.

The supplemental full source/tests/evidence bundle was retained separately with SHA-256 `b7e08ca72b52af3c34ff33d742faf10cea9a9b9dc25df75cf6134ed8b233d041` (183421 bytes). It is not required to reconstruct or audit the canonical production extension stored in this repository.

See `INSTALL.md`, `WB_TEST_EVIDENCE_V0.1.1.md`, `WB_SECURITY_AND_BLOCKED_SURFACE_V0.1.1.md`, `WB_CURRENTNESS_V0.1.1_2026-08-12.md`, and `reference-0.1.1/`.

## Architecture

`WB_API_V1 → content script → service-worker durable ownership → fixed WB operation registry → official WB API → bounded/sanitized WB_RESULT_V1 → same bound ChatGPT conversation`.

The provider-neutral conversation binding, manual/autorun lifecycle, commit-before-send, exactly-once request/delivery ownership, Pause/Resume/Stop, and recovery model are derived from the exact Ozon Bridge v0.1.3 reference. WB hosts, auth, operation aliases, request schemas, response privacy rules, and API currentness are WB-specific.
