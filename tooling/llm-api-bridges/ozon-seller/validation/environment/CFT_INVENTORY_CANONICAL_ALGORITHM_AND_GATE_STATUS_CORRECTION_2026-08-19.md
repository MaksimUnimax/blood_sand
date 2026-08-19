# Ozon validation — canonical CFT inventory algorithm and gate-status correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_CORRECTION`

This correction changes no production byte, candidate byte, source CFT byte, browser dependency, Chrome flag, functional assertion, or gate acceptance criterion.

## Authority

- Qualified environment: `c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`
- Preflight6 evidence: `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`
- RERUN8 failed report: `8a7d1bbc3053a995578032104356244be6fe3bb4`
- Inventory forensic: `60acc40aa484087f4c408d03611597625f2dab33`
- Forensic classification: `INVENTORY_ALGORITHM_MISMATCH`

## Canonical source-CFT inventory algorithm

For all later validation runs derived from this qualified environment, use exactly the preflight6 inventory algorithm:

1. recursively enumerate each directory with `fs.readdirSync(dir).sort()`;
2. use `lstatSync` and retain regular files only;
3. normalize each relative path with `path.relative(root, full).split(path.sep).join('/')`;
4. record exactly `{path,size,sha256}`;
5. sort final records by `a.path.localeCompare(b.path)`;
6. serialize each record independently with `JSON.stringify(record)`;
7. join records with LF and append one final LF;
8. SHA-256 hash that UTF-8 text.

For the currently qualified Chrome for Testing `151.0.7922.47` source tree this exact algorithm yields:

- regular files: `308`
- inventory SHA-256: `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`

Do not compare that authority SHA to a digest produced by any other serialization or traversal algorithm.

The forensic report proved on the same current source tree that the RERUN8 algorithm produced `d73725c193a199eaed2dd914b5e800620df8f130f928a33768b7acbbf9f0a222` solely because it used a different record schema/serialization. Its canonical path/size/per-file-SHA manifest had zero differences from the preflight6 manifest. Therefore RERUN8 does not establish source CFT drift.

## Qualified environment remains valid

All other qualified-environment requirements remain unchanged:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- source tree never modified;
- fresh validation-owned byte-identical full-tree copy;
- source/copy identity based on canonical per-file `{path,size,sha256}` records;
- copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` exactly once, `shell:false`, no elevation;
- exact setup success exit code `78`;
- copied regular-file inventory/bytes unchanged after setup;
- Puppeteer launch with `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`, fresh temporary userDataDir;
- exact already-qualified minimal Chrome argument sequence only;
- no `--disable-gpu`, `--no-sandbox`, or GPU/sandbox/crash-limit bypass switches;
- runtime `browser.installExtension(candidateDir)`;
- `browser.extensions()` must enumerate the returned candidate id, enabled, version `0.1.19`;
- initial worker count zero is allowed before the already-authorized bounded Extension API activation path.

## Full-gate result status correction

Permanent living-gate blocks are mandatory whenever their corresponding functionality exists in the candidate.

Allowed report states for each block are:

- `PASS`: the mandatory block ran and passed;
- `FAIL`: the mandatory block ran and failed;
- `NOT_RUN`: execution terminated before the block was reached;
- `NOT_APPLICABLE`: only when the corresponding functionality is genuinely absent/removed from the candidate and the permanent living gate permits that conclusion.

A pre-functional environment/harness failure MUST report existing mandatory functional blocks as `NOT_RUN`, never `NOT_APPLICABLE` merely because they were not reached.

`NOT_RUN` cannot contribute to an umbrella PASS. `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS` requires every applicable block 01-16 to be `PASS`.

## RERUN8 disposition

RERUN8 remains a terminal FAIL classified `HARNESS_ERROR`. Its pre-functional inventory failure was caused by an inventory-algorithm mismatch. It provides no production behavior evidence and no functional block acceptance.

The next authoritative action is one new consolidated full gate from the unchanged deterministic candidate, using this corrected validation-only contract. Do not reuse RERUN8 block statuses as acceptance evidence.