# Codex tester instruction — Patch B0 Full Read Core

Role: **TESTER ONLY**. Do not edit production code, do not redesign, do not fix failures, do not rebuild another candidate.

Repository: `MaksimUnimax/blood_sand`
Branch to test: `feature/ozon-full-read-core-b0-2026-08-25`
Expected baseline lineage: exact A.5 production tree from commit `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`.
Transport-repair anchor: `e806f0eb947844678a21f59f00e6ec416f1a8545` (`fix(ozon): restore exact B0 transport chunk 005`).

Before testing, fetch the branch and record the actual branch HEAD. The tested HEAD must contain the transport-repair anchor in its history. Any commits after that anchor must remain validation/handoff-only; do not accept any unreviewed production-file mutation as part of this B0 browser test.

## 1. Materialize exact candidate

Run:

```text
python tooling/llm-api-bridges/ozon-seller/validation/materialize_patch_b0_full_read_core_candidate.py <repo-root> <fresh-output-dir>
```

Require **all** of these markers:

```text
PATCH_B0_A5_BASE_IDENTITY_PASS
PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS
PATCH_B0_PATCH_APPLY_PASS
PATCH_B0_PRODUCTION_FILE_COUNT_21_PASS
PATCH_B0_CHANGED_FILE_IDENTITIES_PASS
PATCH_B0_TREE_MANIFEST_SHA256_PASS
```

Expected production tree SHA-256:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

The materializer is fail-closed and checks the encoded transport length, compressed patch SHA-256, decompressed patch SHA-256, exact A.5 base identity, changed production-file identities, final file count and final production tree SHA-256.

**Do not run deterministic or browser tests if any materialization identity marker is missing or if materialization fails.** A materialization failure is validation/transport evidence; do not edit production code.

## 2. Deterministic regression

Run against the freshly materialized directory:

```text
node tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_REGRESSION_2026-08-25.mjs <fresh-output-dir>
```

Require:

```text
B0_REGISTRY_GUIDANCE_PASS
B0_PERSONAL_DATA_CONTRACT_PASS
B0_ENTITLEMENT_EXACT_REQUEST_PASS
B0_DYNAMIC_SWAGGER_COMPILER_PASS
B0_COMPATIBILITY_CLUSTER_ALIASES_PASS
B0_PROTECTED_A5_RUNTIME_IDENTITIES_PASS
B0_POLICY_BEFORE_CAPABILITY_PASS
```

Run `node --check` for every production `.js` file.

## 3. Browser acceptance — existing lifecycle first

Load only the exact materialized candidate as the unpacked extension.

Confirm existing A.5 behavior before B0-specific tests:

1. Start work in a supported ChatGPT Work conversation.
2. Hide/show Ozon button remains functional without sending startup prompt.
3. Finish preserves binding; inactive+bound can resume with `Показать кнопку` and does not send startup prompt.
4. No stale red `CONVERSATION_NOT_CONFIRMED` provider status appears from popup/runtime errors.
5. Do not test or modify Autorun internals; verify only that B0 did not introduce an obvious Autorun UI/state regression.

Any failure here => FAIL. Do not fix.

## 4. Guidance compatibility

### V1 alias compatibility

Send exactly:

```text
OZON_HELP_V1
{"cluster":"stock_inventory"}
```

Expected:

- local guidance only;
- zero external Ozon requests;
- canonical cluster is `stocks_inventory`;
- `stocks_current` is present.

Then:

```text
OZON_HELP_V1
{"cluster":"fulfillment_supply"}
```

Expected canonical cluster `supplies_fbo` and existing supply operations remain visible.

### V2 sections

Send:

```text
OZON_HELP_V2
{"cluster":"orders_postings"}
```

Expected section choices, including `fbs_postings`.

Then:

```text
OZON_HELP_V2
{"cluster":"orders_postings","section":"fbs_postings"}
```

Expected `posting_fbs_get` card marked conditional/personal-data gated.

## 5. Personal-data gate — OFF

