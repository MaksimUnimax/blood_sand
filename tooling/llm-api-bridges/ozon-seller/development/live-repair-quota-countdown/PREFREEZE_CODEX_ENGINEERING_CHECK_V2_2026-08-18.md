# Ozon Bridge v0.1.19 — V2 pre-freeze exact reconstruction engineering check

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

V2 implementation-candidate checkpoint:

`df8e0a898cfa19d9eb66de19280a6b1b8bbbe0c7`

Frozen production base that MUST be reconstructed first:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Read completely before execution:

- `development/live-repair-quota-countdown/REPAIR_SCOPE_2026-08-18.md`
- `development/live-repair-quota-countdown/PATCH_PARTS.md`
- `development/live-repair-quota-countdown/REPAIR_IMPLEMENTATION_AND_LOCAL_EVIDENCE_2026-08-18.md`
- `development/live-repair-quota-countdown/REPAIR_V2_CONTEXT_CORRECTION_2026-08-18.md`
- prior failed report `development/live-repair-quota-countdown/PREFREEZE_RECONSTRUCTION_REPORT_2026-08-18.md` from branch `engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18`, commit `f659739938dc87588411a5ff1f288a23cfec3c2e`
- accepted Step-4 implementation/evidence and Step-4 independent validation report.

The prior V1 report is failure evidence, not an authority to relax any gate. It proved frozen Step-4 reconstruction `17/17` and exposed a stale first-hunk context. V1 concat `b30a91128fbb...` is permanently superseded.

You are acting as a pre-freeze engineering reconstruction helper, not as the later independent acceptance validator.

Do not modify production logic. Do not repair V2. Do not use patch fuzz as a substitute for exact application. Do not contact Ozon. Do not use real credentials. Do not promote a release.

## 1. Reconstruct exact frozen Step 4

Repeat the accepted reconstruction lineage from exact operator baseline plus accepted Step1/2/3/4 raw Git patch bytes.

Operator baseline authority:

- pin `06bbed6649b11c6fd4b81b224ef41d8833ea267c`
- ZIP bytes `100320`
- ZIP SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`
- exactly 17 production files.

Accepted concat SHA-256 values:

- Step 1 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`
- Step 2 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`
- Step 3 `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`
- Step 4 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`

Require full accepted frozen Step-4 17-file inventory, including:

- `service_worker.js` `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js` `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` `6e314da445166d390a32f3f3afdfdf86a97e2af6eeed0c3cd4a47d34d60550da`
- `shared/ozon_contract.js` `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`.

Required:

`FROZEN_STEP4_RECONSTRUCTION_17_OF_17 = PASS`

Any mismatch => STOP with `PREFREEZE_V2_CHECK_FAILED`.

## 2. Verify V2 raw repair transport

Lexical concat order:

- `patch-parts/00.patch.part`
- `patch-parts/01.patch.part`
- `patch-parts/02.patch.part`

Expected V2 raw metadata:

- 00: bytes `4846`, SHA-256 `0163659825c2a20cd51bda19bf851746fc7bc1e0f0d888b92c4b9e551328d232`, Git blob `2a56745a2e9c4870e9bea4212254d28d14810928`
- 01: bytes `4775`, SHA-256 `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0`, Git blob `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8`
- 02: bytes `2851`, SHA-256 `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0`, Git blob `3248494436d109174e02f7eb309cc66be37014f2`

Expected V2 concat:

- bytes `12472`
- SHA-256 `8333f70403fb8bd4d1b81900ab6e16110633f68290e0d88db0fd164507810e7d`

Require raw Git bytes.

Prove V2 versus V1 semantic delta is context-only:

- parts 01/02 byte-identical to V1;
- in part 00 the added production lines are unchanged from V1;
- the only V1→V2 modification is first-hunk context/header required to retain the already accepted Step-4 cache constants;
- V2 does not modify either cache constant.

## 3. Exact patch application

From the exact 17/17 frozen Step-4 reconstruction:

1. run exact patch syntax check;
2. run `git apply --check` with no fuzz/manual repair;
3. apply V2 exactly once.

Required PASS:

