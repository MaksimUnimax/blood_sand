# Alice drag-drop corrective patch — dependency closure

Exact executable source commit: `39eadd2699320774ef53964ea8cf347057c1b813`
Exact executable source tree: `f8ec34c4754fb7369a5dbff618705b1d01c6e048`
Final CI workflow run: `34553534490`

| # | Dependency | Authority/path | Verified behavior | Status |
|---|---|---|---|---|
| 01 | Live failure authority | `owner live run + saved Alice HTML` | old persistent file-input model disproven | `PASS` |
| 02 | Owner authorization | `current project chat` | corrective patch explicitly authorized | `PASS` |
| 03 | Live Alice release/source trace | `saved alice.yandex.ru HTML` | release-v1.139.0-2026.09.09; source hash recorded | `PASS` |
| 04 | Alice composer textarea | `saved live HTML` | data-testid=inputbase-textarea | `PASS` |
| 05 | Alice plus capability marker | `saved live HTML` | InputControls-Plus-Button / Добавить файл / aria-haspopup=dialog | `PASS` |
| 06 | Temporary picker semantics | `saved live first-party bundle` | pick-file-input-element is created, clicked, removed | `PASS` |
| 07 | Body drag/drop ingress | `saved live first-party bundle` | body capture listeners consume dataTransfer.files | `PASS` |
| 08 | First-party ingress label | `saved live first-party bundle` | inputFilesStore.addFiles(..., drag_and_drop) | `PASS` |
| 09 | Pre-production browser probe | `pinned Chrome 152 fixture` | DataTransfer dragenter→dragover→drop works with zero persistent input | `PASS` |
| 10 | Alice capability profile | `shared/ai_delivery_capabilities.js` | 90k UTF-16 + drag_drop_v1 | `PASS` |
| 11 | ChatGPT strategy isolation | `shared/ai_delivery_capabilities.js` | file_input_v1 retained | `PASS` |
| 12 | ChatGPT threshold isolation | `shared/ai_delivery_capabilities.js` | 1,048,000 Unicode-code-point behavior retained | `PASS` |
| 13 | Alice text threshold boundaries | `runtime gate` | 89,999/90,000 text; 90,001/364,805 document | `PASS` |
| 14 | UTF-16 surrogate safety | `runtime gate` | emoji cannot undercount Alice composer units | `PASS` |
| 15 | Alice file allowlist | `capability profile` | TXT/PDF/DOC/DOCX only | `PASS` |
| 16 | Alice file size | `capability profile` | 100 MiB limit retained | `PASS` |
| 17 | Alice file-count budget | `capability + content port` | max_files_per_turn=1; excess fails closed | `PASS` |
| 18 | Alice composer shell | `shared/ai_adapters.js` | known live textarea + controls + plus marker required | `PASS` |
| 19 | Alice drag target | `shared/ai_adapters.js` | document.body only after live capability markers resolve | `PASS` |
| 20 | Unrelated file inputs | `browser adapter fixture` | global file input cannot become Alice transport | `PASS` |
| 21 | Browser drop primitive | `shared/web_file_attachment.js` | File/DataTransfer integrity + exactly 3 drag events | `PASS` |
| 22 | No picker/click in DnD primitive | `runtime/source gate` | dispatchFileDrop contains no click path | `PASS` |
| 23 | Adapter-owned transport abstraction | `AI adapters + content port` | generic port calls active.attachFiles once | `PASS` |
| 24 | ChatGPT adapter-owned file-input path | `AI adapter + browser primitive` | existing setInputFiles path retained | `PASS` |
| 25 | Alice preview resolver | `shared/ai_adapters.js` | exact filename only within Alice input scopes; ambiguity fails closed | `PASS_DETERMINISTIC` |
| 26 | Alice readiness negatives | `browser adapter fixture` | missing/uploading/error/hidden preview blocks Send | `PASS_DETERMINISTIC` |
| 27 | Live attached-file DOM/readiness | `installed corrective ZIP on alice.yandex.ru` | actual post-drop preview structure/readiness | `PENDING_POST_INSTALL` |
| 28 | Artifact metadata | `content port` | descriptor required before local File construction | `PASS` |
| 29 | Artifact chunk transport | `content port` | bounded local chunks; no Ozon refetch | `PASS` |
| 30 | Artifact SHA-256 | `content port` | complete bytes verified before UI mutation | `PASS` |
| 31 | Attachment commit ordering | `content port` | OZ_ATTACHMENT_COMMIT precedes single UI mutation | `PASS` |
| 32 | Post-commit unknown outcome | `content port` | no automatic second drop/reattach | `PASS` |
| 33 | Committed recovery | `content port` | only existing preview may reconcile | `PASS` |
| 34 | Ready acknowledgement | `content port` | ready proof required before Send | `PASS` |
| 35 | Send single-flight | `port worker state machine` | exactly-once commit; safe pre-click rollback | `PASS` |
| 36 | Unknown Send outcome | `content port` | never auto-resends committed Send | `PASS` |
| 37 | Manual planning | `service worker shared path` | unchanged | `PASS_UNCHANGED` |
| 38 | Autorun planning | `service worker shared path` | unchanged | `PASS_UNCHANGED` |
| 39 | Generated full TXT | `Bridge model/policy` | no truncation; complete generated document retained | `PASS` |
| 40 | Original provider bytes | `direct-binary regression` | original report bytes/ref semantics retained | `PASS` |
| 41 | Mixed report completeness | `mixed-batch regression` | companion document policy retained | `PASS` |
| 42 | Attachment lifecycle persistence | `wake + live-stop regressions` | MV3 recovery path retained | `PASS` |
| 43 | MV3 service-worker bootstrap | `real Chrome extension smoke` | bootstrap/IndexedDB/report capture active | `PASS` |
| 44 | Manifest/host permission | `manifest unchanged` | Alice host permissions unchanged | `PASS_UNCHANGED` |
| 45 | Model-policy closed set | `file_delivery_model_policy.js` | only file_input_v1 + drag_drop_v1 implemented strategies | `PASS` |
| 46 | Worker closed set | `file_delivery_port_worker.js` | only file_input_v1 + drag_drop_v1 admitted | `PASS` |
| 47 | Content-port closed set | `attachment_delivery_port_content.js` | no persistent-input assumption remains | `PASS` |
| 48 | Secondary sweep | `post-patch exact-source audit` | active stale assumptions=0 | `PASS` |
| 49 | Ozon provider/auth path | `exact production diff + regressions` | no provider/request/auth change | `PASS_UNCHANGED` |
| 50 | Logical/physical accounting | `capture/accounting regressions` | unchanged | `PASS` |
| 51 | Hidden retry/pagination/fanout | `diff + regressions` | none added | `PASS` |
| 52 | Privacy/entitlement | `no scoped executable diff` | unchanged | `PASS_UNCHANGED` |
| 53 | Command envelopes | `command-envelope regressions` | unchanged | `PASS` |
| 54 | Mixed HELP/API | `mixed HELP/API regressions` | unchanged | `PASS` |
| 55 | Linux exact-source chain | `final CI` | source/browser/MV3/regressions/package | `PASS` |
| 56 | Windows exact-source chain | `final CI` | source/regressions/package fresh extraction | `PASS` |
| 57 | Deterministic ZIP | `Linux+Windows final CI` | exact SHA/bytes + fresh extraction parity | `PASS` |
| 58 | Installed corrective ZIP | `owner browser` | exact ZIP installation | `PENDING_POST_INSTALL` |
| 59 | Live local Alice DnD attachment | `installed corrective ZIP` | one TXT appears through actual Alice UI | `PENDING_POST_INSTALL` |
| 60 | Live >90k Ozon delivery | `installed corrective ZIP + explicit read` | one complete TXT / one Send / no Ozon retry | `PENDING_POST_INSTALL` |
| 61 | Live continuation/recovery | `installed corrective ZIP` | post-send continuation and reload recovery | `PENDING_POST_INSTALL` |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies: **4**, all explicitly `PENDING_POST_INSTALL`.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**

The saved clean Alice DOM proves the first-party drag/drop ingress contract. The exact DOM of a successfully attached file in the installed corrective build is intentionally not promoted to proven until post-install live testing.
