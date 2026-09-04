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
7. provider execution dispatch in `ozon_provider.js`;
8. Seller quota bypass for non-Seller providers in `service_worker.js`;
9. credential selection / isolation;
10. report-file provenance and personal-data policy;
11. report-file trusted-host transport and parsing;
12. user-visible planning/execution metadata;
13. report-file workflow tests and the package effect-repair gate.

## Repair boundary

Executable change is limited to `dist-step7-candidate/shared/ozon_contract.js`:

- `performance_api` keeps the Performance-specific entitlement reason;
- `report_file` receives a report-file-specific reason;
- `seller_api` keeps Seller entitlement evaluation;
- unknown provider categories fail closed;
- wrong request-builder errors identify the actual provider;
- binary response-style validation no longer treats every non-Seller provider as Performance.

`ozon_provider.js`, `service_worker.js`, credentials, transport, storage, manifest, report parser, personal-data policy, and Ozon request schemas are not changed by DEFECT-014.

## Permanent regression coverage

`run_provider_taxonomy_gate.mjs` proves all three provider categories explicitly, checks report-file/Performance/Seller planning independently, checks builder isolation, and rejects an unknown future provider.

`run_report_file_workflow_gate.mjs` now checks report-file planning metadata in addition to transport, host permissions, redaction, credential isolation and parsing.

`run_effect_read_repair_gate.mjs` now chains the provider-taxonomy regression so normal package certification cannot bypass it.

## Handoff rule

This file is the final clean-tree CI trigger. PRE-HANDOFF may pass only if the ordinary cross-platform package workflow is fully green on the final commit/tree and produces the exact artifact handed to the operator. Real installed-browser/Ozon confirmation remains `PENDING POST-INSTALL` until the operator installs that exact artifact.