Ensure popup setting `Показывать личные данные` is OFF.

Use a real valid FBS posting number available to the operator and submit exactly one valid command:

```text
OZON_API_V1
{"operation":"posting_fbs_get","params":{"posting_number":"<REAL_POSTING_NUMBER>"}}
```

Expected:

- zero Seller provider requests;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- result status `personal_data_setting_required`;
- error `OPERATION_DISABLED_BY_USER`;
- result tells AI/operator to enable `Показывать личные данные` and explicitly submit a new command;
- Manual returns READY;
- no quota/timing/cache mutation caused by the blocked attempt.

## 6. Personal-data gate — no replay

Turn `Показывать личные данные` ON.

Expected immediately after toggle:

- the previously blocked command is **not** executed automatically;
- no provider request appears merely because the checkbox changed.

## 7. Personal-data gate — ON

Explicitly submit the same valid `posting_fbs_get` command again.

Expected:

- exactly one fixed Seller request to `POST /v3/posting/fbs/get`;
- no arbitrary URL/method/header/auth fields accepted;
- result is delivered only to the bound conversation;
- authorized customer/recipient fields may appear in the delivered result because the operator enabled the setting;
- diagnostic log contains no raw customer payload values;
- after confirmed delivery, durable batch/outgoing payload is cleared by the existing completion path;
- no replay on any delivery retry/recovery path.

Also test invalid params locally:

- unknown top-level param under `params` => rejected before provider;
- unknown `with` field => rejected before provider;
- non-boolean `with` value => rejected before provider.

## 8. Premium exact-request preservation

Use a request known by current metadata to require a subscription the test account does not have, if the test account can demonstrate that condition.

Expected when Bridge knows the rule and subscription is insufficient:

- `SUBSCRIPTION_REQUIRED`;
- zero business requests;
- requested metrics/dimensions/sort/history are preserved in the logical command;
- Bridge does **not** remove restricted fields and send a reduced request.

Also execute an unrestricted analytics request and confirm it still works.

If exact subscription conditions cannot be reproduced in this browser/account environment, mark only this subcase `NOT_EXECUTED_ENVIRONMENT_ONLY`; do not fail the whole candidate solely for lack of the required subscription state. Deterministic regression must still PASS.

## 9. Seller API metadata update

Press `Обновить правила Ozon API`.

If official `docs.ozon.ru` is reachable from the browser extension environment:

- update must use only fixed official Seller Swagger source;
- response summary must report a plausible Seller operation count (>=400), rule count and unresolved count;
- no Seller/Performance business API request is executed by this action;
- provider quota/cache/history/work-session/credentials remain unchanged.

If Ozon docs redirects/anti-bot/network policy prevent the fetch:

- expected safe failure;
- popup states previous last-known-good snapshot is preserved;
- normal Bridge operations continue to use the previous snapshot;
- record `NOT_EXECUTED_ENVIRONMENT_ONLY` for successful-refresh case, but verify failure preservation behavior.

## 10. Result file

Write:

`tooling/llm-api-bridges/ozon-seller/validation/PATCH_B0_FULL_READ_CORE_CODEX_RESULT_2026-08-25.md`

Include:

- exact branch HEAD **before writing the result commit**;
- confirmation that the tested HEAD descends from transport-repair anchor `e806f0eb947844678a21f59f00e6ec416f1a8545`;
- materialized tree SHA-256;
- all six materializer markers, including `PATCH_B0_PATCH_TRANSPORT_IDENTITY_PASS`;
- all deterministic markers;
- browser/environment identity;
- each test case PASS / FAIL / NOT_EXECUTED_ENVIRONMENT_ONLY;
- exact observed request counts for OFF and ON personal-data tests;
- confirmation whether any automatic replay occurred;
- metadata-refresh result/failure evidence;
- final decision exactly one of:
  - `PATCH_B0_BROWSER_CANDIDATE_ACCEPTED`
  - `PATCH_B0_BROWSER_CANDIDATE_REJECTED`

If rejected, report evidence only. Do not modify production code.
