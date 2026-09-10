# Alice large-result document delivery — dependency closure

Scope: authorized post-result delivery repair only. Pre-handoff provider calls: 0.

| # | Dependency | Authority/path | Verified behavior | Status |
|---|---|---|---|---|
| 01 | Alice capability profile | `shared/ai_delivery_capabilities.js` | 90k UTF-16 threshold + file_input_v1 | `PASS` |
| 02 | ChatGPT threshold isolation | `shared/ai_delivery_capabilities.js` | 1,048,000 Unicode-code-point behavior unchanged | `PASS` |
| 03 | Generated text decision metric | `shared/ai_delivery_capabilities.js` | Alice surrogate pairs cannot be undercounted | `PASS` |
| 04 | Alice origin/profile mapping | `shared/ai_delivery_capabilities.js` | alice.yandex.ru resolves Alice profile | `PASS` |
| 05 | File type policy | `shared/ai_delivery_capabilities.js` | TXT/PDF/DOC/DOCX allowlist retained | `PASS` |
| 06 | Alice file byte limit | `shared/ai_delivery_capabilities.js` | 100 MiB enforced | `PASS` |
| 07 | Alice one-file limit | `capabilities + attachment port` | max_files_per_turn=1; excess bundle fails closed | `PASS` |
| 08 | Alice composer context | `shared/ai_adapters.js` | existing standalone-input context preserved | `PASS` |
| 09 | Alice file-input resolver | `shared/ai_adapters.js` | composer-scoped document input; ambiguity fails closed | `PASS` |
| 10 | Unrelated/global input exclusion | `shared/ai_adapters.js` | no global file-input fallback outside Alice composer scopes | `PASS` |
| 11 | Image-only input exclusion | `shared/ai_adapters.js` | image-only candidate cannot steal document delivery | `PASS` |
| 12 | Alice attachment preview resolver | `shared/ai_adapters.js` | exact filename attributable near composer | `PASS` |
| 13 | Alice attachment readiness | `shared/ai_adapters.js` | visible exact preview required; busy/uploading/missing fails closed | `PASS` |
| 14 | Browser File/DataTransfer path | `shared/web_file_attachment.js + browser fixture` | one exact File; name/bytes preserved | `PASS` |
| 15 | Attachment surface consumer | `attachment_delivery_port_content.js` | existing generic port consumes adapter surface | `PASS` |
| 16 | Local artifact metadata | `attachment_delivery_port_content.js` | descriptor required before file creation | `PASS` |
| 17 | Local artifact chunks | `attachment_delivery_port_content.js` | bounded local chunk transport; no Ozon refetch | `PASS` |
| 18 | Attachment SHA-256 integrity | `attachment_delivery_port_content.js` | complete bytes checked before UI attach | `PASS` |
| 19 | Attachment count guard | `attachment_delivery_port_content.js` | over-budget bundle stops explicitly | `PASS` |
| 20 | Attachment commit | `attachment_delivery_port_content.js` | commit-before-UI mutation semantics retained | `PASS` |
| 21 | Committed attach recovery | `attachment_delivery_port_content.js` | unknown outcome never auto-reattaches | `PASS` |
| 22 | Ready acknowledgement | `attachment_delivery_port_content.js` | preview proof required before Send | `PASS` |
| 23 | Send commit/recovery | `attachment_delivery_port_content.js` | exactly-once; unknown committed Send never auto-resends | `PASS` |
| 24 | Manual result planning | `service_worker.js` | manual collected result uses shared batch delivery planning | `PASS_UNCHANGED` |
| 25 | Autorun result planning | `service_worker.js` | autorun collected result uses shared batch delivery planning | `PASS_UNCHANGED` |
| 26 | Generated TXT materialization | `shared/bridge_autorun_model.js` | complete text becomes one TXT; no truncation | `PASS_UNCHANGED_GENERIC_PATH` |
| 27 | Original provider-file preservation | `bridge model + delivery policy` | provider bytes/ref semantics unchanged | `PASS_UNCHANGED_GENERIC_PATH` |
| 28 | Mixed-batch companion policy | `shared/file_delivery_model_policy.js` | existing completeness policy preserved; one-file budget guarded downstream | `PASS` |
| 29 | Attachment persistence | `bridge model + service worker` | attachment phases remain durable/recoverable | `PASS` |
| 30 | MV3 service-worker bootstrap | `entry + manifest` | real Chrome extension bootstrap | `PASS` |
| 31 | Manifest Alice host permission | `manifest.json` | alice.yandex.ru host already allowed | `PASS_UNCHANGED` |
| 32 | Content-script dependency order | `manifest.json` | capabilities→adapters→web file→attachment port preserved | `PASS_UNCHANGED` |
| 33 | Ozon provider request path | `service_worker/provider modules` | no provider/request/auth executable diff | `PASS_UNCHANGED` |
| 34 | Command-envelope contract | `command regressions` | parser/cardinality unchanged | `PASS` |
| 35 | Mixed HELP/API | `mixed-help regressions` | ordered mixed behavior unchanged | `PASS` |
| 36 | Hidden retry/pagination/fanout | `shared regressions + diff audit` | none added | `PASS` |
| 37 | Privacy/entitlement | `no related production diff` | policy not weakened | `PASS_UNCHANGED` |
| 38 | Startup/bootstrap prompt | `no related production diff` | separate prompt-content issue not bundled | `PASS_UNCHANGED` |
| 39 | Linux exact-source regression | `CI runner` | targeted + shared + browser gates | `PASS` |
| 40 | Deterministic ZIP/fresh extraction | `CI runner` | exact installable artifact verified | `PASS` |
| 41 | Windows exact-source/package regression | `CI Windows job` | exact tested source and exact ZIP verified | `PASS` |
| 42 | Live Alice current DOM | `installed Alice web UI` | real current file-input/preview behavior | `PENDING_POST_INSTALL` |
| 43 | Live >90k result delivery | `installed Alice + explicit Ozon read` | one complete TXT; exactly one Send; no Ozon retry | `PENDING_POST_INSTALL` |

Unaccounted dependencies: **0**.
Stale assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies: **2**, both explicitly `PENDING_POST_INSTALL`.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**

Live-only checks are not promoted to PASS by deterministic CI.
