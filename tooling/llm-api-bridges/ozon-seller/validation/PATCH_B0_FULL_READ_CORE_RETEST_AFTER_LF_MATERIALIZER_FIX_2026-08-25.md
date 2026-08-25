# Patch B0 Full Read Core — retest after Windows LF materializer fix

Date: 2026-08-25
Status: `READY_FOR_INDEPENDENT_RETEST`

Repository: `MaksimUnimax/blood_sand`
Branch: `feature/ozon-full-read-core-b0-2026-08-25`

## Previous independent result

Previous tester result commit: `e41d0853a21b59fbe235940e9c23192f3c3d15e9`
Previous exact tested HEAD: `cb6ef0e3cbc4affb76832c4c2d78555c434c20f3`
Previous decision: `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

That rejection was a validation/materialization blocker before B0 candidate creation, not an executed B0 product/browser failure.

The inherited A.5 materializer failed on Windows with:

```text
RuntimeError: Patch A.5 popup.js identity mismatch: b051187f786abb30d0dcb1a7eec3bbb3b7a4f258e91055d26129586e3a200c4e
```

No B0 materializer marker, deterministic regression, browser case, Seller request, or Performance request ran.

## Root cause and repair

Repair commit: `e53fab9d239457dd91a3aac2941651f3482dbbbd`

Root cause: the accepted A.5 materializer used `Path.write_text(...)` for generated `popup.js` and `service_worker.js`. On Windows, text-mode newline translation can convert LF to CRLF and therefore change byte SHA-256 even when logical source content is unchanged.

The repair changes only the two generated-file writes from platform-dependent text writes to explicit UTF-8 byte writes:

```text
popup.write_bytes(p.encode("utf-8"))
worker.write_bytes(w.encode("utf-8"))
```

No accepted A.5 or B0 production identity constant was changed.

Accepted A.5 authority remains:

- popup.js SHA-256: `e77beb6eb5e23aebada2ded9a834e7095f14e74ee9f1e9b54503377a7d87b5e7`
- service_worker.js SHA-256: `dd67b793d7c28595b5e795f918f702d4fd472c9f43f2bec467e56b85587d29b9`
- 19-file tree SHA-256: `4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0`

Expected B0 authority remains:

- production files: `21`
- production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- candidate ZIP SHA-256: `4233bd16941828489f5cdbefcef16d16a8e947020ee865daf0b21f3ee883ddcd`

## Mandatory independent retest

The tester must start again from a fresh output directory and rerun the exact B0 materializer.

Require all six B0 markers before any deterministic/browser test:

```text
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B0_PATCH_APPLY_PASS
PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B0_CHANGED_FILE_IDENTITIES_PASS
PATCH_B0_TREE_MANIFEST_SHA256_PASS
```

If any marker is absent, stop fail-closed and record the exact new blocker. Do not modify production code.

If the materializer passes, continue the complete deterministic and browser matrix from:

`PATCH_B0_FULL_READ_CORE_CODEX_TEST_INSTRUCTION_2026-08-25.md`

The existing result file must be replaced with the new retest evidence:

`PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`

Record the exact branch HEAD tested before committing the replacement result file.

Final decision remains exactly one of:

- `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`
- `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

Do not start B1-B8 until an independent retest returns `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`.
