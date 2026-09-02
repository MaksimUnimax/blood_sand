# Ozon AI Worker — READ classification re-audit

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Trigger: reopened STD-10 historical incident investigation.

## Correct governing criterion

For this project, an operation is eligible for the AI READ surface when it does **not change seller/Ozon business/account data or business process state**. The fact that a provider operation generates a report, document, PDF, PNG, label, act, validation result or an asynchronous read artifact/job is not by itself a mutation.

Personal/sensitive data remains governed by the existing Personal Data gate; sensitivity is not a reason to remove a genuine READ from coverage.

Therefore the final Seller terminal matrix rule that grouped all `business state, job, artifact, draft, label, report, or validated bundle` into `REJECT_SERVER_SIDE_GENERATION_OR_CREATION` is overbroad and must be re-audited operation-by-operation.

## Matrix audited

- exact Seller universe: 463 operations;
- current terminal split in the audited matrix:
  - `ACCEPTED_IMPLEMENTED_READ`: 245;
  - `REJECT_MUTATION_SIDE_EFFECT`: 129;
  - `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`: 63;
  - sunset: 12;
  - deprecated: 12;
  - sensitive unstructured: 1;
  - external-effect control: 1.

## Confirmed wrongly excluded current READ operations — 26

### A. Report generation / report-read workflows — 9

1. `POST /v1/report/products/create` — report by products.
2. `POST /v2/report/returns/create` — returns report.
3. `POST /v1/report/postings/create` — postings report.
4. `POST /v1/report/discounted/create` — discounted-goods report.
5. `POST /v1/report/warehouse/stock` — FBS warehouse stock report.
6. `POST /v1/report/placement/by-products/create` — FBO placement-cost report by products.
7. `POST /v1/report/placement/by-supplies/create` — FBO placement-cost report by supplies.
8. `POST /v1/report/marked-products-sales/create` — marked-products sales report.
9. `POST /v1/report/realization/posting/create` — order-level realization report.

These generate report data/artifacts and do not change seller catalog, price, stock, order, supply, advertising or account business state.

### B. Finance report/document reads — 4

10. `POST /v1/finance/document-b2b-sales` — B2B sales registry.
11. `POST /v1/finance/mutual-settlement` — mutual settlement report.
12. `POST /v1/finance/compensation` — compensation report.
13. `POST /v1/finance/decompensation` — decompensation report.

These are provider-described financial reports/documents, not finance mutations.

### C. PDF/label/document generation workflows — 9

14. `POST /v1/cargoes-label/create` — generate cargo-place labels.
15. `POST /v2/posting/fbs/act/get-container-labels` — cargo-place labels.
16. `POST /v2/posting/fbs/package-label` — generate/return PDF package labels.
17. `POST /v2/posting/fbs/package-label/create` — start asynchronous package-label generation.
18. `POST /v1/cargoes/label/transport-by-order/create` — generate transport-cargo labels by supply order.
19. `POST /v1/cargoes/label/transport/create` — generate transport-cargo labels by cargo id.
20. `POST /v1/fbp/act-from/create` — generate acceptance act.
21. `POST /v1/fbp/act-to/create` — generate transport waybill.
22. `POST /v1/fbp/label/create` — start label generation.

Starting an asynchronous artifact-generation job remains a READ workflow when the job only computes/produces requested data/document output and does not mutate the seller's business state.

### D. Pure validation reads — 3

23. `POST /v1/fbp/draft/direct/product/validate` — validate products for partner warehouse.
24. `POST /v1/fbp/draft/drop-off/product/validate` — validate products accepted by partner warehouse.
25. `POST /v1/fbp/draft/pick-up/product/validate` — validate products for pick-up supply.

Validation is computation over supplied/current data; it does not itself create or edit a draft/order/supply.

### E. Sensitive READ wrongly removed instead of gated — 1

26. `POST /v3/chat/history` — chat history.

This is a genuine READ. If its response contains personal/sensitive customer content, it belongs behind the existing operator Personal Data gate / safe projection policy rather than being removed from read coverage solely because the content is unstructured/sensitive.

## Confirmed examples that remain non-READ

The re-audit does **not** promote operations merely because their path contains `create` or `generate`. Examples that really change business state and remain excluded:
- `/v3/product/import`, `/v1/product/import-by-sku` — create/update products;
- `/v1/barcode/add` — attach barcode to product;
- `/v1/barcode/generate` — creates barcode for product and persists the result rather than merely returning a document;
- pricing strategy creation;
- pass/driver/car data creation;
- supply drafts/orders and cargo-place assignment;
- carriage creation;
- return barcode reset (invalidates old barcode);
- invoice create/update;
- review comment / question answer creation;
- certificate creation;
- warehouse creation;
- seller promotion creation;
- chat start;
- order create.

The old `REJECT_SERVER_SIDE_GENERATION_OR_CREATION` bucket therefore mixed genuine mutations with passive computation/artifact generation and cannot remain an authority without a full reclassification.

## Additional candidate requiring a separate explicit policy decision

`POST /v1/notification/check` checks a notification URL and can cause an outbound callback to an external URL. It does not look like a persisted seller-business-state mutation, but it has an external active effect. It is **not included in the confirmed 26** until the project's effect policy explicitly decides whether non-persistent external probes belong in the READ surface.

## Consequences

1. The previously accepted `245 Seller reads / 218 unavailable` split is no longer trustworthy under the corrected governing criterion.
2. At least **26 current operations** must be reclassified into the admissible READ surface before claiming exhaustive read coverage.
3. The exact final read count must be recomputed after the full 463-row effect re-audit; do not simply assume `245 + 26` is final because the remaining external-effect candidate and any other semantic edge cases still require review.
4. STD-10 must treat `POST /v1/report/placement/by-products/create` as a missing required READ workflow in the current executable Bridge and not as an intentional read-only boundary.
5. Under `NO_SKIP_ON_FAILURE`, do not declare the incident historical-baseline limitation terminal until the read-classification defect and required report workflow are addressed.

Checkpoint:
`READ_CLASSIFICATION_REAUDIT_CONFIRMED_AT_LEAST_26_FALSE_NEGATIVE_READS_FULL_463_EFFECT_REAUDIT_REQUIRED`
