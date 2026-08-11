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

At that checkpoint this re-verification strengthened provenance but **did not by itself close roadmap 03A.2**. The transfer path available at that moment had not yet produced a byte-verified repository source payload.

## Repository transport integrity tests — 2026-08-11

Multiple controlled transfer probes have been rejected before acceptance because Git-side bytes did not match the intended payload.

### Earlier probes

- a planned `20000`-character Base64 chunk was stored as a `18536`-byte blob;
- resulting Git blob SHA did not match the precomputed intended chunk SHA;
- a separate smaller direct Git-blob experiment also failed its precomputed blob-SHA check.

### Contents API 12000-character probe on `main`

A later controlled probe used the repository contents API with the **first exactly 12000 characters** of Base64 from the freshly re-materialized canonical user ZIP.

Expected locally before upload:

- text length: `12000` bytes;
- Git blob SHA: `d4a7effc20f29f6f38587cf70b75c36ace6d128c`;
- text SHA-256: `e27cab4377a27bd9d5f8445c8fde36d6c9eef08ac54c2c270ca67e7a8ecbabeb`.

Git actually stored:

- blob length: **`11852` bytes**;
- blob SHA: **`b1cea400c1ea998726ad1095b86ef881a775c676`**.

This is a hard integrity failure: the transport changed/truncated the intended text. The probe file was immediately deleted from `main` in cleanup commit `c695ad1a2f1474da28b0b54f8509246bc5a89626`.

Therefore:

- neither a successful API response nor a created Git commit is treated as proof of byte integrity;
- every future text-chunk transport test must be verified by exact Git blob SHA and byte length;
- no staging payload is canonical until the reconstructed ZIP itself matches the canonical SHA-256;
- no experimental branch or staging file may be merged merely because GitHub accepted the write.

## Repository source import closure — 2026-08-11

The transport blocker was subsequently resolved without accepting any unverified staging payload. The canonical production source is now physically stored at:

`tooling/llm-api-bridges/yandex-wordstat/reference-1.1.5/`

Closure checks:

- source payload commit on `main`: `b9b7f580500742e80901fe2e1c135c056cf239e4`;
- `12/12` production files match the exact owner-supplied package by Git blob SHA;
- `content_script.js`: `751777692b6c156209f52c5559060f9170d10bb1`;
- `service_worker.js`: `6b86eb118b096c7de0a48b64628d4d04113668ff`;
- `popup.js`: `a36993c02da6da64e00c114e76847d4a23b5cf36`;
- exact uploaded ZIP remains `174927` bytes with SHA-256 `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`;
- fresh canonical `npm test` after import: `283/283 PASS`, `0 FAIL`.

The repository payload is therefore accepted as the canonical executable/source representation and roadmap **03A.2 is closed `[x]`**. Earlier failed transport probes remain historical provenance only.

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