- V2 patch applies cleanly;
- exactly two production files differ: `service_worker.js`, `content_script.js`;
- protected other fifteen files are byte-identical to frozen Step 4;
- manifest is byte-identical;
- repaired `content_script.js` SHA-256 is exactly `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- compute exact repaired `service_worker.js` SHA-256;
- compute and include all 17 post-repair production hashes in the report.

If exact apply fails, STOP. Do not edit V2.

## 4. Actual repaired quota behavior — mocked only

Exercise actual repaired worker code with mocked storage/credentials/provider.

Prove:

- family remains `seller.analytics_data.v1`;
- nominal `min_interval_ms = 60000`;
- `bridge_launch_safety_ms = 5000`;
- effective interval `65000`;
- first real-attempt reservation stores not-before +65000;
- same account at T+60001 denied;
- T+64999 denied;
- T+65000 allowed exactly one slot;
- persisted legacy state with `last_provider_request_at=T` and stale `next_allowed_at=T+60000` is guarded to at least T+65000;
- different Seller account remains independent;
- cache hit still occurs before quota and consumes zero quota/provider request;
- Retry-After smaller than guarded boundary cannot shorten it;
- larger usable Retry-After extends it;
- 429/provider error yields no automatic retry/replay;
- no hidden pagination/fanout/report polling.

State explicitly: 5000 ms is an internal bridge safety guard motivated by rejected live evidence; it is NOT claimed to be Ozon-documented endpoint quota.

## 5. Public wait privacy

Exercise actual public manual and autorun state paths.

During durable `quota_waiting`, safe public wait must contain only safe timing/status fields including family, 60000 nominal, 5000 guard, 65000 effective, `next_allowed_at`, queue index, waiting timestamp, `automatic_retry=false`.

It MUST NOT expose Client-Id, Api-Key, full/partial account hash, credential revision, or credential scope id.

Outside `quota_waiting`, public `quota_wait` must be null.

## 6. Countdown/browser behavior

Use actual repaired production `content_script.js` in the accepted synthetic browser/DOM harness. No operator normal profile and no provider network.

Prove:

- bound Manual structural Ozon button works with native Copy remaining independent;
- one manual batch is admitted;
- mocked worker state enters durable `quota_waiting` with future `next_allowed_at`;
- extension-owned status plate appears with:
  - `Ожидание лимита Ozon`
  - `Ограничение частоты запросов Ozon.`
  - `Следующий запрос через MM:SS.`
  - `Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`
  - `Следующая попытка: HH:MM:SS`;
- countdown decreases locally from `Date.now()`;
- local countdown/probe creates zero Ozon/provider request;
- at/after due text changes to `Лимит Ozon снят — отправляем запрос…`;
- execution control remains busy/disabled while operation active;
- repeated click cannot admit a duplicate;
- content runtime restart/re-sync reconstructs same plate from durable state;
- two independent tabs/conversations retain independent due times;
- ChatGPT and Alice structural binding regressions PASS.

## 7. Regression/static checks

Require:

- all 17 production JS syntax checks PASS;
- manifest parse PASS;
- `git diff --check` PASS;
- permissions/host permissions byte-identical;
- no drift in provider, contract, runtime-names, adapters, composer, transport or other protected fifteen files;
- Step-1 capability regression PASS;
- Step-2 planner/coalescing/projection regression PASS;
- Step-3 durable quota/no-retry/Retry-After regression PASS;
- Step-4 cache/prefetch/cache-hit-before-quota regression PASS;
- protected ChatGPT delivery FSM/Alice separation PASS;
- `REAL_OZON_REQUESTS = 0`.

## 8. Publication discipline

Create branch from exact V2 checkpoint:

`engineering/ozon-live-repair-prefreeze-reconstruction-v2-2026-08-18`

Base:

`df8e0a898cfa19d9eb66de19280a6b1b8bbbe0c7`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_RECONSTRUCTION_V2_REPORT_2026-08-18.md`

The branch must be exactly one report-only commit ahead of the V2 checkpoint, merge base exact checkpoint, behind 0.

Commit message:

`test: check Ozon live repair V2 prefreeze reconstruction`

Do not merge. Push and STOP.

## 9. Verdict

Only:

`PREFREEZE_V2_CHECK_PASS`

or

`PREFREEZE_V2_CHECK_FAILED`

This verdict is not independent acceptance, not live acceptance and not release promotion.

## 10. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V2_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  df8e0a898cfa19d9eb66de19280a6b1b8bbbe0c7

reconstruction:
  frozen_step4_17_of_17: PASS|FAIL
  repair_v2_raw_parts: PASS|FAIL
  repair_v2_concat: PASS|FAIL
  v1_to_v2_context_only: PASS|FAIL
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
  engineering/ozon-live-repair-prefreeze-reconstruction-v2-2026-08-18

report_commit:
  <sha or NONE>

verdict:
  PREFREEZE_V2_CHECK_PASS|PREFREEZE_V2_CHECK_FAILED

After publication: STOP and wait for ChatGPT live-GitHub review before any freeze.