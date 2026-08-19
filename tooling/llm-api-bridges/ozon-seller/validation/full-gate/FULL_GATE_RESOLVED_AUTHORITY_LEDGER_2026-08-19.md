# Ozon Bridge v0.1.19 — resolved full-gate authority and assertion ledger

Date: 2026-08-19
Status: `MANDATORY_RESOLVED_FULL_GATE_AUTHORITY_LEDGER`
Scope: validation-only. Production/candidate bytes and permanent-gate semantics are immutable.

## 0. Purpose and precedence

This file is a clean resolved authority for the next pre-operator full gate. It intentionally does **not** inherit any RERUN19/RERUN20/RERUN21/RERUN22 plan, authority-bundle schema, correction precedence chain, old bundle path, old runner, old package, or historical block status.

The permanent gate remains the semantic authority:

- path: `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRE_OPERATOR_HANDOFF_FULL_CODEX_GATE.md`
- exact Git blob: `28c82b263e6cbd01c744cbfc046241837f1d253e`

All values below are already resolved. For each item there is exactly one effective identity. There is no legacy/override/fallback choice at runtime.

Historical PASS/FAIL reports may be used only to understand test architecture. They never count as current execution evidence.

## 1. Direct immutable production/candidate authorities

### Frozen published artifact

- publication commit: `5245551cb4ff01e388146397b1a0075c0e0f013b`
- path: `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
- Git blob: `0e4884e313ff489f075e44b204893f7c1abe01d5`
- bytes: `122719`
- SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- frozen `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- frozen `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

### Composer-wait production repair

Ordered patch parts:

1. `development/manual-delivery-composer-wait/patch-parts/00.patch.part`
   - checkpoint/ref: `1de4cea770fc8ae09280e65d13e60525fd22e4e7`
   - Git blob: `4b4578995156cafd60221f8d57f678b99b0b00ff`
   - bytes: `6957`
   - SHA-256: `ef09ba13d67a9d04fc7be8ac1fc18e67b37812afb78597b8abd6cdc5336b839c`
2. `development/manual-delivery-composer-wait/patch-parts/01.patch.part`
   - checkpoint/ref: `1de4cea770fc8ae09280e65d13e60525fd22e4e7`
   - Git blob: `98feec99e459332df60aae879fa8f2530856c2d0`
   - bytes: `6691`
   - SHA-256: `65e2de64e97859599aeab9fb42e89e614e8bb22cb95feb43af05b3b1f9917b03`

Concatenated exact patch:

- bytes: `13648`
- SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Final candidate after exact clean application:

- inventory: exactly `17` production files
- authorized changed files: exactly `service_worker.js`, `content_script.js`
- protected files: remaining `15`, byte-identical to frozen artifact
- final `service_worker.js` SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- final `content_script.js` SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Protected 15:

`manifest.json`, `popup.css`, `popup.html`, `popup.js`, `shared/ai_adapters.js`, `shared/bridge_autorun_model.js`, `shared/composer_send.js`, `shared/conversation_identity.js`, `shared/manual_controls.js`, `shared/ozon_contract.js`, `shared/ozon_credentials.js`, `shared/ozon_provider.js`, `shared/proven_writing_block_capture.js`, `shared/provider_transport_core.js`, `shared/runtime_names.js`.

## 2. Direct executable/behavior authorities

### E1 — exact current composer-wait targeted harness

Ordered parts at gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`:

- `00.mjs.part`: blob `ced9b470a6d4dd143303144b3db76888924358c2`, bytes `7975`, SHA-256 `31d76f7b370395860d911b4fa0717168c1cf803c7160d5798796e0f80959403e`
- `01.mjs.part`: blob `401fbe78bbe921affa3adb6f1ddf0cf973a899e2`, bytes `7907`, SHA-256 `244479f2ee3556dcbf2e993cd63155114cc874224dc2f16f4a861d618bc1c9b5`
- `02.mjs.part`: blob `10638ac5c70d07af7f68e51259113e8be63289f4`, bytes `4234`, SHA-256 `8d44fc9bb0ac49d7341a11159ba20d07fcd7ffa0f2ab30c7a604636f27cfc570`
- `03.mjs.part`: blob `42a8e9ee07138eadf62cad80fa584fa532cfc65f`, bytes `1826`, SHA-256 `68f34f7d43955d33649547b34bb773dc9424923b1fc5519ab77092c368cd530a`

