# Ozon Bridge — CFT inventory algorithm forensic

Date: 2026-08-19
Status: `VALIDATION_ONLY_FORENSIC`

This is validation-environment forensic authority only. It authorizes no production edit, no candidate edit, no source-CFT edit, no browser launch, and no full-gate execution.

## Trigger

RERUN8 report commit:
`8a7d1bbc3053a995578032104356244be6fe3bb4`

Qualified environment evidence:
`6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

Qualified environment commit:
`c8a4d185573e2d96a05f8a1c9fa3da7b10a2dc78`

Preflight6 reported:
- 308 regular files;
- source inventory aggregate SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`.

RERUN8 reported:
- 308 regular files;
- independently computed source inventory aggregate SHA-256 `d73725c193a199eaed2dd914b5e800620df8f130f928a33768b7acbbf9f0a222`.

Because RERUN8 explicitly used an independently computed inventory, aggregate-hash inequality alone does not prove source-CFT byte drift unless both runners used the same canonical inventory serialization and ordering.

## Forensic goal

Determine whether the `d7b8...` versus `d737...` mismatch is:

1. `INVENTORY_ALGORITHM_MISMATCH` — the same per-file path/size/SHA inventory was hashed with different canonicalization/serialization/order; or
2. `SOURCE_CFT_BYTE_DRIFT` — at least one relative regular-file path, size, or file SHA differs; or
3. `FORENSIC_INCONCLUSIVE` — runner source or required evidence is unavailable.

Do not infer drift from aggregate hashes alone.

## Required evidence

Inspect the actual validation runner files used in the same validator workspace if still present:

- `D:\codex\Test\qa-full-gate-composer-wait\ENV_PREFLIGHT6.mjs`
- `D:\codex\Test\qa-full-gate-composer-wait\RERUN8_QUALIFIED_FULL_WRAPPER.mjs`

Do not modify either file.

Extract and report, verbatim or structurally exactly enough to compare:

- recursive file-selection rule;
- regular-file filtering rule;
- relative-path normalization rule;
- sort comparator/order;
- size representation;
- per-file SHA algorithm;
- record serialization format;
- aggregate concatenation / JSON / newline format;
- aggregate SHA algorithm.

Then, against the current source CFT tree only, compute:

A. the preflight6 inventory using the exact preflight6 algorithm;
B. the RERUN8 inventory using the exact RERUN8 algorithm;
C. one canonical per-file manifest sorted by normalized POSIX-style relative path, each record containing `{path,size,sha256}`.

Do not modify the source CFT tree.

If both algorithms enumerate the same canonical manifest (same paths, sizes, per-file SHA-256) but produce different aggregate hashes, classify `INVENTORY_ALGORITHM_MISMATCH`.

If canonical manifests differ, identify every differing path with old/current evidence available from the two runner-derived computations. Do not guess historical bytes that are not available. Classify `SOURCE_CFT_BYTE_DRIFT` only when a per-file path/size/SHA difference is actually proven.

If `ENV_PREFLIGHT6.mjs` is absent, search the existing validation workspace only for its exact retained copy or source fragment. Do not reconstruct its algorithm from memory or the aggregate SHA. If unavailable, classify `FORENSIC_INCONCLUSIVE`.

## Safety

- no browser launch;
- no `setup.exe` invocation;
- no extension install;
- no full gate;
- no candidate reconstruction required;
- no production/candidate/source-CFT writes;
- no ACL changes;
- no dependency installation/update;
- no real Ozon/Performance requests;
- no operator browser actions.

## Result contract

The report must record:

- both runner file SHA-256 values;
- whether both runner sources were available;
- exact algorithm differences;
- current file count under each algorithm;
- current aggregate SHA under each algorithm;
- whether canonical per-file manifests are identical;
- count/list of per-file differences if any;
- classification;
- modification/network counters.

This forensic PASS/FAIL is not a production or browser-functional gate result.