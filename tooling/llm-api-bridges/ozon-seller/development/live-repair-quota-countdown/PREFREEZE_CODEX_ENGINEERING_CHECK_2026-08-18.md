# Ozon Bridge v0.1.19 — pre-freeze exact reconstruction engineering check

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

Implementation-candidate checkpoint before this plan:

`ae64d944c90eac70be6cf88784b822a281dca3c5`

Frozen production base that MUST be reconstructed first:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Rejected live report authority:

- branch `validation/ozon-final-live-acceptance-2026-08-18`
- report commit `888b12a`
- verdict `FINAL_LIVE_REJECTED`

This run exists only because ChatGPT's current local runtime no longer contains the full reconstructed Step-4 service worker. You are acting as a pre-freeze engineering reconstruction helper, not as the later independent acceptance validator.

Do not modify production logic. Do not repair the patch. Do not contact Ozon. Do not use real credentials. Do not promote a release.

## 1. Read live GitHub authority first

Read completely from live GitHub:

- `development/live-repair-quota-countdown/REPAIR_SCOPE_2026-08-18.md`
- `development/live-repair-quota-countdown/PATCH_PARTS.md`
- `development/live-repair-quota-countdown/REPAIR_IMPLEMENTATION_AND_LOCAL_EVIDENCE_2026-08-18.md`
- accepted Step-4 patch manifest/evidence and Step-4 independent validation report;
- accepted Step-1/2/3 patch manifests needed for reconstruction.

Confirm the repair branch candidate checkpoint is descended from exact Step-4 target `4ce190c8...` and that production bytes are represented only by the repair patch artifacts; no direct production-source mutation is authorized in GitHub.

## 2. Reconstruct exact frozen Step 4

Repeat the already accepted reconstruction lineage used by Step-4 validation.

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

Before applying the repair, prove the reconstructed Step-4 candidate is exact.

Required frozen hashes include:

- `service_worker.js` = `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `content_script.js` = `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `shared/ozon_contract.js` = `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` = `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

Use the full accepted 17-file hash inventory from Step-4 evidence/report and require 17/17 exact.

Required checkpoint:

`FROZEN_STEP4_RECONSTRUCTION_17_OF_17 = PASS`

Any mismatch => STOP with `PREFREEZE_CHECK_FAILED`.

## 3. Verify repair patch raw transport

Repair concat order:

- `patch-parts/00.patch.part`
- `patch-parts/01.patch.part`
- `patch-parts/02.patch.part`

Expected raw part metadata:

- 00: bytes `4755`, SHA-256 `e41635878f52c5c880daae0fb6539f72d93d395cbac888dc258a08e2436ff0bf`, Git blob `4d3f9462b8e25f80cfafed5db9870168979d4c58`
- 01: bytes `4775`, SHA-256 `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0`, Git blob `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8`
- 02: bytes `2851`, SHA-256 `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0`, Git blob `3248494436d109174e02f7eb309cc66be37014f2`

Expected concat:

- bytes `12381`
- SHA-256 `b30a91128fbbec229d4bf1083f5df94cbdc5ed1b6b951fe4c75333654264a575`

Require exact raw Git bytes, not copied/rendered Markdown.

## 4. Apply repair to exact reconstructed Step 4

Run patch check first, then apply exactly once.

Required:

- patch applies cleanly to exact frozen Step 4;
- exactly two production files differ: `service_worker.js`, `content_script.js`;
- the other fifteen production files are byte-identical to frozen Step 4;
- manifest is byte-identical;
- repaired `content_script.js` SHA-256 must be exactly `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- compute and report the exact repaired `service_worker.js` SHA-256;
- compute and report all 17 post-repair production hashes.

Do NOT alter the patch if it fails. A context/apply failure is a failed engineering check.

## 5. Quota safety behavior — mocked only

No real provider calls.

Prove from actual repaired worker behavior, not merely grep:

- quota family remains exactly `seller.analytics_data.v1`;
- nominal `min_interval_ms` remains `60000`;
- fixed bridge-owned `bridge_launch_safety_ms` is `5000`;
- effective interval is `65000`;
- first real-attempt reservation uses +65000 ms;
- at +60001 ms same-account analytics is still denied/waiting;
- at +64999 ms it is still denied;
- at +65000 ms it may acquire exactly one slot;
- old persisted state with last real attempt at T and stale `next_allowed_at=T+60000` is migration-guarded to at least `T+65000`;
- different Seller account remains independent;
- cache hit before quota still consumes zero quota/provider request;
- usable Retry-After smaller than current guarded due cannot shorten it;
- usable Retry-After larger than current guarded due extends it;
- 429 or any provider error produces zero automatic retry/replay;
- no hidden pagination/report polling/fanout is introduced.

The report MUST explicitly say that the 5000 ms guard is an internal bridge safety margin motivated by the rejected live run; it is NOT asserted as Ozon-documented method quota.

