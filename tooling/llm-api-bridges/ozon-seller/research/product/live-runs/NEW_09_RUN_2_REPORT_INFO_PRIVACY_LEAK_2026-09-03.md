# NEW-09 Run2 — report_info PASS with privacy leak

Date: 2026-09-03
Operation: `report_info`
Source repaired alias: `report_realization_posting_create`
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Transport / planner result

- request id: `0ab507a4-3068-43f5-8a5d-54bdc3d09d55`
- HTTP: `200`
- physical business requests: `1`
- external request executed: `true`
- logical fingerprint: `604b53c9`
- physical fingerprint: `604b53c9`
- command transformed: `false`
- exact_request_preserved: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`

## Report result

- report code: `REPORT_finance_realization_posting_2093109_1788409408_01a06581-eacd-713e-b7b6-06a3e832b361`
- report status: `success`
- report type: `finance_realization_posting`
- provider file field: `[REDACTED]`
- opaque file ref: `rpf_daf0af28-8915-4ef5-9a27-d0d8f2562c95`

## New defect discovered — DEFECT-004

Classification:
`REPORT_INFO_ADDITIONAL_DATA_KEY_VALUE_PRIVACY_REDACTION_BYPASS`

The live `report_info` result included identifying receiver metadata inside `additional_data` while the operator's personal-data setting was OFF.

The sensitive values are **not** copied into this repository evidence. The persisted structural snapshot masks every `additional_data.value` to avoid compounding the disclosure.

Observed structure proving the bypass included key/value entries whose `key` values identify receiver identity/tax fields (for example `ReceiverName`, `ReceiverInn`, `ReceiverKpp`) while their neighboring `value` fields contained the actual unredacted data in the bridge output.

## Root-cause evidence from runtime

Current result redaction operates primarily on JSON field names/paths. For `report_info`, it explicitly redacts the provider `file` field. Generic sensitive-name matching is also based on the actual JSON object's property names.

In `additional_data`, however, the object properties are only `key` and `value`; the semantic sensitive field name is stored as the **value of `key`**, so a field-name-based redactor does not recognize the adjacent `value` as sensitive.

This is a Bridge privacy defect, not a provider rejection and not a test-data issue.

## Collection decision

- Promote as `DEFECT-004`.
- Do **not** patch now.
- Continue collection-first sweep.
- Next NEW-09 step remains an explicit `report_file_get` using the opaque ref, to determine whether DEFECT-001 also extends to `finance_realization_posting`.

## Privacy-safe RAW evidence

`live-runs/repaired-26/raw/NEW_09_RUN_2_REPORT_INFO_PRIVACY_LEAK_SANITIZED_RAW_2026-09-03.json`
