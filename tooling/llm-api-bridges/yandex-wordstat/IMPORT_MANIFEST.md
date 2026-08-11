# Yandex Wordstat Bridge — canonical import manifest

Дата фиксации: 2026-08-10
Статус: canonical reference for `blood_sand` marketplace/API tooling

## Canonical supplied artifact

- filename: `wordstat-bridge-v1.1.5-full-function-environment-audit.zip`
- version: `1.1.5`
- SHA-256: `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`
- size: `174927` bytes
- supplied by project owner in the active project conversation

Canonical append-only documentation:

- filename: `WORDSTAT_BRIDGE_DOCUMENTATION_APPEND_ONLY_FULL_FUNCTION_ENVIRONMENT_AUDIT.md`
- SHA-256: `437a69022b31621d7a749e3b92c0faf0c45f3d7be60e1a901cda65c3faf0a25a`
- size: `171659` bytes

## Fresh verification at import

The exact supplied ZIP was freshly extracted before this manifest was committed.

Checks:

- `manifest.json` version: `1.1.5`
- full Node regression suite: `283/283 PASS`
- no test failures

The source archive contains the production extension files, shared lifecycle modules and exhaustive regression tests. It is the only accepted Wordstat implementation reference for the new `blood_sand/tooling/llm-api-bridges/` family. Older `Brige`, `BridgeSmall`, `bridgeService`, historical Wordstat hotfix archives and prior versions are not authority for this provider.

## Fresh re-verification — 2026-08-11

The project owner's exact uploaded artifact `wordstat-bridge-v1.1.5-full-function-environment-audit(1).zip` was located again in the file library and materialized without substituting the model-generated copy.

Fresh checks on that exact uploaded file:

- size: `174927` bytes;
- SHA-256: `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a` — exact canonical match;
- ZIP entries: `44`;
- production/shared/test layout matches the accepted 1.1.5 package;
- fresh `npm test`: `283/283 PASS`, `0 FAIL`.

This re-verification strengthens provenance but **does not by itself close roadmap 03A.2**. The current GitHub connector available to this execution environment writes UTF-8 repository files but does not expose a direct binary upload action for the ZIP. Therefore this manifest must not falsely claim that the executable ZIP/source payload is already stored byte-for-byte in the repository.

Roadmap 03A.2 remains `[~]` until an actual repository payload is present and can be reconstructed/verified against the canonical SHA above.

## Proven invariants reused as design requirements for Ozon/Wildberries

- credentials remain local and are not emitted to the LLM;
- provider/API endpoint allowlist, no arbitrary URL transport;
- one accepted command/operation has exactly-once provider-side execution semantics;
- manual and autorun ownership are mutually exclusive;
- durable commit-before-click/delivery state;
- service-worker restart recovery is fail-closed around unknown paid/request outcomes;
- worker-owned delivery single-flight;
- duplicate tabs/ownership are fail-closed;
- result delivery never silently overwrites user composer text;
- Auto Send uses one committed Send action, not a retry-click loop;
- popup actions release busy state and preserve current operation status;
- Unicode request payloads are preserved while credential/header validation is strict.

## Source layout in the accepted ZIP

Production:

- `manifest.json`
- `content_script.js`
- `service_worker.js`
- `popup.html`
- `popup.css`
- `popup.js`
- `shared/autorun_model.js`
- `shared/composer_send.js`
- `shared/conversation_identity.js`
- `shared/manual_controls.js`
- `shared/proven_writing_block_capture.js`
- `shared/wordstat_protocol.js`

Regression suite includes protocol, transport Unicode, manual/autorun lifecycle, conversation binding/isolation, start parity, delivery single-flight, worker recovery, popup/runtime exhaustive and every-function tests.

## Import rule

Do not rewrite this implementation into an abstract framework before Ozon/WB requirements are known. Shared behavior is extracted only when both marketplace providers prove the same invariant. Provider-specific authentication, endpoints, pagination, limits and response schemas remain provider adapters.
