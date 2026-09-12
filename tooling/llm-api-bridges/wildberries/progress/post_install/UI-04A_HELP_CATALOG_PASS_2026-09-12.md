# UI-04A — installed WB 0.2.1 local HELP catalog

Date: 2026-09-12.
Source: operator-provided result from the installed `wildberries-llm-api-bridge` 0.2.1.
Status: **PASS**.

## Command under test

`WB_HELP_V1` → `catalog`, `offset=0`, `limit=5`.

## Observed result

- Bridge version: `0.2.1`.
- Batch status: `completed`.
- Item kind: `help`.
- Item state: `success`.
- Logical command count: `1`.
- Physical request count: `0`.
- Physical request count min/max: `0/0`.
- `external_request_executed=false`.
- `automatic_retry=false`.
- `local=true`.
- `no_hidden_calls=true`.
- Packaged registry: `188` total, `172` enabled, `16` disabled.
- Authority label: `PACKAGED_WB_REGISTRY_SNAPSHOT_NOT_LIVE_ACCOUNT_PROOF`.
- Returned first five registry operations and `next_offset=5`.
- `account_access=UNVERIFIED_REAL_ACCOUNT` on returned operation cards; this test therefore does not claim live-account entitlement/currentness.

## Acceptance

This proves the installed extension can execute the first local HELP catalog test without any WB provider request and reports the expected packaged registry counts. It does **not** prove the remaining UI-04 describe cases, popup UI, live WB access, or any R1–R8 provider characterization.

Next: run UI-04B `describe cards_list`, then UI-04C `describe subscriptions`.
