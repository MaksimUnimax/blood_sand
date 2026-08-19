# Ozon Bridge v0.1.19 — pre-Codex B01–B15 readiness matrix

Date: 2026-08-19
Status: `STOP_NOT_READY_FOR_CODEX_SINGLE_ROOT_CAPABILITY_GAP`
Scope: engineering readiness only. This is not a Codex result, not a test program and not packaging authority.

## 0. Governing rule

The current final validation authority is:

`tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md`

Current checklist blob:
`8bfd8f925eab7c8901fe63585a5fba34e800d6a8`

The checklist is `CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`.

Before any new Codex run, every B01–B15 block must already have a proven physically executable path using existing allowed means. A prior behavioral PASS from an engineering helper does not by itself prove that Codex can repeat the block without writing test code.

No new Codex prompt is allowed while any row below is `NOT_READY` or `PARTIAL`.

## 1. Exact candidate

Unchanged production candidate:

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch bytes: `13648`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- final `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: exactly `17`
- changed production files: exactly `service_worker.js`, `content_script.js`
- protected files: remaining `15`, byte-identical to frozen artifact.

No production byte was changed by this readiness work.

## 2. Browser/runtime environment readiness

Current environment authority:

`tooling/llm-api-bridges/ozon-seller/validation/environment/PUPPETEER_WINDOWS_CFT_QUALIFIED_ENVIRONMENT_2026-08-19.md`

The current authority reconciles two actually executed layers:

1. ENV6 materialization/install qualification:
   - report `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`;
   - canonical CFT `308` files;
   - canonical digest `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`;
   - owned copy;
   - copied `setup.exe` exit `78`;
   - extension install/enumeration;
   - version `0.1.19`.

2. Later exact-current-candidate functional CDP evidence:
   - RERUN13 report `9e275d784b46c46dc86f1f0ca02eb5e12094ec37`;
   - RERUN18 report `9188b934e1c648acecfa390cc5c49074195a3e4b`;
   - raw PAGE Runtime/Page/Fetch PASS;
   - local synthetic page adapter PASS;
   - exact candidate worker direct CDP Runtime/Network PASS;
   - browser/worker liveness PASS;
   - zero real Ozon/Performance/ChatGPT requests;
   - validator-only `--no-sandbox` functional-CDP exception.

RERUN18 is important because it reached the substrate successfully but correctly invalidated its own umbrella marker: its Phase C/D implementation did not execute the complete permanent functional matrix. That is a harness-completeness failure, not a production-browser failure.

RERUN19–RERUN21 failed in additional runner/authority-bundle layers before complete functional execution and do not supersede the RERUN18 substrate PASS.

Conclusion: **browser/runtime substrate is READY**. The remaining blocker is not Chrome launch, extension installation, raw PAGE, worker discovery, worker Runtime or network observation.

## 3. Engineering behavior evidence already obtained

The engineering preflight file:

`tooling/llm-api-bridges/ozon-seller/validation/engineering-preflight/CURRENT_TEST_PATH_AUDIT_2026-08-19.md`

contains exact-current-candidate engineering execution evidence for:

- B02/B03 strict command/security behavior — PASS in engineering preflight;
- B04 capability behavior — PASS in engineering preflight;
- B05/B07/B08 planner/verifier/cache behavior — R2 PASS;
- B06 quota behavior — R2 PASS, including a real elapsed due/resume sequence, same/different Seller, credential rotation, restart/no replay and 429/Retry-After; real provider requests zero;
- B09 common batch — R2 PASS;
- B11/B12 composer-wait/Manual-OFF targeted behavior — PASS;
- B14 Performance boundary — PASS;
- real Ozon and real Performance request counters — zero.

These runs are useful evidence that the current production candidate itself is not presently known to be broken. They are **not** sufficient final-Codex readiness where their execution depended on temporary engineering fixtures that Codex is now forbidden to create or adapt.

## 4. Legacy executable-manifest conflict

The older file:

`validation/full-gate/FULL_GATE_EXECUTABLE_EVIDENCE_MANIFEST_2026-08-19.md`

is architecture/history, not the current Codex execution contract.

It explicitly required adapting or constructing E3–E8 harnesses and building assertion-ledger/runner machinery. That conflicts with the later current checklist rule that Codex does not create or modify validators, runners, harnesses, fixtures, helpers, assertion ledgers, authority bundles or other test infrastructure.

Therefore the old manifest cannot be used to claim that B02–B15 are currently executable by Codex.

## 5. Block-by-block readiness

Legend:

- `READY` — existing allowed means are already proven sufficient for Codex to perform the block without creating test code.
- `PARTIAL` — required substrate/behavior is proven, but at least one required final action still depends on the unresolved root capability below.
- `NOT_READY` — the block requires the unresolved root capability.

| Block | Readiness | What is already proven | Remaining execution issue |
|---|---|---|---|
| B01 | `READY` | deterministic ZIP/patch/hash/inventory reconstruction repeatedly PASS | none |
| B02 | `READY` | raw synthetic ChatGPT/Alice page path exists; command discovery/invalid-input behavior already engineering-PASS; provider network can be observed/blocked | no successful provider response is required to prove pre-execution acceptance/rejection |
| B03 | `READY` | direct worker Network observation + synthetic pages available; fixed-host/injection/privacy behavior engineering-PASS | network can remain blocked; no mocked success is required for arbitrary transport rejection checks |
| B04 | `NOT_READY` | capability logic engineering-PASS | needs deterministic safe mocked Seller capability/business responses through an already-existing ordinary environment path |
| B05 | `NOT_READY` | planner/coalescing/projection engineering-PASS | needs deterministic provider response bodies and provider-call counting without a generated harness |
| B06 | `NOT_READY` | actual elapsed 65000-ms quota behavior engineering-PASS | final product sequence needs a safe mocked successful first/second Seller response and 429/Retry-After injection using an already-existing ordinary environment path |
| B07 | `NOT_READY` | verifier/error behavior engineering-PASS | requires controlled valid 200, malformed 200, 429, transport error and pre-fetch failure responses without a generated harness |
| B08 | `NOT_READY` | verified-cache semantics engineering-PASS | requires a controlled verified successful provider result to create current-run cache evidence without a generated harness |
| B09 | `NOT_READY` | common batch engineering-PASS | complete product batch behavior needs controlled provider responses/call counts without a generated harness |
| B10 | `PARTIAL` | current browser substrate READY; historical protected Send FSM proves disabled Send/Stop/Unknown/Microphone and late-user-Send fencing; current repair does not rewrite that protected Send watcher | normal ready-report delivery still needs a current-run report obtained through the unresolved safe mocked-provider path |
| B11 | `PARTIAL` | exact current composer-wait targeted behavior PASS; current browser behavior source covers occupied/missing composer | final direct product reproduction of report-ready state still depends on the unresolved safe mocked-provider path unless an already-existing non-test state setup is proven |
| B12 | `PARTIAL` | exact current narrow Manual OFF cancellation, OFF→ON, quota/cache preservation engineering-PASS | final direct product reproduction of pending pre-insert report depends on the unresolved safe mocked-provider path unless an already-existing non-test state setup is proven |
| B13 | `PARTIAL` | synthetic ChatGPT/Alice, native Copy, multi-owner/browser substrate are available; historical/current owner-isolation behavior exists | wait/delivery portions of the required current-run matrix depend on B10–B12 readiness |
| B14 | `NOT_READY` | Performance boundary engineering-PASS; Performance real network can be blocked/observed | needs controlled Performance-only response/auth flow via already-existing safe mocked-provider path |
| B15 | `PARTIAL` | qualified Windows/CFT materialization and raw PAGE/direct-worker CDP substrate are objectively PASS on exact current candidate | B15 requires the complete B10–B13 browser matrix, so it remains partial while B10–B13 are partial |

## 6. Single root capability gap

The remaining root gap is:

`EXISTING_FILELESS_SAFE_WORKER_PROVIDER_RESPONSE_MOCK_NOT_YET_PROVEN`

The current allowed environment already proves:

- browser launch;
- exact candidate install/enumeration;
- raw synthetic ChatGPT/Alice page fulfillment;
- PAGE `Fetch` interception;
- direct candidate worker Runtime access;
- direct candidate worker Network observation;
- real Seller/Performance/ChatGPT network can remain zero.

What is **not yet proven as an already-existing ordinary Codex capability** is a deterministic, safe, fileless worker-side provider-response mechanism that can, without creating/adapting test programs:

- allow the product to make its normal Seller/Performance request attempt;
- intercept it before any real external request;
- return a controlled HTTP status/body/headers;
- support valid analytics/capability/Performance responses;
- support malformed HTTP-200 response;
- support HTTP 429 with controlled `Retry-After`;
- support transport-failure observation;
- preserve exact physical request counting;
- keep `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`.

The historical VM/fetch harnesses and the temporary engineering R2 fixtures prove product behavior, but they are not the required fileless ordinary-environment mechanism for the current document-only Codex gate.

The raw PAGE `Fetch` capability proven by RERUN13/RERUN18 is not sufficient evidence by itself because Seller/Performance requests originate from the extension worker. Worker `Network.enable` is proven; worker-side response interception/fulfillment is not yet proven.

## 7. Required condition before any next Codex prompt

Before a new Codex prompt is permitted, the existing Windows QA environment must already provide and have evidence for the root capability above **without creating a new validator/runner/harness/fixture/helper/test file**.

Acceptable proof must show the exact current environment can perform at least one controlled worker-side provider request/response round trip with real external request counter zero, and that the same ordinary mechanism can select response status/body/headers required by B04–B09/B14.

Until that exists:

- new Codex prompt: `FORBIDDEN`
- new Codex run: `FORBIDDEN`
- production changes: `FORBIDDEN` absent a separately proven production defect
- packaging: `FORBIDDEN`
- creation of another validator/runner/harness/ready-test to bypass this gap: `FORBIDDEN`

## 8. Next engineering action

Do not rerun Codex.

Do not create another test program.

The next action is to identify/verify whether the already-installed Codex Windows/DevTools environment already exposes a standard worker-target network interception/response-fulfillment facility usable interactively (for example an already-supported DevTools/CDP facility) and prove that existing facility on the exact current candidate without persisting new test code.

If such an existing capability is proven, update this matrix and re-check every B01–B15 row. If it is not available, keep `STOP_NOT_READY_FOR_CODEX_SINGLE_ROOT_CAPABILITY_GAP` and do not repeat the rejected run.