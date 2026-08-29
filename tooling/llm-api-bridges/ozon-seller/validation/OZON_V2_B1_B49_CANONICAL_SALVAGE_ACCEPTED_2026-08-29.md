# Ozon V2 B1-B49 canonical salvage — ACCEPTED

Date: 2026-08-29  
Status: `OZON_V2_B1_B49_CANONICAL_SALVAGE_ACCEPTED`

## Scope

Roadmap Step 3 required reconstruction of useful accepted Seller read work from the historical B1-B49 lineage onto the corrected canonical V2 B1 base, under the 463-row Seller master checklist and fixed canonical taxonomy.

This acceptance closes the salvage/reconstruction step. It does **not** claim Seller 463/463 completion or Performance 48/48 completion. Historical accepted reads become the canonical input for the later Personal Data, workflow/report/document, full-Seller, full-Performance and integration gates.

No new B50/B51/etc. implementation stage was created.

## Authorities

Corrected canonical B1 production tree:

- `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`;
- 21 production files;
- 18 JavaScript files.

Accepted historical B49 lineage tip:

- commit `59ce0cedf93e409f5988b16d5b569b4a5f229b1b`.

Historical B49 registry:

- 201 aliases total;
- 191 Seller aliases;
- 10 Performance aliases.

The two duplicate-number orphan branches remain quarantined and are not part of the accepted B49 lineage:

- `feature/ozon-b25-cancellation-read-completion-2026-08-28`;
- `feature/ozon-b26-fbo-posting-detail-read-2026-08-28`.

## Operation-level salvage authority

The accepted operation-level salvage manifest is:

- `OZON_B1_B49_OPERATION_SALVAGE_MANIFEST_2026-08-29.json`;
- `OZON_B1_B49_OPERATION_SALVAGE_SUMMARY_2026-08-29.md`.

It established:

- 49 historical stages analysed;
- 182 unique historical Seller operation keys touched by B1-B49 deltas;
- 6 unique historical Performance operation keys touched;
- zero historical Seller aliases outside the current 463-operation inventory;
- 4 aliases requiring fixed-taxonomy reclassification;
- 2 duplicate-number orphan branches quarantined.

The four reclassified accepted B10 reads are:

- `seller_rating_summary`;
- `seller_rating_history`;
- `seller_fbs_error_index`;
- `seller_fbs_error_postings`.

They are accepted under the existing fixed top-level cluster:

- cluster: `sales_analytics`;
- section: `delivery_returns_cancellations_metrics`.

The unauthorized historical top-level `seller_health` cluster is removed. No replacement top-level cluster was invented.

## Canonical merge boundary

The canonical salvage starts from the accepted corrected B1 production tree and changes only:

- `shared/ozon_operation_registry.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_entitlements.js`.

All other production files remain byte-identical to corrected canonical B1, including the protected runtime and `service_worker.js`.

Canonical B1 wins on every overlapping canonical alias and overlapping canonical contract behavior. Later historical safety helpers are preserved only where they do not replace corrected canonical behavior.

The final candidate core identities are:

- `shared/ozon_operation_registry.js` SHA-256 `e2fb7e8437a34ffa345825ee4cac9547cbcdfd3f14bb3b42289d9a57f5eb9cdb`;
- `shared/ozon_contract.js` SHA-256 `18dde6b56894bcd3d7f3ad3a597d4f7f3dc16d0464ba4078f6122aecf32699c4`;
- `shared/ozon_entitlements.js` SHA-256 `ff53866ce2b2c33a1e270d9c50371641a55bac63d4d02b79f5f3d8fcd1b890f8`.

Final production tree SHA-256:

- `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`.

## Behavioral salvage result

The final behavioral regression proves:

- 42 corrected canonical B1 aliases preserved with canonical registry/request/entitlement semantics;
- 191 historical Seller aliases present in the final candidate;
- 153 historical Seller aliases salvaged beyond the corrected canonical B1 alias set;
- historical-only Seller registry/request/entitlement behavior preserved from accepted B49 except the four explicit fixed-taxonomy reclassifications;
- 10 accepted historical Performance aliases preserved as separate-provider carry-forward;
- `seller_health` absent;
- fixed Seller taxonomy enforced;
- `catalogValidation(...)` passes;
- single command remains a single request;
- no hidden pagination, automatic retry, polling, fanout or chaining was introduced;
- protected runtime remains byte-identical to corrected canonical B1.

