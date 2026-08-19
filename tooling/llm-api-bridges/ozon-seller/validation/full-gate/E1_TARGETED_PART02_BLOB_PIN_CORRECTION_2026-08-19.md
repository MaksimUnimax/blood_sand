# Ozon full-gate E1 targeted part-02 blob pin correction

Date: 2026-08-19
Status: `MANDATORY_E1_AUTHORITY_PIN_CORRECTION`
Scope: validation-only metadata correction. Production/candidate/harness bytes and permanent-gate semantics are unchanged.

## Trigger

RERUN20 report commit `8b51076b2d7a0e67deb5baead7c692cfd8fe9702` stopped in Phase 0 while independently verifying the authority bundle.

The mandatory executable-evidence manifest at commit `2164077863f4dc7d3ee8ec18620ace25e5053c40`, blob `3c0a935d02bb9d930088eb069313dbb01ef1520d`, contains a one-character typo for E1 targeted harness part `02.mjs.part`:

- erroneous metadata pin: `10638ac5c70e07af7f68e51259113e8be63289f4`
- correct Git blob: `10638ac5c70d07af7f68e51259113e8be63289f4`

The erroneous `...c70e...` object does not exist in live GitHub. The correct `...c70d...` object exists and is exactly the file:

`tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/targeted-test-parts/02.mjs.part`

at gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`.

Live checkpoint directory metadata proves the complete E1 part set:

- `00.mjs.part`: blob `ced9b470a6d4dd143303144b3db76888924358c2`, size 7975
- `01.mjs.part`: blob `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`, size 7907
- `02.mjs.part`: blob `10638ac5c70d07af7f68e51259113e8be63289f4`, size 4234
- `03.mjs.part`: blob `42a8e9ee07138eadf62cad80fa584fa532cfc65f`, size 1826

Total remains exactly 21942 bytes. Expected concatenated SHA-256 remains:

`ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

RERUN20 independently materialized part 02 as 4234 bytes with SHA-256:

`8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`

and recomputed the correct Git blob `10638ac5c70d07af7f68e51259113e8be63289f4`.

The remaining exact executable blob authorities named by the manifest were also live-resolved before this correction:

- E2: `b056c2d2b0a6189d310b99944bf14501cc15a6d7`
- E2: `18fc993168945659ae22150dcad23d60677a4638`
- E3: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- E4: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

## Mandatory interpretation

For every validation run after this correction, read the executable-evidence manifest normally, but replace ONLY the E1 `02.mjs.part` Git blob metadata value with:

`10638ac5c70d07af7f68e51259113e8be63289f4`

No E1 bytes, assertions, markers, concatenation order, expected bytes, expected SHA-256, candidate bytes, production bytes, permanent-gate requirement, E2-E8 semantics, or packaging rule changes.

Authority-bundle verification MUST use the corrected blob identity. A runner MUST still independently verify every materialized item and the final E1 concatenated bytes/SHA before execution.

RERUN20 remains a `HARNESS_ERROR`; it is not production-failure evidence and carries no functional PASS into a later run.