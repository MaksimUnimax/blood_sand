# Ozon AI Worker — repaired 26 READ live defect ledger

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST`
Status: `ACTIVE_COLLECTION_NO_PATCHING`

## Governing rule

Complete the entire repaired-26 live sweep before implementing fixes. Continue collecting standalone and multi-command batch evidence even after defects are discovered. Do not patch runtime during the collection phase.

Any prepared local/orphan patch not committed to the branch is non-authoritative and must not be treated as part of the runtime under test.

## DEFECT-001 — report_file_get is unconditionally personal-data gated

Discovery:
NEW-01 standalone file-read step.

Observed result:

- operation: `report_file_get`
- file ref came from `report_products_create -> report_info` for report type `seller_products`;
- bridge policy blocked before network;
- `physical_business_request_count = 0`;
- `external_request_executed = false`;
- entitlement status: `POLICY_BLOCKED`;
- reason: `personal_data_setting_off`;
- error code: `OPERATION_DISABLED_BY_USER`.

Why this is a defect candidate:

The source report is the safe `seller_products` report, but the internal helper is statically classified as an operator-personal-data-gated operation. This blocks safe report ingestion when the user's personal-data setting is OFF.

Important safety constraint for the later fix:

Do **not** simply remove privacy gating from every `report_file_get`. Generated FBS/PDF/document refs that originate from personal-data-gated source operations must remain gated. The later fix must preserve source/ref privacy provenance or an equivalent fail-closed mechanism.

State:
`OPEN_UNPATCHED`

## DEFECT-002 — exact_request_preserved conflicts with command transformation metadata

Discovery:
NEW-02 Run1 `report_returns_create_v2`.

Observed planning fields:

- logical fingerprint: `687fa368`
- physical fingerprint: `d1fbfbfe`
- `command_transformed = true`
- entitlement metadata: `exact_request_preserved = true`.

The provider request itself succeeded with HTTP 200 and returned a report code.

Why this is a defect candidate:

The metadata simultaneously claims exact preservation and a transformed physical command with a different fingerprint. The complete sweep should determine whether this is a legitimate normalization reported incorrectly, an unnecessary planner transformation, or a fingerprint/accounting defect.

State:
`OPEN_UNPATCHED_NEEDS_COMPARISON_WITH_MORE_COMMANDS`

## Patch phase

No patch work begins until the standalone + batch collection phase is explicitly complete. At that point defects will be grouped by root cause, patched together where appropriate, then regression-tested and re-run live where required.
