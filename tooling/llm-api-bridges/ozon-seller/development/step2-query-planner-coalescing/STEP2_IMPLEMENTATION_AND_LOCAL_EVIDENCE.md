# Ozon Bridge Step 2 — Query planner + safe coalescing implementation and local evidence

Date: 2026-08-17
Status: implementation candidate frozen by the commit containing this document; independent Codex validation is still required before Step 3.

## Authority and baseline

Repository: `MaksimUnimax/blood_sand`

Step-2 development branch:

`dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17`

Branch base / Step-1 acceptance decision:

`c8d6a10b63b7c02095a6cc6626f5aa508e16a8bd`

Accepted Step-1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted Step-1 reconstruction-v2 validation target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted Step-1 report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Pinned operator ZIP:

- size `100320`
- SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Accepted Step-1 concatenated patch SHA-256:

`5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`

The accepted Step-1 candidate was reconstructed byte-exact before Step-2 work. Its three Step-1 changed-file hashes matched the independent accepted report.

## Step-2 scope

Step 2 adds only a conservative query planner / optimizer and safe `analytics_data` metric-union coalescing.

It does NOT implement:

- the Step-3 global quota scheduler;
- `/v1/analytics/data` one-per-minute temporal coordination;
- Retry-After scheduling or automatic retry;
- cache/prefetch;
- cross-tab provider dedupe;
- semantic aliases;
- ChatGPT/Alice DOM/composer/delivery redesign.

The physical execution order is deliberately conservative: only **contiguous** compatible analytics logical commands are coalesced. This prevents optimization from reordering physical requests around unrelated logical operations.

## Compatibility model

Coalescing is evaluated only after accepted Step-1 strict validation and capability/entitlement planning.

The coalescing descriptor uses the Step-1 `execution_command`, not an unentitled logical superset.

For `analytics_data`, the compatibility key preserves every normalized physical request parameter except `metrics`. Therefore commands differ and do not merge when any of these differ:

- `date_from` / `date_to`;
- ordered `dimension` array;
- `filters` array semantics/order;
- `sort` array semantics/order;
- `limit`;
- `offset`;
- any other reviewed normalized physical parameter.

Object-key order is normalized deterministically, while array order is preserved.

Different limits are intentionally NOT coalesced in Step 2.

Duplicate metrics inside one logical physical command make that command ineligible for coalescing rather than guessing duplicate-position semantics.

Metric union is ordered by first occurrence and cannot exceed the provider contract maximum of 14 metrics. A command that would make a current group exceed 14 remains outside that group.

## Logical / physical execution

For a compatible group:

1. durable query planning records a group ID, leader index, contiguous member indexes, physical command, physical fingerprint and physical metric order;
2. all group members are atomically moved from `pending` to `requesting` under one worker session before the provider call;
3. exactly one physical provider request is attempted for the group;
4. one distinct logical result is built for every original logical command;
5. all logical results share explicit physical request / physical command / coalescing-group provenance;
6. all logical results are atomically stored as `complete` and the queue advances past the whole group.

A worker restart while a group is durably `requesting` uses the existing accepted `REQUEST_OUTCOME_UNKNOWN_NO_RETRY` rule and performs no blind replay.

The final batch header reports logical business result count and unique physical business request count separately.

## Result projection safety

`shared/ozon_provider.js` now returns the already-sanitized internal result object, elapsed time and safe Retry-After metadata to worker-side planning code. Raw provider text/body is not newly exposed.

For a successful coalesced `analytics_data` response, projection uses the physical metric order and original logical executable metric order.

Projection is accepted only when:

- the physical metric list is unique and non-empty;
- the logical executable metric list is a unique non-empty subset;
- `result` is an object;
- each present `result.data[].metrics` array has cardinality exactly equal to the physical metric count;
- a present `result.totals` array has cardinality exactly equal to the physical metric count;
- at least one verifiable metric projection surface (`data` or `totals`) exists.

If projection cannot be proven, no retry is attempted. The single physical request remains recorded and every logical member receives a sanitized `ANALYTICS_COALESCED_RESPONSE_UNPROJECTABLE` bridge result with `external_request_executed:true` and shared physical provenance. Step 3 remains responsible for the broader provider response-verifier policy.

Provider HTTP errors are not retried; one safe provider-error payload is projected to each logical member with the same physical request provenance.