Concatenate `00+01+02+03` exactly:

- bytes `21942`
- SHA-256 `ac228da5aef263aa219baac951de3ab6756eb7eaba668054cd1c72985cc32787`

The stale/nonexistent `10638ac5c70e...` value is not an authority and must not be used anywhere.

### E2 — exact current composer-wait browser behavior source

Ordered parts at gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`:

- `validation/full-gate/composer-wait-browser-parts/00.mjs.part`: blob `b056c2d2b0a6189d310b99944bf14501cc15a6d7`, bytes `6925`, SHA-256 `50108245f2fd935425ac9b15a03355bf03448ecf4a34ee21598774bd544f2f51`
- `validation/full-gate/composer-wait-browser-parts/01.mjs.part`: blob `18fc993168945659ae22150dcad23d60677a4638`, bytes `6427`, SHA-256 `a54ba5b3aa9d70e84c1172d93c2c94244d46ec1208bef3ff600f4b3653b67db5`

Composite:

- bytes `13352`
- SHA-256 `ce38adbf78a5501c6c130845f5d76d1e832234b5f8d217d7c9980f8958f7a5c1`

Its behavioral assertions are authoritative. Its old `browser.newPage()`/launch transport is **not** authoritative and must be ported to the resolved raw-CDP browser substrate below.

### E3 — actual worker public-state/quota/429 harness

- Git blob: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- use only validation-only deterministic adaptations for current final worker/content hashes, realm-safe fixture compatibility and the persisted-due fixture below
- no semantic assertion may be removed or weakened

Persisted-due fixture authority:

- path: `validation/full-gate/WORKER_DUE_FIXTURE_CORRECTION_2026-08-18.md`
- Git blob: `44e396b9a566f0c33ba3e50ed6dc3dba07770a4d`
- use worker-persisted `quota_wait.next_allowed_at`; wait past persisted due; require no early call, exactly one mocked provider call and no duplicate

### E4 — protected-current carry-forward harness source

- source Git blob: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Resolved adaptation for this repair compares the **published frozen artifact immediately before composer-wait repair** against the current candidate, not an older Step-4 reconstruction. It must prove:

- protected 15 byte-identical
- protected Step1/2/3/cache/batch/delivery function bodies unchanged where not explicitly part of the composer repair
- current contract functions still present

This removes any need for a separate historical Step-4 production-tree reconstruction in the final gate.

### E5 — quota-countdown / ChatGPT / Alice browser behavior source

- historical browser source Git blob: `841429741d5ff9144a8a40506e657dc4392fe37c`

Behavioral assertions to port to the resolved raw-CDP substrate include visible quota countdown, three decreasing seconds, absolute due clock, busy-state/duplicate-click rejection, native Copy independence/state immutability, two-owner isolation, restart restore, due sending state, ChatGPT binding, Alice binding and no cross-owner regression. Old `browser.newPage()` transport is forbidden.

### Behavior catalogs used to build current executable validation helpers

These are architecture/coverage sources only; their historical PASS text is not current evidence:

- Step1 contract/capability doc: blob `aba9f558af1bfef936122d34f0de92dee3344bbd`
- Step2 planner/coalescing doc: blob `a2f9c872b9f2fe34dff75448cc9b5df012b518a3`
- Step3 quota/verifier doc: blob `3374b771fb51b24be87078d1117a9dc3d5f4a856`
- Step4 cache/prefetch doc: blob `93cc0939be23e8f58a47abd29604bde93fd6ab99`
- V3B behavioral completion plan: blob `79c203caad03011bcb16428bbcf6d59b9c7a5b90`

Any generated current helper based on these catalogs must execute current candidate code with mocked provider/Chrome state and must be present, syntax-valid and assertion-mapped **before** the one consolidated candidate execution starts.

## 3. Resolved Windows validator environment

Canonical CFT inventory authority:

- CFT algorithm doc blob: `99f30ea87e926e5985a6671ba540a507765f2142`
- CFT version `151.0.7922.47`
- exact regular files `308`
- canonical inventory SHA-256 `d7b8a2b0c29abcbfba6a0ebfa85ea3296097af3bef45c0b2b60c98055d523b9c`
- algorithm: sorted recursive regular files -> `{path,size,sha256}` -> final localeCompare -> one JSON record per LF + final LF -> SHA-256

Effective sandbox/browser supersession:

- environment doc blob: `0cda9434eb66bea89f33212b366b5deb4f82e360`
- Node `v24.12.0`
- Puppeteer `25.4.0`
- fresh validation-owned byte-identical CFT copy
- copied `setup.exe --configure-browser-in-directory=<copy>` exactly once, `shell:false`, exit `78`
- post-setup copy byte-identical
- fresh validation-only profile
- `ignoreDefaultArgs:true`, `headless:false`, `enableExtensions:true`, `waitForInitialPage:false`, `dumpio:true`

Exact normalized Chrome args, and no others:

1. `--user-data-dir=<fresh-profile>`
2. `--remote-debugging-port=0`
3. `--no-first-run`
4. `--no-default-browser-check`
5. `--disable-background-networking`
6. `--disable-component-update`
7. `--disable-sync`
8. `--metrics-recording-only`
9. `--host-resolver-rules=MAP api-seller.ozon.ru 0.0.0.0, MAP api-performance.ozon.ru 0.0.0.0`
10. `--no-sandbox`
11. `about:blank`

`--no-sandbox` is validator-only. Do not pass `--disable-gpu-sandbox`; do not alter operator Chrome/package/live instructions.

Accepted browser implementation rules:

- never `browser.newPage()` in accepted browser validation
- never `extension.triggerAction()` for worker start
- never `worker.evaluate()` / `worker.evaluateHandle()`
- never use browser-target `ServiceWorker` domain
- install/enumerate candidate via Puppeteer; never pin extension id
- create PAGE via raw `Target.createTarget({url:'about:blank'})`
- connect directly to PAGE websocket; require `Runtime.enable`, `Page.enable`, `Fetch.enable`, harmless `1+1===2`
- install Fetch interception before navigating to synthetic supported origins
- `REAL_CHATGPT_REQUESTS=0`
- inspect both `extension.workers()` and raw targets
- if candidate worker absent: on PAGE session `ServiceWorker.enable`, observe exact candidate registration scope, call `ServiceWorker.startWorker(scopeURL)` exactly once, bounded-poll both discovery routes
- direct worker runtime via `worker.client.send(...)`; raw same-worker target CDP is fallback
- require post-worker browser liveness

## 4. Resolved permanent assertion ledger

The exact permanent gate contains `164` mandatory assertion entries across B01-B15. These counts are fixed and are not discovered heuristically at runtime:

- B01 `11`
- B02 `9`
- B03 `9`
- B04 `10`
- B05 `8`
- B06 `18`
- B07 `7`
- B08 `13`
- B09 `9`
- B10 `10`
- B11 `13`
- B12 `26` (includes the four mandatory narrow-cancellation scope preconditions plus 22 asserted invariants)
- B13 `10`
- B14 `4`
- B15 `7`

Total B01-B15 = `164`.

Each assertion starts `{executed:false, pass:false}` and may become PASS only from current-run concrete evidence. Each entry must record evidence provider/source SHA-256, exact command/transport and observed value/state/count/marker. Phase markers, historical PASS text and source-scan-only evidence cannot by themselves pass a behavioral assertion.

### B01 — Candidate integrity / reconstruction (`11`)

- B01.01 exact immutable candidate authority
- B01.02 exact frozen artifact/reconstruction inputs
- B01.03 exact patch/part byte hashes
- B01.04 patch applies without fuzz/manual repair
- B01.05 exact production inventory
- B01.06 changed files exactly authorized scope
- B01.07 declared protected files byte-identical
- B01.08 all production JavaScript `node --check`
- B01.09 `manifest.json` parses
- B01.10 no unintended permissions/host-permission expansion
- B01.11 no tests/reports/credentials/dev artifacts in production tree

### B02 — Command discovery / strict contract (`9`)

- B02.01 supported ChatGPT/Alice code-block/message discovery
- B02.02 surrounding prose/Markdown cannot create unrelated commands
- B02.03 supported Unicode/separator behavior accepted
- B02.04 malformed JSON never silently repaired
- B02.05 malformed/pre-execution failures zero provider requests
- B02.06 strict analytics date/dimension/metric/filter/sort/limit/offset validation
- B02.07 strict product-query date/SKU/sort/page constraints
- B02.08 blocked/removed operations unavailable
- B02.09 `posting_fbs_get` blocked by PII boundary

### B03 — Provider/security boundary (`9`)

- B03.01 fixed Seller/Performance hosts only
- B03.02 assistant cannot select URL/host/method/headers/auth/credentials
- B03.03 no exposed mutation/write operation
- B03.04 credentials absent from AI-visible output
- B03.05 unsafe raw provider bodies/fields sanitized
- B03.06 customer PII not exposed
- B03.07 no hidden retry/pagination/fan-out/report polling
- B03.08 no invented generic caps/silent truncation
- B03.09 wrong tab/conversation/binding fails closed

### B04 — Seller capability/entitlement (`10`)

- B04.01 seller capability probe internal/non-AI-callable
- B04.02 raw seller-info identity/company fields never reach AI
- B04.03 universal analytics zero capability probes
- B04.04 relevant logical batch at most one fresh probe
- B04.05 restart does not blindly replay in-flight capability probe
- B04.06 entitlement states remain explicit
- B04.07 mixed universal/restricted follows reviewed partial semantics
- B04.08 all-restricted/no-executable zero business requests
- B04.09 restricted dimension/filter/sort/history fails closed without meaning change
- B04.10 Performance-only zero Seller capability probes

### B05 — Query planner/coalescing/projection (`8`)

- B05.01 only contiguous compatible analytics coalesce
- B05.02 differing non-metric semantics do not merge
- B05.03 deterministic metric union within maximum
- B05.04 logical identities/results separate after one physical request
- B05.05 verified physical metric order drives projection
- B05.06 unprovable projection fails closed
- B05.07 projection failure/provider error does not replay provider request
- B05.08 restart after started physical group does not blindly replay

### B06 — Global Seller quota scheduler (`18`)

- B06.01 family exactly `seller.analytics_data.v1`
- B06.02 provider minimum `60000`
- B06.03 bridge launch safety `5000`
- B06.04 effective guarded interval `65000`
- B06.05 same Seller shares bucket across tabs/conversations/AIs
- B06.06 different Seller accounts independent
- B06.07 same Client-Id key rotation preserves account scope and changes credential revision
- B06.08 raw credentials absent from quota persistence
- B06.09 concurrent acquisition grants one permit
- B06.10 cache miss cannot bypass quota
- B06.11 one coalesced physical request consumes one permit
- B06.12 pre-provider `quota_waiting` survives restart
- B06.13 due wake exactly one mocked provider call
- B06.14 no call before effective `next_allowed_at`
- B06.15 already-attempted/requesting work no startup/alarm replay
- B06.16 no immediate retry
- B06.17 Retry-After only extends and never shortens due
- B06.18 public quota state safe timing metadata only

### B07 — Response verifier/safe errors (`7`)

- B07.01 analytics shape/cardinality verified before projection/cache
- B07.02 invalid HTTP-200 payload safe mismatch after one attempt
- B07.03 verifier failure no retry
- B07.04 HTTP429 safe, may extend Retry-After, no retry
- B07.05 transport errors truthful attempted-request provenance
- B07.06 pre-fetch storage/credential failures zero provider requests
- B07.07 `automatic_retry:false` truthful

### B08 — Verified analytics cache/prefetch (`13`)

- B08.01 only successful verified analytics responses cache
- B08.02 cache lookup precedes quota
- B08.03 TTL `60000`
- B08.04 same Seller + exact non-metric semantics + safe metric superset may hit
- B08.05 different Seller/incompatible/expired miss
- B08.06 provider errors/malformed responses not cached
- B08.07 credentials absent from serialized cache
- B08.08 metric-superset projection deterministic
- B08.09 cache hit `external_request_executed:false` with truthful provenance
- B08.10 `analytics_basic_metrics_v1` only widens reviewed universal subset
- B08.11 prefetch never adds restricted metrics/changes other semantics
- B08.12 following compatible request zero second provider call and zero second quota acquisition
- B08.13 cache hit/lookup does not corrupt quota state

### B09 — Manual/Autorun common batch engine (`9`)

- B09.01 one command one-entry batch
- B09.02 multi-command logical order preserved
- B09.03 required physical calls strictly serial
- B09.04 malformed/validation entries use safe continuation semantics
- B09.05 completed entries not replayed after recovery
- B09.06 old-worker `requesting` ambiguity fails closed
- B09.07 no unintended intermediate chat delivery
- B09.08 final report preserves logical order/count and truthful physical count
- B09.09 Manual/Autorun ownership separate while sharing intended worker machinery

### B10 — Normal empty-composer delivery FSM (`10`)

- B10.01 ready report + empty correct composer enters existing insertion path
- B10.02 correct owner/conversation only
- B10.03 worker insert commit is irreversible insertion permission boundary
- B10.04 report inserted exactly once
- B10.05 staged recognized Send clicked at most once
- B10.06 later ordinary user Send controls not clicked by that delivery
- B10.07 disabled Send/Stop/Unknown/Microphone not clicked as Send
- B10.08 Microphone/current accepted ready marker is success authority
- B10.09 confirmed completion clears transient delivery/restores Manual readiness
- B10.10 delivery recovery does not replay provider work

### B11 — Occupied/missing Manual composer (`13`)

- B11.01 unrelated non-empty composer text never cleared/replaced/selected/submitted
- B11.02 temporarily missing composer recoverable, not terminal `COMPOSER_NOT_FOUND`
- B11.03 occupied/missing composer does not request insert commit
- B11.04 pending report remains worker-owned recoverable pre-insert
- B11.05 exact persistent plate text `Очистите поле ввода, чтобы получить отчёт.`
- B11.06 plate does not auto-expire while pending/not inserted
- B11.07 event-driven observation/reacquisition with bounded fallback polling
- B11.08 correct composer empty -> exactly one insert commit and one insertion
- B11.09 wrong owner/conversation composer never used
- B11.10 plate disappears only after successful insertion or explicit cancellation
- B11.11 content/page restart recreates wait without duplicate insert/Send
- B11.12 downstream one-Send/Microphone semantics intact
- B11.13 occupied/missing waiting zero provider replay

### B12 — Manual OFF cancellation/OFF->ON (`26`)

Mandatory cancellable-state scope:

- B12.01 operation status is `delivering`
- B12.02 delivery mode is `batch_watch_v1`
- B12.03 delivery phase is `claimed`
- B12.04 insertion permission has not been committed

Assertions:

- B12.05 eligible claimed pending report deleted only for that owner
- B12.06 only that operation waiter/plate stopped
- B12.07 cancelled report never reappears after re-enable
- B12.08 `requesting`/`quota_waiting` work not deleted
- B12.09 `insert_committed` delivery not deleted
- B12.10 `inserted` delivery not deleted
- B12.11 OFF flag persisted before claimed cancellation
- B12.12 stale content cannot get insert permission after OFF
- B12.13 another Manual owner unchanged
- B12.14 unrelated Autorun owner unchanged
- B12.15 binding intact
- B12.16 credentials/settings outside Manual flag intact
- B12.17 verified analytics cache byte/structurally unchanged
- B12.18 quota state byte/structurally unchanged
- B12.19 `last_provider_request_at` unchanged
- B12.20 `next_allowed_at` unchanged
- B12.21 60000/5000/65000 timing unchanged
- B12.22 Retry-After extension state unchanged
- B12.23 cancellation/re-enable zero provider requests/replay
- B12.24 OFF->ON public worker state reports Manual ready with no new operation
- B12.25 UI state-sync makes new Ozon controls usable again
- B12.26 new cold-cache request after OFF->ON obeys previously persisted same-Seller deadline

### B13 — UI/bindings/owner isolation (`10`)

- B13.01 Ozon controls structurally bind for current ChatGPT/Alice architecture
- B13.02 native ChatGPT Copy independent
- B13.03 native Copy does not mutate bridge operation state
- B13.04 busy/ready button follows worker-owned state
- B13.05 Manual toggle remains available for cancelling active Manual pending report when Autorun is not blocker
- B13.06 two ChatGPT owners do not overwrite each other
- B13.07 ChatGPT/Alice ownership isolated
- B13.08 one owner due/delivery does not clear another owner's wait
- B13.09 content restart restores only correct owner durable state
- B13.10 no global current-conversation assumption

### B14 — Performance boundary (`4`)

- B14.01 Seller changes do not alter Performance host/auth semantics
- B14.02 Performance-only requests zero Seller capability probes
- B14.03 Seller quota/cache not applied to unrelated Performance requests
- B14.04 no real Performance request in automated gate

### B15 — Browser/runtime robustness (`7`)

- B15.01 MV3 service worker loads in accepted browser
- B15.02 extension installs through accepted Puppeteer runtime path
- B15.03 content script initializes on supported synthetic pages
- B15.04 page/content lifecycle restart does not duplicate owner/provider/insertion/Send
- B15.05 network interception proves zero real Seller/Performance calls
- B15.06 unexpected runtime/console failures invalidate affected test
- B15.07 harness/environment failures distinguished from production assertion failures

## 5. Mandatory coverage additions discovered during validator audit

The final current-run helpers must explicitly exercise these items; they may not be inferred from neighboring markers:

1. B12.15/B12.16 — binding plus credentials/settings preserved across OFF->ON.
2. B12.22 — a seeded Retry-After-extended deadline/state remains structurally unchanged across OFF->ON.
3. B12.26 — after OFF->ON, a new **cold-cache** same-Seller analytics request before the persisted deadline performs zero provider calls, enters quota wait with due not earlier than that existing deadline, and only after due can one mocked provider call occur.
4. B13.05 — Manual toggle remains accessible while a Manual claimed report waits and Autorun is not the blocking owner.
5. B10.06/B10.07 — after extension delivery finishes, later ordinary user Send is untouched; disabled Send, Stop, Unknown and Microphone variants are never treated as Send.
6. B11.09/B13.10 — explicit wrong-owner composer/no-global-current-conversation negative tests.
7. B14.01-B14.03 — behavioral Performance regression: fixed Performance host/auth preserved; zero Seller probe; no Seller quota/cache application.
8. B15.04 — restart/lifecycle tests cover both quota-countdown owner state and composer-wait/delivery without duplication.

## 6. Packaging hard interlock

Block 16 is not part of the 164 functional assertions and is unreachable until all B01-B15 are literal `PASS` from the current assertion ledger.

Before any ZIP creation/copy operation the top-level runner must execute a literal runtime interlock equivalent to:

```js
for (let i = 1; i <= 15; i++) {
  const k = String(i).padStart(2, '0');
  if (blocks[k] !== 'PASS') throw new Error(`PACKAGING_FORBIDDEN_BLOCK_${k}_NOT_PASS`);
}
```

No pre-existing RERUN ZIP/path/hash is reusable. A valid package must be built fresh from the exact tested 17-file tree after the interlock, fresh-extracted, byte-compared file-by-file, syntax/manifest rechecked and assigned a new SHA-256.

Only then may B16=`PASS` and only B01-B16 all PASS may emit `OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`.
