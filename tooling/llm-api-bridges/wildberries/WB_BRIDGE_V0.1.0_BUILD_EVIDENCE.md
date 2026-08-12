# Wildberries Bridge v0.1.0 — build/test evidence

Build date: **2026-08-12**

## Source gate

- current executable registry: **157** aliases
- body-required aliases with explicit fixtures: **53**
- final source suite: **365/365 PASS**
- raw V8 executable production lines: **6775/6775 covered, 0 uncovered**
- source JS syntax: **PASS**
- source static secret/host scan: **PASS**

## Production package

- production files: **17**
- source → production tree → fresh unpack byte identity: **17/17 PASS**
- fresh-unpacked ZIP suite: **365/365 PASS**
- fresh-unpacked JS syntax + manifest parse: **PASS**
- final package static security: **PASS**
- Chromium `--pack-extension`: **exit 0 / PASS**
- deterministic rebuild: **byte-identical / PASS**

## Final artifact

- file: `wildberries-bridge-v0.1.0-extension.zip`
- bytes: `81133`
- SHA-256: `f35ab38f7399965ccae4b07cde40052129cfccbad2d5d6a9750775de6628cd29`

## Source/evidence archive

- file: `wildberries-bridge-v0.1.0-source-tests-evidence.zip`
- bytes: `197851`
- SHA-256: `cd2da7a8df2743527da6e32aa21e44f2efe14e338c2f4f5cc154bd01c87ab53b`

## Security packaging boundary

The distributed production ZIP contains exactly the 17 production files. It contains no tests, evidence, package metadata, PEM/private key, CRX, seller credentials or user-account evidence.

## Acceptance boundary

Status: **AUTOMATED TESTED**.

Not claimed yet: **LIVE USER-ACCOUNT ACCEPTED**. A user-side Chrome installation and authenticated read-only Wildberries smoke test are still required.