## Production delta

Exactly three production files differ from the accepted Step-1 candidate:

- `service_worker.js` — size `206145`, SHA-256 `6e50b48a9e908a055f815cc5d683ae565043317fffe050a57eeedc791961996f`
- `shared/ozon_contract.js` — size `73334`, SHA-256 `f75c45e29035c82115eb22da36cad5e4fba53ec04f6bfdd7080557587da06bac`
- `shared/ozon_provider.js` — size `13426`, SHA-256 `983b54fbe78e34c02555b28532792b6c786f200da9e85b67e310e023054e5f8d`

Step-2 concatenated patch:

- size `35644`
- SHA-256 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`

The six raw patch fragments and Git blob IDs are recorded in `PATCH_PARTS.md`. Live GitHub directory metadata was checked after upload and all six Git blob IDs/sizes matched the local exact bytes.

## Protected production files

The other fourteen production files are byte-identical to the accepted Step-1 candidate / operator baseline:

- `content_script.js` — `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` — `6ed5ecc768cc980d256b5bfb69f00c9a4006ec2eb2bd6c96f9d261d7a018e0fb`
- `popup.css` — `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` — `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js` — `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `shared/ai_adapters.js` — `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js` — `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js` — `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js` — `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js` — `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_credentials.js` — `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/proven_writing_block_capture.js` — `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js` — `9c33c7c2448959f75eb5d0c2b36137bba68085c4b93a90a8c67d1ee86de4aa39`
- `shared/runtime_names.js` — `2abc73a8c6f5ba29e71c352c452fcc4da1cbf278de988fdc070dc5414d908292`

Inside the changed `service_worker.js`, the accepted Step-1 `ensureBatchCapabilityAndPlanning` body and 18 checked delivery/finalization function bodies remained byte-identical to Step 1. `ensureBatchCapabilityAndPlanning` SHA-256 is `9aaf433de7baddd52c19e75aef237e3e852aa35519116e09a8fa288177417a9c` in both trees.

## Local executable evidence

All provider behavior was mocked. No real Ozon request was made.

PASS results on the exact candidate and again on a fresh reconstruction from accepted Step 1 + Step-2 patch:

- `STEP2_CONTRACT_TEST_PASS`
- `STEP2_PROVIDER_SAFE_RESULT_PASS`
- `STEP2_WORKER_COALESCE_PASS` — 3 compatible logical analytics results from 1 physical call
- `STEP2_WORKER_INCOMPATIBLE_PASS` — different limit not merged
- `STEP2_WORKER_CONTIGUOUS_ONLY_PASS`
- `STEP2_WORKER_METRIC_CAP_PASS` — 15th unique metric remains outside 14-metric group
- `STEP2_WORKER_PARTIAL_PLAN_PRESERVED_PASS`
- `STEP2_WORKER_RESTART_NO_RETRY_PASS`
- `STEP2_WORKER_PROJECTION_FAIL_CLOSED_PASS`
- `STEP2_WORKER_PROVIDER_ERROR_FANOUT_PASS`
- `STEP2_WORKER_THROWN_EXECUTION_SINGLE_ATTEMPT_PASS`
- `STEP1_ONE_PROBE_REGRESSION_PASS` — 30 recent `product_queries`: 1 capability probe, 30 business calls
- `STEP1_ZERO_PROBE_AND_STEP2_COALESCE_PASS` — 30 universal analytics: 0 probes, 1 physical business call
- `PERFORMANCE_ZERO_PROBE_NO_COALESCE_PASS`
- all 17 production JavaScript files passed `node --check`
- `git diff --check` PASS
- fresh Step-2 patch reconstruction was byte-identical across all 17 production files
- scan of added diff found no Step-3 scheduler state (`last_provider_request_at`, `next_allowed_at`, `min_interval_ms`), sleep scheduling, or `automatic_retry:true` addition.

Local development runtime was Node `v22.16.0`; this is local engineering evidence only and is not presented as the accepted Windows/Codex browser gate.

`REAL_OZON_REQUESTS = 0`

## Gate state

Step 2 is IMPLEMENTED LOCALLY / FROZEN FOR INDEPENDENT VALIDATION once this evidence commit is recorded.

Do not begin Step 3 until a separate Codex validation branch tests the exact frozen Step-2 target and the resulting full GitHub report is independently reviewed and accepted.