The preserved 10 Performance aliases are useful accepted carry-forward only. Their presence does not complete Roadmap Step 6 or the final 48/48 Performance gate.

## Initial validated candidate CI

GitHub Actions run:

- run id: `33239516701`;
- head commit: `f4ccdbdececae54647b9aa9aced2178625d6aeb7`;
- Linux: PASS;
- Windows: PASS.

Candidate artifact:

- artifact id: `9710920643`;
- name: `ozon-v2-b1-b49-canonical-salvage-candidate`;
- artifact ZIP SHA-256: `46ef1125860c810059783daccccc4318569949d373d750191c0390263ab0d80d`.

The artifact was independently downloaded and verified outside the producer job:

- ZIP digest matched;
- 21 production files / 18 JavaScript files;
- production tree matched `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`;
- file set matched corrected canonical B1;
- only the three authorized core files differed;
- all three changed-file SHA-256 values matched;
- all 18 JavaScript files passed `node --check`.

## Deterministic package

Package commit:

- `bdcc86305746b0fccdedf567b470fcaeb85a3335`;
- message: `validation(ozon): package exact B1-B49 salvage candidate`.

Package files:

- `PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29.patch.gz`;
- `PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29_MANIFEST.json`;
- `materialize_v2_b1_b49_canonical_salvage_candidate.py`.

Deterministic patch identities:

- raw patch bytes: 332,186;
- raw patch SHA-256: `6f81a335f13b1a2a673763588e8aca85b1284598ccd6e267ca14beecca02d0bc`;
- gzip bytes: 37,278;
- gzip SHA-256: `363724a309deb6a03b04c53131108d985e02863f42ada158d0129acd4e8c6c4b`.

Package workflow:

- run id: `33239691352`;
- rebuild validated candidate: PASS;
- deterministic patch transport generation: PASS;
- packaged materializer byte-for-byte reproduction: PASS;
- package commit: PASS.

## Exact packaged candidate CI

Exact marker/head commit:

- `926b08c5d3507a206e4b80f14108146afce93ed6`.

GitHub Actions exact run:

- run id: `33239719039`;
- Linux exact candidate: PASS;
- Windows exact candidate: PASS.

Both jobs materialized the final candidate from the committed deterministic `.patch.gz` over the accepted corrected B1 base, then re-ran semantic, manifest and syntax gates against the canonical and historical authorities.

Exact artifact:

- artifact id: `9710978189`;
- name: `ozon-v2-b1-b49-canonical-salvage-exact-candidate`;
- artifact ZIP SHA-256: `628cb9b9af220ee36202c53f09a9a6dea162bc361786f7aa750f91a8c35370c9`.

The exact artifact was independently downloaded and verified outside the producer job:

- ZIP SHA-256 matched `628cb9b9af220ee36202c53f09a9a6dea162bc361786f7aa750f91a8c35370c9`;
- 21 production files;
- 18 JavaScript files;
- production tree matched `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`;
- all three changed core hashes matched the package manifest;
- all 18 JavaScript files passed `node --check`.

## Personal Data boundary

This acceptance does not replace or redesign Personal Data handling.

The accepted B0 operator Personal Data gate remains authoritative:

- OFF blocks before provider execution with zero physical business requests;
- enabling does not replay a previously blocked command;
- an explicit resubmit is required when ON;
- that explicit resubmit may execute an allowed read.

Accepted B9/B17 review/question work remains valid salvage/reference material under that existing gate. Roadmap Step 4 must now audit correct gate attachment across the Seller read surface. Merely returning data that may contain personal data is not a reason to invent a second privacy mechanism.

## Safety

No fresh Seller business API request was made for Step 3 acceptance.  
No fresh Performance business API request was made for Step 3 acceptance.  
No credentials were used or exposed.  
The repair branch production/base files were not replaced during acceptance; the accepted candidate remains a deterministic materialized package over corrected canonical B1.

## Decision

The useful accepted B1-B49 read implementation has been reconstructed onto the corrected canonical B1 authority with deterministic packaging and cross-platform exact-candidate verification.

`OZON_V2_B1_B49_CANONICAL_SALVAGE_ACCEPTED`

Roadmap Step 3 is complete.

The next authorized action is Roadmap Step 4: audit the existing accepted B0 Personal Data gate across the Seller read surface, preserving its established fail-before-provider / no-replay / explicit-resubmit semantics. Do not create B50/B51/etc. and do not make fresh Seller or Performance business API requests for the audit.
