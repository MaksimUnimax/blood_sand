# Ozon Bridge v0.1.19 — owner live API acceptance

## Result

`PASS — API_ONLY_POSTRELEASE_OWNER_LIVE_ACCEPTANCE`

This record supplements, but does not replace, the automated Step 7–10 acceptance chain.

## Release under test

- Release commit: `9cb1017b9ea234c2f4002f360db62502176f98b2`
- Installable ZIP: `OZON_BRIDGE_v0.1.19_FULL_READ_266_INSTALLABLE.zip`
- ZIP SHA-256: `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`
- ZIP bytes: `1,146,084`

## Owner-browser coverage

- Existing Seller regression smoke: `stocks_current` — HTTP 200.
- Existing Seller helper: `assembly_fbs_posting_list` — HTTP 200.
- New Seller read aliases exercised: `26/26`.
- New Seller read aliases dispatched to the provider when authorized: `26/26`.
- New-operation outcomes: `9 HTTP 200`, `13 HTTP 403 permission`, `4 HTTP 400 test fixture or missing entity`.
- No remaining routing, registry, request-builder, privacy-gate, retry, pagination, or fan-out diagnostic blocker.

Provider responses `403` and the four fixture-dependent `400` responses are preserved as live provider outcomes, not converted into false Bridge failures.

## Privacy gate

Personal Data OFF:

- `13/13` guarded aliases recognized.
- `13/13` blocked before provider dispatch.
- Physical business requests: `0`.
- Error code: `OPERATION_DISABLED_BY_USER`.
- Error stage: `personal_data_policy`.

Explicit authorized resubmit:

- Explicit commands: `13`.
- Physical business requests: `13`.
- External request executed: `13/13`.
- Automatic retries: `0`.

## Accounting

- Owner-submitted commands: `42`.
- Policy-blocked commands: `13`.
- Provider-planned logical business commands: `29`.
- Physical business requests: `29`.
- Capability probes: `0`.
- Invariant: one explicit command produced at most one physical business request.

## Non-blocking optional diagnostics

The following are not release blockers and require suitable account entities for a business-semantic HTTP 200 result:

- `rfbs_returns_get` with a real `return_id`.
- `fbp_archive_list` when matching FBP archives exist.
- `fbp_draft_list` when matching FBP drafts exist.
- `fbp_order_list` when matching FBP orders exist.

## Markers

```text
OZON_FULL_READ_266_OWNER_LIVE_API_SCOPE_PASS
OZON_FULL_READ_266_PRIVACY_OFF_ZERO_REQUEST_PASS
OZON_FULL_READ_266_AUTHORIZED_13_ONE_REQUEST_EACH_PASS
OZON_FULL_READ_266_OWNER_LIVE_ACCEPTED
```
