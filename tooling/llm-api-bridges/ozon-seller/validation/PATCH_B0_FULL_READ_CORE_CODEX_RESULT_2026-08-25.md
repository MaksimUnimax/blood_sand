# Patch B0 Full Read Core — independent retest with Node identity fallback

## Tested authority and candidate

- Branch: `feature/ozon-full-read-core-b0-2026-08-25`
- Exact tested HEAD before this result commit: `a48e06b331bb959856808aff0b8697cb9834807c`
- Candidate acquisition: Node-verified existing exact candidate.
- Candidate path: `D:\codex\Test\ozon-b0-retest2-candidate-20260825`
- Production tree SHA-256: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- No production candidate file, B0 patch byte, transport chunk, or production authority changed after the original materialization.

The current-run Node verifier emitted:

- `B0_NODE_PRODUCTION_FILE_COUNT_21_PASS`
- `B0_NODE_CHANGED_FILE_IDENTITIES_PASS`
- `B0_NODE_TREE_MANIFEST_SHA256_PASS`

Python was unavailable in this Windows session, so no Python materializer marker is claimed for this run.

## Deterministic and syntax gates

Regression syntax command: PASS.

```text
node --check tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs
```

Exact regression command against the verified candidate: PASS.

- `B0_REGISTRY_GUIDANCE_PASS`
- `B0_PERSONAL_DATA_CONTRACT_PASS`
- `B0_ENTITLEMENT_EXACT_REQUEST_PASS`
- `B0_DYNAMIC_SWAGGER_COMPILER_PASS`
- `B0_COMPATIBILITY_CLUSTER_ALIASES_PASS`
- `B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS`
- `B0_POLICY_BEFORE_CAPABILITY_PASS`

All materialized production JavaScript files passed syntax checking: `ALL_PRODUCTION_JS_SYNTAX_PASS files=18`.

## Browser matrix

Environment: Chrome for Testing `151.0.7922.47`, Puppeteer `25.4.0`, temporary profile per scenario, exact unpacked candidate, direct extension runtime/CDP transport, and temporary synthetic ChatGPT Work DOM. Seller/Performance endpoints were intercepted in the extension worker; no operator profile, real credential, or real provider request was used.

### A.5 lifecycle: PASS

- Start sent exactly one startup prompt.
- Hide, Show, Finish, inactive+bound Resume all returned successful worker responses.
- Resume restored `active_visible` and sent no additional startup prompt.
- No `CONVERSATION_NOT_CONFIRMED` status appeared.
- No provider request occurred; no B0 Autorun surface regression was observed.

### Guidance V1/V2: PASS

- `stock_inventory` resolved to `stocks_inventory`; `stocks_current` present; provider requests `0`.
- `fulfillment_supply` resolved to `supplies_fbo`; provider requests `0`.
- V2 `orders_postings` returned sections; `fbs_postings` returned conditional `posting_fbs_get` card; provider requests `0`.

### Personal Data OFF and no replay: PASS

In a fresh READY session with the setting OFF, valid `posting_fbs_get` yielded:

- `external_request_executed=false`
- `physical_business_request_count=0`
- `status=personal_data_setting_required`
- `error=OPERATION_DISABLED_BY_USER`
- Manual returned READY; Seller provider requests `0`.

After enabling the setting, the previously blocked command did not replay and provider requests remained `0`.

### Personal Data ON explicit resubmit / privacy: PASS

In a separate fresh session, explicit resubmit made exactly one synthetic intercepted Seller business request:

```text
POST https://api-seller.ozon.ru/v3/posting/fbs/get
{"posting_number":"SYNTHETIC-POSTING"}
```

No caller-supplied URL, method, header, or auth override was accepted. Diagnostics did not contain the synthetic customer/recipient sentinels. The successful confirmed-delivery path cleared the durable outgoing personal payload and did not replay.

### Invalid parameters: PASS

Each was run in a separate fresh session and rejected locally before any provider request:

- unknown top-level parameter;
- unknown `with` field;
- non-boolean `with` value.

### Premium / unrestricted analytics

- Premium insufficient-subscription preservation: `NOT_EXECUTED_ENVIRONMENT_ONLY`; no authenticated account with a known insufficient subscription was available.
- Unrestricted analytics: `NOT_EXECUTED_ENVIRONMENT_ONLY`. The synthetic credential fixture reached the normal fixed `POST /v1/seller/info` capability probe but cannot establish a genuine authenticated Seller entitlement; no `/v1/analytics/data` business request was sent. This is not a production assertion failure.

### Metadata refresh: PASS

The fixed official metadata fetch was deliberately intercepted as unavailable. The extension returned `SELLER_METADATA_FETCH_FAILED`, preserved the last-known-good snapshot, and caused `0` Seller/Performance business requests. Quota, cache, history, work-session, and credentials were unchanged by this action.

## Integrity

- REAL_OZON_SELLER_REQUESTS: `0`
- REAL_PERFORMANCE_REQUESTS: `0`
- Automatic replay observed: `no`
- Production code modifications by tester: `0`
- Candidate rebuild/repackage: `0`

Final decision: `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`
