# Ozon Bridge v0.1.19 — V3 pre-freeze exact reconstruction engineering check

Date: 2026-08-18
Status: engineering reconstruction/check only; NOT independent acceptance and NOT a live-provider test.

# FULL STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project root:

`tooling/llm-api-bridges/ozon-seller/`

Repair development branch:

`dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18`

V3 implementation-candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Frozen production base that MUST be reconstructed first:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Read completely before execution:

- `development/live-repair-quota-countdown/REPAIR_SCOPE_2026-08-18.md`
- `development/live-repair-quota-countdown/PATCH_PARTS_V3.md`
- `development/live-repair-quota-countdown/REPAIR_V3_PACKAGING_CORRECTION_2026-08-18.md`
- `development/live-repair-quota-countdown/REPAIR_IMPLEMENTATION_AND_LOCAL_EVIDENCE_2026-08-18.md`
- V1 failed report from branch `engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18`, commit `f659739938dc87588411a5ff1f288a23cfec3c2e`
- V2 failed report from branch `engineering/ozon-live-repair-prefreeze-reconstruction-v2-2026-08-18`, commit `70cbaf4f105e2ec6b2a620235189e9c3630243af`
- accepted Step-4 implementation/evidence and accepted Step-4 independent validation report.

V1/V2 are negative packaging evidence only. They do not relax any gate. V1 concat and V2 concat are permanently superseded and MUST NOT be used.

The displayed V2 report base SHA contains a transcription typo. The only frozen base authority for this check is exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Do not modify production logic. Do not repair V3. Do not use fuzz. Do not manually edit an applied tree. Do not contact Ozon. Do not use real credentials. Do not promote a release.

## 1. Reconstruct exact frozen Step 4

Repeat the already accepted operator reconstruction lineage.

Operator baseline authority:

- pin `06bbed6649b11c6fd4b81b224ef41d8833ea267c`
- ZIP bytes `100320`
- ZIP SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
- exact production inventory: 17 files

Accepted patch concat SHA-256 values:

- Step 1: `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`
- Step 2: `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`
- Step 3: `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`
- Step 4: `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Before V3 application require exact `17/17` frozen hashes.

Required frozen hashes include:

- `service_worker.js` = `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js` = `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` = `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `shared/ozon_contract.js` = `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` = `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Use the full accepted Step-4 17-file inventory and require exact identity.

Required checkpoint:

`FROZEN_STEP4_RECONSTRUCTION_17_OF_17 = PASS`

Any mismatch => STOP with `PREFREEZE_V3_CHECK_FAILED`.

## 2. Verify raw V3 transport exactly

V3 parts and lexical order:

1. `development/live-repair-quota-countdown/patch-parts-v3/00.patch.part`
2. `development/live-repair-quota-countdown/patch-parts-v3/01.patch.part`
3. `development/live-repair-quota-countdown/patch-parts-v3/02.patch.part`
4. `development/live-repair-quota-countdown/patch-parts-v3/03.patch.part`

Expected part metadata:

- 00: bytes `4549`, SHA-256 `1290c5b5f0fe0801aed948776a2d22ef0a3fc49aada1fbad4ec2de7e146399c1`, Git blob `9f40efac96ccf403100a36cf99b19b0c683d29e0`
- 01: bytes `4599`, SHA-256 `5df178a8f3f5df16d2b331dff55a7e71a733d8019d68755034d3a3c97964e1cf`, Git blob `ebba55b2b7a69cfb84cc56b169f7f9bd56f0d0a6`
- 02: bytes `4552`, SHA-256 `70016e06881a4e3b09728d5f63ffdde3ca4e8bffca89cd74dc0d850843d7fc7e`, Git blob `a8519f1e294cf3c3902cd1ebc2007e25b5f5dede`
- 03: bytes `2817`, SHA-256 `4a79138663792bfea940658b7ac61c73efe7d49bc6a12869e10f6e2a8bb7c22c`, Git blob `cd64942fb79de623d9c5e40023bfcc5b39ffaa9b`

Expected concat:

- bytes `16517`
- SHA-256 `aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Expected parsed patch delta:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0
- exactly two production files represented.

Use raw Git blob bytes. Do not reconstruct V3 from Markdown rendering.

If any V3 raw byte/hash differs => STOP. Do not repair it.

## 3. Exact V3 apply to exact frozen full tree

Run standard `git apply --check` against the exact reconstructed frozen Step-4 full tree.

Forbidden:

- `--reject`
- fuzzing/manual context changes
- hand application
- alternate patch
- editing the target before or after apply to force success.

If `git apply --check` fails => STOP and report exact first failing hunk/context. Do not continue semantic tests.

If check passes, apply the exact V3 concat once.

Require after apply:

- exactly two production files differ: `service_worker.js`, `content_script.js`;
- all other fifteen production files byte-identical to frozen Step 4;
- manifest byte-identical;
- repaired `content_script.js` SHA-256 exactly `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- compute exact repaired `service_worker.js` SHA-256;
- compute all 17 post-repair production hashes.

## 4. Quota safety — actual repaired worker, mocked provider only

Prove behavior from the actual V3-applied production worker:

- family remains exactly `seller.analytics_data.v1`;
- nominal `min_interval_ms` remains exactly `60000`;
- fixed bridge-owned `bridge_launch_safety_ms` is exactly `5000`;
- effective interval is exactly `65000`;
- first real-attempt reservation records not-before `T+65000`;
- at `T+60001` same-account analytics remains denied/waiting;
- at `T+64999` it remains denied/waiting;
- at `T+65000` it may acquire exactly one slot;
- old persisted state with `last_provider_request_at=T` and stale `next_allowed_at=T+60000` is guarded to at least `T+65000`;
- different Seller account remains independent;
- cache hit still occurs before quota and consumes zero quota/provider call;
- a shorter usable Retry-After cannot shorten the guarded boundary;
- a longer usable Retry-After extends it;
- provider 429/error produces zero automatic retry/replay;
- no hidden pagination/fanout/report polling is introduced.

The 5000 ms value is an internal bridge safety margin motivated by rejected live evidence. Do NOT describe it as an Ozon-documented quota.

## 5. Safe public quota-wait state

Exercise actual repaired public manual/autorun state paths.

When a batch is durably `quota_waiting`, public state must contain only safe wait metadata needed by UI:

- family;
- nominal interval 60000;
- bridge safety 5000;
- effective interval 65000;
- `next_allowed_at`;
- queue index;
- waiting timestamp;
- `automatic_retry=false`.

It MUST NOT expose:

- Client-Id;
- Api-Key;
- full or truncated account hash;
- credential revision;
- credential scope id;
- arbitrary auth/header data.

When not `quota_waiting`, public `quota_wait` must be null.

## 6. Countdown/browser behavior

Use the actual V3-applied production `content_script.js` in the accepted synthetic Chrome for Testing/Puppeteer route. No operator normal-profile automation and no provider request.

Prove:

1. Bound Manual mode structural Ozon button exists independently of native Copy.
2. Admit one mocked manual batch.
3. Worker public state transitions into future durable `quota_waiting`.
4. Within the local discovery window, an extension-owned plate appears containing:
   - `Ожидание лимита Ozon`
   - `Ограничение частоты запросов Ozon.`
   - `Следующий запрос через MM:SS.`
   - `Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`
   - `Следующая попытка: HH:MM:SS`
5. Countdown decreases locally using `Date.now()`.
6. Countdown ticks/runtime-state probes create zero provider/network request.
7. At/after due, plate says `Лимит Ozon снят — отправляем запрос…` until completion state arrives.
8. Ozon execution control remains busy/disabled while operation active; duplicate click cannot admit a second batch.
9. Content runtime restart/re-sync reconstructs countdown from durable `next_allowed_at`.
10. Two independent tabs/conversations with different waits render independent due times; no global-current-conversation overwrite.
11. ChatGPT structural binding remains PASS.
12. Alice structural binding remains PASS.
13. Native Copy remains independent.

## 7. Regression/static gates

Require:

- all production JS `node --check` PASS;
- manifest JSON parse PASS;
- `git diff --check` PASS;
- manifest permissions and host permissions byte-identical to frozen Step 4;
- no drift in `shared/ozon_contract.js`, `shared/runtime_names.js`, `shared/ozon_provider.js`, `shared/provider_transport_core.js`, adapters or composer code;
- accepted Step-1 capability checks PASS;
- accepted Step-2 query/coalescing/projection checks PASS;
- accepted Step-3 persistent quota/no-retry/Retry-After/recovery/verifier checks PASS under the new guarded due boundary;
- accepted Step-4 cache/prefetch/cache-hit-before-quota checks PASS;
- protected delivery FSM checks PASS;
- `REAL_OZON_REQUESTS = 0`.

## 8. Publication discipline

Create engineering report branch from exact V3 candidate checkpoint:

`engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18`

Base commit:

`88a20984c55da1f813ca1184bd90089823f51883`

Create exactly one file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_RECONSTRUCTION_V3_REPORT_2026-08-18.md`

The engineering branch must be exactly one report-only commit ahead of `88a20984...` and must not contain source/patch fixes.

Commit message:

`test: check Ozon live repair V3 prefreeze reconstruction`

Push report branch and STOP.

## 9. Verdict

Only:

`PREFREEZE_V3_CHECK_PASS`

or

`PREFREEZE_V3_CHECK_FAILED`

This is not independent release acceptance and not final live acceptance.

## 10. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

reconstruction:
  frozen_step4_17_of_17: PASS|FAIL
  repair_v3_raw_parts: PASS|FAIL
  repair_v3_concat: PASS|FAIL
  patch_apply: PASS|FAIL
  changed_files_exactly_2: PASS|FAIL|UNPROVEN
  protected_15_byte_identical: PASS|FAIL|UNPROVEN

post_repair_hashes:
  service_worker_sha256: <sha or NONE>
  content_script_sha256: <sha or NONE>

quota_guard:
  nominal_60000: PASS|FAIL|UNPROVEN
  bridge_safety_5000: PASS|FAIL|UNPROVEN
  effective_65000: PASS|FAIL|UNPROVEN
  migration_guard: PASS|FAIL|UNPROVEN
  different_account_independent: PASS|FAIL|UNPROVEN
  cache_hit_before_quota: PASS|FAIL|UNPROVEN
  retry_after_extension_only: PASS|FAIL|UNPROVEN
  zero_auto_retry: PASS|FAIL|UNPROVEN

countdown:
  visible_wait_plate: PASS|FAIL|UNPROVEN
  live_mm_ss_decrement: PASS|FAIL|UNPROVEN
  absolute_due_clock: PASS|FAIL|UNPROVEN
  due_sending_state: PASS|FAIL|UNPROVEN
  restart_restore: PASS|FAIL|UNPROVEN
  duplicate_click_blocked: PASS|FAIL|UNPROVEN
  multi_tab_owner_scoped: PASS|FAIL|UNPROVEN
  chatgpt_alice_binding_regression: PASS|FAIL|UNPROVEN

security:
  public_wait_privacy: PASS|FAIL|UNPROVEN
  provider_surface_unchanged: PASS|FAIL|UNPROVEN

real_ozon_requests:
  0

report_branch:
  engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3_CHECK_PASS|PREFREEZE_V3_CHECK_FAILED

After publishing: STOP. Wait for ChatGPT to review live GitHub before any freeze.