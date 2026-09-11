# Block007 — restore, freeze and test the actual candidate

2026-09-11. Authorized continuation: «Продолжай так же сохраняя промежуточный прогресс».

Live branch read at start: `6c99489884be9ff316ba76f1ac2dda5a3846cc56`.
The root cursor still correctly required final 0.1.4 version freeze and exact-package regression. No existing 0.1.4 ZIP was assumed.

## Executed recovery

- Pinned WB0.1.3 ZIP: SHA256 `b6628d00fba1b98f1a0dfe37f0d658b6cd00842b071e4bc927a2ae58f2859ceb`.
- Retrieved block004 protocol, block005 worker recipes and runtime, and all four block006 snapshot parts through the connected GitHub tool.
- All four snapshot blob hashes matched. Decoded snapshot JSON: 70063 bytes, SHA256 `5bb293734232f2e49f61bdb3ed2448b38b5e9bdcbfd427fbb6e0086f08e31f5f`, 19 saved recipe/test/evidence files.
- Applied saved recipes to a separate copy of the pinned 0.1.3 input.
- Compared every reconstructed production file with block006 `SOURCE_HASHES.json`: **19/19 identical; 0 mismatches**.
- Reconstructed worker SHA256: `f4ce512f2d21564f83db355fa93a51ae431d1b6eabab2764ee006b272f764945`.
- Reconstructed content SHA256: `faeb433b9d3fafe2b1d731a77d5abdc83b986dc861fa0d4ecb40e68ed71529e8`.
- Local Node v22.16.0, Chromium and Python Playwright are available. Direct shell DNS download failed; GitHub connector and local execution work. Do not report this as failure of all tools.

## Frozen next scope

Freeze visible/runtime/manifest version 0.1.4 without changing WB endpoints, auth, existing enabled/disabled registry or transport. Re-run original contract/worker/browser tests and block004–006 tests from extracted final ZIP. Persist per-assertion logs, exit codes, source/package hashes and exact reconstruction route. Then update execution cursor and publish before any new implementation block.

This receipt is only reconstruction evidence, not a new behavioral PASS, not full A01–A53 acceptance, and not installed/live certification. Real WB calls this continuation: 0. The previously reported 313 behavioral checks are not recertified until executed in this run.
