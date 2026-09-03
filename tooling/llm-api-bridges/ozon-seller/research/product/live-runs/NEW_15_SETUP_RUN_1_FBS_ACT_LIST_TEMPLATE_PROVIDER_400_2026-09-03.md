# NEW-15 setup Run1 — fbs_act_list runtime-template provider 400

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Purpose

Obtain a real FBS act id for NEW-15 `posting_fbs_act_container_labels` without inventing identifiers.

## Submitted command

`OZON_API_V1 {"operation":"fbs_act_list","params":{"limit":50}}`

This matches the active operation-registry template for `fbs_act_list`.

## Result

- request id: `8ee3ff42-c8aa-4b98-9412-c73af369440b`
- HTTP: `400`
- provider error code: `3`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `937e3a3f`
- physical fingerprint: `937e3a3f`
- command transformed: `false`

## Runtime contract check

Active `normalizeFbsActListParams`:
- allows only top-level `filter` and `limit`;
- requires `limit` and permits up to 50;
- treats `filter` as optional;
- when filter is present it requires `date_from` and `date_to`, with optional `integration_type` and `status`.

Active registry advertises `fbs_act_list` template `{limit:50}`.

The provider rejected that bridge-valid, bridge-advertised form with HTTP400/code3.

## Judgment

`SETUP_FAIL_CONTRACT_TEMPLATE_MISMATCH`.

Open **DEFECT-006 — `FBS_ACT_LIST_TEMPLATE_OMITS_PROVIDER_REQUIRED_FILTER`**.

This is not classified as a generic provider outage because the bridge contract explicitly advertises and accepts a form that the provider rejects. Collection continues without patching. The exact failing request must not be automatically repeated.

## Next action

Use a materially different `fbs_act_list` request with an explicit completed-period filter containing `date_from` and `date_to`, after verifying the date representation. Persist the result before any NEW-15 document request.
