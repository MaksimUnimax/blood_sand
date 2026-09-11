# Phase 1 — actual implementation block 001

2026-09-11. WIP, not full Phase1 acceptance and not a ready final patch.

Implemented: strict public operation+params envelope; rejection of top-level path/query/body bypass and unknown fields; internal restored commands fully revalidated; wrapper type checks; prototype-key rejection; NBSP preserved inside payload strings; custom factory ingress guarded. Version 0.1.3 assigned consistently. Registry, provider, transport, credentials and API destinations unchanged.

`MATERIALIZE.py ORIGINAL.zip NEW_DIRECTORY` reconstructs all 17 candidate production files byte-identically to the tested local candidate. The input SHA-256 is checked. It is source code, not a narrative description of missing changes.

Run `node contract.mjs ORIGINAL_EXTRACTED_DIRECTORY CANDIDATE_DIRECTORY NEW_EVIDENCE_DIRECTORY`. Actual final run: 197 checks PASS, 0 FAIL; 172 operations exercised through mocked provider paths. These check request serialization, local rejection and restored-command validation, not live API schemas. Native network fetch is never exposed to the test VM. Real WB calls: 0.

Tested contract SHA-256: a95594af11fd0c9669f2bfbb4669237b2286d08dc8dc3417a8829b977715ad7a.
Registry SHA-256: 08e8a2ad1f325a4bdc0a909b37220b7abaa0be1d94d6b53192666ed5f22c2c75.
Runner SHA-256: 759145214de639001829a6bd6dff96ad475fcd0407728a5fcb578cf9be1a51ae.

Serialization fingerprint is unchanged for the valid fixtures of all 172 enabled operations. Mandatory params and rejection of unsafe/extra fields are intentional command-ingress changes. Source/current API currency is inherited, not newly certified.

A publication error in the immediately preceding commit saved an incomplete base64 transport file. That file is removed by this checkpoint, not used as evidence or source. The verified readable materializer replaces that failed transport approach. A first reconstruction attempt also exposed git apply running inside a parent repository and skipping the nested destination; a standalone materializer and explicit 17-file comparison now prove reconstruction.

Next bounded block: content runtime generation/disposal, stale callbacks and browser regressions. Remaining A01-A53/TA tests are not automatically PASS. No real WB characterization is authorized by this checkpoint.