## 6. Safe public wait state

Exercise actual `publicManualOperation` and `publicRun` or the exact public state path.

When durable batch state is `quota_waiting`, public state must expose the wait with:

- family;
- nominal interval 60000;
- bridge safety 5000;
- effective interval 65000;
- `next_allowed_at`;
- queue index;
- waiting timestamp;
- `automatic_retry=false`.

It MUST NOT expose:

- raw Client-Id;
- Api-Key;
- account hash;
- credential revision;
- credential scope id.

When batch is not `quota_waiting`, public `quota_wait` must be null.

## 7. Countdown/content behavior

Use the actual repaired production `content_script.js` in a synthetic browser/DOM harness. The accepted CFT/Puppeteer route may be reused; this is still mocked and not the operator profile.

Prove at minimum:

1. Start in bound Manual mode with a structural code block and extension Ozon button.
2. Admit one manual batch.
3. Mock `OZ_GET_MANUAL_STATE` to transition into a durable `quota_waiting` public state with a future `next_allowed_at`.
4. Within the local probe window, an extension-owned top status plate appears with Russian text containing:
   - `Ожидание лимита Ozon`
   - `Ограничение частоты запросов Ozon.`
   - `Следующий запрос через MM:SS.`
   - `Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`
   - an absolute `Следующая попытка: HH:MM:SS` value.
5. Countdown decreases based on `Date.now()` without any provider/network call.
6. At/after due, text changes to `Лимит Ozon снят — отправляем запрос…`.
7. Ozon execution button remains busy/disabled while the operation remains active; repeated click cannot admit a duplicate batch.
8. Native Copy remains independent.
9. Content-script restart/route re-sync with the same durable public wait reconstructs the plate from `next_allowed_at`.
10. A second independent tab/conversation with a different wait renders its own due time and does not overwrite the first.
11. Alice adapter structural binding still works; no ChatGPT-only global state is introduced.

Count all mocked runtime messages. There must be zero request to Ozon/provider transport. The short `OZ_GET_MANUAL_STATE` discovery probe is allowed because it is local extension state only.

## 8. Regression/static checks

Require:

- all 17 production JS files `node --check` PASS;
- manifest JSON parse PASS;
- `git diff --check` PASS;
- permissions/host permissions byte-identical to frozen Step 4;
- no provider/contract/runtime-names/AI-adapter/composer/provider-transport file drift;
- existing Step-1 capability, Step-2 coalescing/projection, Step-3 no-retry/durable-wait/Retry-After and Step-4 cache-hit-before-quota synthetic regression checks still PASS;
- delivery FSM protected behavior still PASS;
- `REAL_OZON_REQUESTS = 0`.

## 9. Publication discipline

Create engineering-check branch from exact implementation-candidate checkpoint:

`engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18`

Base commit:

`ae64d944c90eac70be6cf88784b822a281dca3c5`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_RECONSTRUCTION_REPORT_2026-08-18.md`

The engineering branch must be exactly one report-only commit ahead of `ae64d944...`. No patch/source fixes.

Commit message:

`test: check Ozon live repair prefreeze reconstruction`

Do not merge. Push the report branch and STOP.

## 10. Verdict

Only:

`PREFREEZE_CHECK_PASS`

or

`PREFREEZE_CHECK_FAILED`

This verdict is not release acceptance and not final live acceptance.

## 11. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  ae64d944c90eac70be6cf88784b822a281dca3c5

reconstruction:
  frozen_step4_17_of_17: PASS|FAIL
  repair_raw_parts: PASS|FAIL
  repair_concat: PASS|FAIL
  patch_apply: PASS|FAIL
  changed_files_exactly_2: PASS|FAIL
  protected_15_byte_identical: PASS|FAIL

post_repair_hashes:
  service_worker_sha256: <sha or NONE>
  content_script_sha256: <sha or NONE>

quota_guard:
  nominal_60000: PASS|FAIL
  bridge_safety_5000: PASS|FAIL
  effective_65000: PASS|FAIL
  migration_guard: PASS|FAIL
  retry_after_extension_only: PASS|FAIL
  zero_auto_retry: PASS|FAIL

countdown:
  visible_wait_plate: PASS|FAIL
  live_mm_ss_decrement: PASS|FAIL
  absolute_due_clock: PASS|FAIL
  due_sending_state: PASS|FAIL
  restart_restore: PASS|FAIL
  duplicate_click_blocked: PASS|FAIL
  multi_tab_owner_scoped: PASS|FAIL
  chatgpt_alice_binding_regression: PASS|FAIL

security:
  public_wait_privacy: PASS|FAIL
  provider_surface_unchanged: PASS|FAIL

real_ozon_requests:
  0

report_branch:
  engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_CHECK_PASS|PREFREEZE_CHECK_FAILED

After publishing: STOP. Wait for ChatGPT to review live GitHub before any freeze.