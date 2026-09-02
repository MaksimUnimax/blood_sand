# Ozon AI Worker — Privacy-safe FBS aggregation requirement

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Status: PRODUCT HARDENING REQUIREMENT / DO NOT IMPLEMENT DURING SOL BASELINE

## Trigger

STD-09 asks:
`Дай продажи за вчера по складам от большего к меньшему.`

FBO warehouse attribution is available on Standard through `posting_fbo_list` with `analytics_data` and does not require customer PII.

To reconcile the remaining non-FBO sales, the obvious FBS surface is `fbs_posting_list`.

STD-09 Run2 requested only:
- date range;
- `analytics_data=true`;
- `barcodes=false`;
- `financial_data=false`;
- `legal_info=false`.

Bridge blocked locally before any provider call because the whole operation is currently classified `PERSONAL_DATA_READ_GATED` / `operator_personal_data_gate` with personal-data setting off.

Observed Run2:
- request `policy-aa1a1038-9138-4ad9-9388-0a568e9c3ad8`;
- `external_request_executed=false`;
- physical business requests `0`;
- `POLICY_BLOCKED`;
- reason `personal_data_setting_off`;
- code `OPERATION_DISABLED_BY_USER`.

## Product problem

The user business question requires aggregate operational data:
- warehouse;
- products/SKUs;
- quantity;
- order amount/status.

It does not require customer name, phone, address, recipient data, legal details, digital codes or other PII.

Current operation-level privacy gating couples non-PII business analytics to broad permission for personal-data delivery into the AI chat.

This creates unnecessary operator friction and weak-model portability risk for normal business-analysis workflows.

## Requirement

`AGGREGATE_FBS_BUSINESS_ANALYTICS_SHOULD_NOT_REQUIRE_EXPOSING_CUSTOMER_PII_TO_AI`

Preferred future behavior:

1. Bridge offers a privacy-safe FBS business projection or aggregate operation for warehouse/product/order metrics.
2. PII is stripped before AI delivery by construction.
3. The privacy-safe projection does not require the broad personal-data setting when no PII field is requested or returned.
4. Full personal-data reads remain explicitly operator-gated.
5. One explicit AI command still causes at most one physical business request.
6. No hidden fallback from a blocked PII operation to another provider call.
7. Result metadata explicitly states which privacy projection was used.

Possible implementation shapes after baseline:
- dedicated `fbs_sales_by_warehouse` read projection built on provider response sanitation;
- safe mode for `fbs_posting_list` that whitelists only business fields;
- another verified Standard API surface that directly returns aggregate FBS warehouse sales.

## Benchmark implication

During current Sol baseline:
- do not patch Bridge;
- preserve the privacy block as operational evidence;
- if the operator explicitly enables the current personal-data setting, rerun the same logical FBS command and continue STD-09;
- record operator privacy intervention separately from business-reasoning quality.

## Checkpoint

`PRIVACY_SAFE_FBS_AGGREGATION_REQUIRED_CURRENT_OPERATION_LEVEL_GATE_TOO_COARSE_FOR_NON_PII_BUSINESS_ANALYTICS`
