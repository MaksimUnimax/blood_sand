# Patch B0 Full Read Core — retest after Windows git-apply LF repair

Date: 2026-08-25
Status: `READY_FOR_INDEPENDENT_RETEST`

Repository: `MaksimUnimax/blood_sand`
Branch: `feature/ozon-full-read-core-b0-2026-08-25`

## Previous retest result

Previous result commit: `22f5818678e7a1bb750c8229f8f72bda1c3efc5f`
Previous exact tested HEAD: `f4cc32ed2e190a3367290b35559870bb923b2419`
Previous decision: `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

The previous retest proved that the inherited A.5 materializer is now byte-stable on Windows: all A.5 identity markers passed.

The B0 stage then failed on the first changed-file identity after `git apply`:

```text
RuntimeError: B0 identity mismatch manifest.json: 5ce0b3634ce8db8349054252ece5c6df2367843f7b705ac3a686cdc68d71cdf2 != f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1
```

The partial 21-file tree was not accepted and no deterministic/browser test was run.

## Root cause

The B0 materializer invoked:

```text
git apply --no-index -
```

without overriding Git line-ending conversion. On Windows environments with `core.autocrlf=true`, Git can write patched working-tree text files using CRLF even though the authoritative B0 patch and expected candidate identities are LF-byte based.

This changes the byte identities after a logically successful patch application.

The repair commit is:

`6344deabf0070987f7dc66ed430e89e9dcafe698`

It changes only the validation materializer invocation to:

```text
git -c core.autocrlf=false -c core.eol=lf apply --no-index -
```

No B0 production code, patch bytes, transport chunk, expected file SHA-256, expected tree SHA-256, Autorun semantics, provider behavior or accepted A.5 authority was changed.

## Authorities remain unchanged

Accepted A.5 tree SHA-256:

`4b77ed8500e3caacefff43a82002dc6ef5bfd562511bf10ef57a5392069c22a0`

B0 patch SHA-256:

`7842bbe1c9be77ae753a8f5dec25d5d931736ace32e2198acec0da51666a6e21`

Expected B0 production file count:

`21`

Expected B0 production tree SHA-256:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

Expected `manifest.json` SHA-256:

`f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1`

## Mandatory retest gate

Use a completely fresh output directory and run the exact B0 materializer.

Require every inherited A.5 marker and all six B0 markers:

```text
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B0_PATCH_APPLY_PASS
PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B0_CHANGED_FILE_IDENTITIES_PASS
PATCH_B0_TREE_MANIFEST_SHA256_PASS
```

If any identity differs or any marker is absent, stop fail-closed, record the exact blocker and do not run deterministic/browser tests.

Only after this gate passes may the existing B0 deterministic and browser acceptance instruction be executed.

Do not modify production code. Do not author a fix. Do not start B1-B8.
