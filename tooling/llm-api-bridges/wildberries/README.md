# Wildberries LLM API Bridge v0.1.2

Manifest V3 extension for controlled **read-only** ChatGPT ↔ Wildberries Seller API access.

## Status

- current machine-readable WB OpenAPI audited: **13/13 categories, 265 paths, 286 operations**
- current read/read-derived registry: **188 records**
- executable aliases in this **Personal-token-only** build: **172**
- execution-disabled known reads: **16** = 13 direct PII + 3 Service-token-only
- current mutation operations excluded from read registry: **98**
- one `WB_API_V1` command: **at most one external WB API request**
- no hidden retry, pagination loop, fan-out, polling, or multi-request orchestration
- credentials: local `Authorization: Bearer <Personal token>` only; active `X-Client-Secret` flow removed
- provider/registry regression: **1,239 assertions PASS** against the canonical 84,964-byte release
- exhaustive OpenAPI registry coverage: **0 issues**
- production files: **17**
- deterministic exact reconstruction: **PASS**
- real seller-account acceptance: **NOT YET PERFORMED**

## Canonical release artifact

`wildberries-bridge-v0.1.2-extension.zip`

- bytes: `84964`
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`
- production files: **17**

GitHub stores the byte-exact artifact under `reference-0.1.2/archive-exact/`. Run `reference-0.1.2/rebuild_extension.py` to reconstruct and verify it. `reference-0.1.2/run_provider_registry_test.py` reconstructs the exact ZIP, extracts it and runs the provider/registry regression against those exact production bytes.

Current documentation:

- `INSTALL.md`
- `WB_CURRENT_READ_ONLY_INVENTORY_2026-08-12.md`
- `WB_CURRENTNESS_V0.1.2_2026-08-12.md`
- `WB_SECURITY_AND_BLOCKED_SURFACE_V0.1.2.md`
- `WB_BRIDGE_V0.1.2_BUILD_EVIDENCE.md`
- `reference-0.1.2/`

## Architecture

`WB_API_V1 → content script → service-worker durable ownership → fixed WB operation registry → official Wildberries API → bounded/sanitized WB_RESULT_V1 → same bound ChatGPT conversation`.

The provider-neutral conversation binding, manual/autorun lifecycle, commit-before-send, exactly-once request/delivery ownership, Pause/Resume/Stop and recovery model remain inherited from the tested lifecycle core. WB hosts, auth, aliases, request schemas, privacy rules and API-currentness classification are WB-specific.
