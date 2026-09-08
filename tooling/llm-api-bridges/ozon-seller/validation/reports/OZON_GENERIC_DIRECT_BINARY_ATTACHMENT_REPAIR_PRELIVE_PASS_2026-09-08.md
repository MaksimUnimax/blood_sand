# Ozon generic direct-binary attachment repair — pre-live acceptance — 2026-09-08

## Verdict

**PRE-LIVE REPAIR GATE: PASS**

This record closes the no-provider corrective implementation/CI/package gate for the direct-binary attachment defect frozen in `OZON_MULTI_AI_DIRECT_BINARY_ATTACHMENT_LIVE_FAILURE_2026-09-08.md`.

It does **not** claim live provider re-verification. A fresh installation of the exact tested ZIP and a new explicit live command are still required before the failed direct-binary branch can be upgraded from live FAIL to live PASS.

## Authority

- Repository: `MaksimUnimax/blood_sand`
- Repair branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Branch base / frozen failure evidence authority: `b926f86ee606c20762435be1806467037e939018`
- Tested source HEAD: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Tested source tree: `8c193bab439765497401bdd3550dd5ceec4abf6b`
- Bridge: `ozon-llm-api-bridge v0.1.19`

## Corrective commits

1. `1fcf828c0688755142deacb1c4a29fc45b67eb0f` — allow ChatGPT direct-binary PNG/ZIP attachments.
2. `50d899388d8087758b3229a56e6dc89151e684ac` — recognize durable direct-binary opaque refs in delivery policy.
3. `750ac81b9e420f44497bb3c12bcdad2ab5cc8407` — recover direct-binary refs from durable `OZON_RESULT_V1` reports.
4. `19fb9401e8ba195677c39efef786cb54b73b6586` — generic direct-binary capture lifecycle.
5. `35a668d00ced3ea614d7bc6c2d656ee3d78f94ca` — wire the generic direct-binary provider wrapper into production service-worker bootstrap.
6. `b2dfda7cd5483c8927537424eb3c35c6ab096c4f` — deterministic CSV/ZIP/PDF/PNG direct-binary regression.
7. `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb` — CI/package certification wiring.

## Repair behavior

The production wrapper `dist-step7-candidate/shared/direct_binary_file_delivery_patch.js` now handles successful registry-declared direct binary provider responses generically for:

- `text/csv`;
- `application/zip`;
- `application/pdf`;
- `image/png`.

For a successful direct-binary result it:

1. uses the bytes already returned by the single completed provider request;
2. validates declared byte length and format signature/content sanity;
3. persists the exact bytes in the existing delivery-artifact IndexedDB store;
4. assigns an opaque `rpf_s_*` or `rpf_p_*` ref according to personal-data policy;
5. removes `file_content_base64` and transport `encoding` from the user-visible/durable result;
6. leaves only safe attachment metadata and the opaque ref in `OZON_RESULT_V1`;
7. lets the existing attachment state machine recover the opaque ref after durable-state reload;
8. performs no second provider request and defines no automatic retry.

The existing `report_file_get` URL-backed/original-provider-file route remains separate and unchanged.

## Deterministic regression

Added:

`validation/regression/run_direct_binary_provider_attachment_gate.mjs`

Passed checks include:

- `REG_DIRECT_BINARY_CSV_ZIP_PDF_PNG_SINGLE_PROVIDER_CAPTURE_PASS`
- `REG_DIRECT_BINARY_BASE64_REDACTION_AND_OPAQUE_REF_PASS`
- `REG_DIRECT_BINARY_PERSONAL_POLICY_REF_PREFIX_PASS`
- `REG_CHATGPT_ZIP_PNG_CAPABILITY_PASS`
- `REG_DIRECT_BINARY_DURABLE_REPORT_REF_RECOVERY_PASS`
- `REG_DIRECT_BINARY_INVALID_MAGIC_FAIL_CLOSED_NO_RETRY_PASS`
- `DIRECT_BINARY_PROVIDER_ATTACHMENT_GATE_PASS`

The existing multi-AI file-delivery regression suite also remained green.

## GitHub Actions acceptance

Workflow run: `34223853082`

Head SHA: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`

Conclusion: **SUCCESS**

Jobs:

- Ubuntu regression: PASS
- Windows regression: PASS
- package: PASS
- exact package-source regression rerun: PASS
- native Chrome File/DataTransfer primitive: PASS
- installed MV3 service-worker bootstrap: PASS
- IndexedDB artifact store: PASS
- deterministic ZIP rebuild: PASS
- fresh-extract byte-content equivalence: PASS
- production JS syntax checks: PASS

Pinned Chrome for Testing: `152.0.7977.82`.

## Exact installable package

Inner production ZIP:

`OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`

- bytes: `245479`
- SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83`
- file count after fresh extraction: `30`

GitHub Actions artifact:

- artifact id: `10054874116`
- artifact name: `ozon-multi-ai-file-delivery-5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- outer artifact bytes: `244210`
- outer artifact SHA-256: `01f5e4230fb1fa5602ebfbbd06c6a0db5a2ea5d065517e713cb46f0abc22d804`

## Independent artifact readback

The completed Actions artifact was downloaded independently after CI completion and verified outside the Actions job:

- outer artifact size: `244210` bytes — exact match;
- outer artifact SHA-256: `01f5e4230fb1fa5602ebfbbd06c6a0db5a2ea5d065517e713cb46f0abc22d804` — exact match;
- outer archive contains exactly one inner production ZIP;
- inner filename: exact match;
- inner bytes: `245479` — exact match;
- inner SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83` — exact match;
- `unzip -t`: PASS;
- extracted production file count: `30`;
- `shared/direct_binary_file_delivery_patch.js` present;
- `service_worker_entry.js` imports the direct-binary wrapper after `service_worker.js` and before `file_delivery_model_policy.js`;
- selected production JS `node --check`: PASS.

This independently confirms that the installable ZIP is the same package certified by the workflow.

## Live state after this gate

Already proven on the previous file-delivery build, but must be re-run on this exact corrective build before the owner file matrix is closed:

- oversized generated Bridge text -> TXT;
- Seller provider CSV via `report_file_get`;
- Seller provider XLSX via `report_file_get`;
- generated Ozon cargo-label PDF via generated ref + `report_file_get`.

Direct-binary state:

- `performance_daily_csv`: previous live run = **FAIL**, repair now **PRE-LIVE PASS**, fresh live rerun required;
- direct PNG: deterministic repair gate PASS, live prerequisite/fixture still required;
- direct ZIP: deterministic repair gate PASS, live provider prerequisite remains blocked until a genuine prepared Performance report UUID exists.

## Next action

Install the exact tested ZIP above, then execute a fresh explicit live direct-binary CSV verification with no hidden retry:

```text
OZON_API_V1
{"operation":"performance_daily_csv","params":{"dateFrom":"2026-08-01","dateTo":"2026-08-31"}}
```

Acceptance requires one logical business command, one physical business request, exact-request preservation, HTTP 200, no visible base64, one opaque attachment ref, an actual CSV attachment with independently verified bytes/hash/content, and no second provider request.

After that, re-run the remaining materially distinct live file-delivery branches on this exact build before returning to the Performance stress-test/Autorun line.
