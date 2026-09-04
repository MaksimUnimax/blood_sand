# DEFECT-014 dependency closure — pre-handoff trigger

Date: 2026-09-04
Branch: `research/ozon-product-demand-2026-09-02`
Repair: `report_file` provider taxonomy / entitlement metadata

## Dependency inventory

Runtime provider categories in the packaged browser extension are exactly:

- `seller_api`
- `performance_api`
- `report_file`

The DEFECT-014 audit covered every provider-sensitive path found in the packaged `dist-step7-candidate` runtime:

1. operation-registry provider validation;
2. Seller capability requirement selection;
3. Seller-capability planning and entitlement output;
4. Seller request-builder dispatch guard;
5. Performance request-builder dispatch guard;
6. binary response-style provider classification;
7. direct entitlement classification in `ozon_entitlements.js`;
8. provider execution dispatch in `ozon_provider.js`;
9. Seller quota bypass for non-Seller providers in `service_worker.js`;
10. credential selection / isolation;
11. report-file provenance and personal-data policy;
12. report-file trusted-host transport and parsing;
13. user-visible planning/execution metadata;
14. report-file workflow tests and the package effect-repair gate.

## Repair boundary

Executable changes are limited to `dist-step7-candidate/shared/ozon_contract.js`, `shared/ozon_entitlements.js`, and `shared/ozon_provider.js`:

- `performance_api` keeps the Performance-specific entitlement reason;
- `report_file` receives a report-file-specific reason;
- `seller_api` keeps Seller entitlement evaluation;
- direct entitlement lookup explicitly treats both `performance_api` and `report_file` as non-Seller;
- provider execution dispatch explicitly handles all three categories;
- unknown provider categories fail closed before network execution;
- wrong request-builder errors identify the actual provider;
- binary response-style validation no longer treats every non-Seller provider as Performance.

`service_worker.js`, credentials, transport, storage, manifest, report parser, personal-data policy, and Ozon request schemas are not changed by DEFECT-014.

## Permanent regression coverage

`run_provider_taxonomy_gate.mjs` proves all three provider categories explicitly, checks direct entitlement lookup and report-file/Performance/Seller planning independently, checks builder isolation, proves explicit provider execution dispatch, proves unknown provider zero-network fail-closed behavior, and records the intentional non-Seller Seller-quota bypass.

`run_report_file_workflow_gate.mjs` now checks report-file planning metadata in addition to transport, host permissions, redaction, credential isolation and parsing.

`run_effect_read_repair_gate.mjs` now chains the provider-taxonomy regression so normal package certification cannot bypass it.

## Pre-fix proof

The final `run_provider_taxonomy_gate.mjs` was executed against old authority `51ab3fbeb97ac6a3fc693fd40a0a81d5d818ca0a` and failed as required. A separate exact reproduction on that same old authority confirmed `report_file_get` was assigned the incorrect reason `performance_provider_not_seller_subscription`.

Markers:

- `OZON_DEFECT_014_FINAL_REGRESSION_FAILS_ON_51AB_PASS`
- `OZON_DEFECT_014_OLD_WRONG_PERFORMANCE_REASON_REPRODUCED_PASS`

## Handoff rule

This file is the final clean-tree CI trigger. PRE-HANDOFF may pass only if the ordinary cross-platform package workflow is fully green on the final commit/tree and produces the exact artifact handed to the operator. Real installed-browser/Ozon confirmation remains `PENDING POST-INSTALL` until the operator installs that exact artifact.

Final clean-tree certification trigger after removal of all temporary patch/proof workflow/script files: 2026-09-04.
