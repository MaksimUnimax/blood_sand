# Windows package parity failure — proven root cause

Date: 2026-09-11
Patch branch: `repair/ozon-alice-drag-drop-transport-2026-09-11`
Exact executable commit: `39eadd2699320774ef53964ea8cf347057c1b813`
Exact executable tree: `f8ec34c4754fb7369a5dbff618705b1d01c6e048`

## Preserved negative evidence

Final pre-handoff v3 run `34553141063`:

- Linux authoritative job: PASS.
- Windows source/runtime/regression/package SHA/package byte-length checks: PASS.
- Windows final working-tree-vs-extraction byte parity comparison: FAIL.
- Finalize-evidence job did not run; therefore v3 never produced PRE-HANDOFF PASS.

The exact installable ZIP used by that run was:

- `OZON_BRIDGE_v0.1.19_ALICE_DRAG_DROP_CORRECTIVE_20260911.zip`
- bytes: `249906`
- SHA-256: `069808508accbb6a091f3ae9358bfee43f27c42f60210899dd0fc621c12233dd`

## Diagnostic authority

Dedicated Windows diagnostic run `34553415387` downloaded the **same Actions artifact from run 34553141063** and re-verified the exact installable ZIP SHA/byte length above before comparing source and extraction.

Observed:

- source file count: `31`
- extracted file count: `31`
- only in source: `[]`
- only in extracted: `[]`
- hash mismatch count: `31`
- line-ending-only mismatches: all 31 files
- non-line-ending mismatches: `[]`

For every one of the 31 production files, `git ls-files --eol` reported:

`i/lf    w/crlf`

For every mismatch, the Windows checked-out source contained CRLF while the Linux-built/canonical ZIP contained LF. Example first differing bytes:

- Windows working tree: `... 0d 0a ...`
- extracted ZIP: `... 0a ...`

## Root cause

**Verifier defect, not production/package defect.**

The v3 Windows verifier incorrectly compared:

`Windows checkout working-tree bytes (Git platform conversion: CRLF)`

against:

`canonical/Linux-built installable ZIP bytes (LF)`.

That is not a valid byte-parity authority for a cross-platform Git checkout.

## Correct verifier contract

Windows package parity must compare each extracted ZIP member against the **raw Git blob bytes from the exact executable commit**, not against platform-transformed working-tree bytes.

Required v4 checks:

1. exact executable commit/tree unchanged;
2. no production drift after exact executable commit;
3. exact ZIP SHA/byte length;
4. exact ZIP member set equals exact-commit `dist-step7-candidate` file set;
5. every extracted member SHA-256 equals `git show <EXACT_EXECUTABLE_SHA>:<repo-path>` raw bytes;
6. runtime/regression gates on Windows and extracted package still pass.

Production code changes required for this root cause: **0**.
Provider calls required: **0**.
