# Alice auto-send blocked guard — dependency closure

Exact executable source commit: `345ac3601f36b115e58c800be15a342aee10b4b6`
Exact executable source tree: `8b3cdccbf8af144bee253de875112125a7d16049`
Final CI workflow run: `34558176431`

| # | Dependency | Authority/path | Verified behavior | Status |
|---|---|---|---|---|
| 01 | Owner authorization | `current project chat` | Alice post-attachment Send corrective patch explicitly authorized | `PASS` |
| 02 | Historical package preservation | `prior corrective evidence` | old drag-drop package/hash remain immutable historical evidence | `PASS` |
| 03 | Live failure boundary | `owner screenshot + diagnostic export` | TXT attached and marker staged; auto-Send absent | `PASS` |
| 04 | Provider cardinality evidence | `diagnostic export` | successful business read executed once; blocked personal-data item stayed local | `PASS` |
| 05 | Pre-fix deterministic reproduction | `run 34557623845` | blocked Oknyx accepted; one click event; zero submitted turns | `PASS` |
| 06 | Current Alice public source | `first-party yastatic bundle` | Oknyx/inputStore contract read from current public bundle | `PASS` |
| 07 | First-party source integrity | `public source probe` | bundle SHA-256 fb482e6ff25c77ed12081dd1cdab44c871297b9318b702c08843907e8aef619d | `PASS` |
| 08 | Oknyx identity | `first-party bundle` | button#oknyx-button[data-testid=oknyx] | `PASS` |
| 09 | Send aria contract | `first-party bundle` | arrow state aria-label is Отправить | `PASS` |
| 10 | Native disabled contract | `first-party bundle` | native disabled predicate is separate from inputStore blocked state | `PASS` |
| 11 | Blocked submit contract | `first-party bundle` | inputStore.status=blocked makes Oknyx submit handler no-op | `PASS` |
| 12 | Blocked DOM signal | `first-party BEM cn contract` | blocked input state emits StandaloneOknyx_error | `PASS` |
| 13 | BEM mapping integrity | `module 16955 public probe` | boolean modifier uses '_' separator; exact class proven | `PASS` |
| 14 | Alice adapter guard | `shared/ai_adapters.js` | StandaloneOknyx_error reused as send_disabled | `PASS` |
| 15 | No new control kind | `source gate + sweep` | send_blocked enum/state not introduced | `PASS` |
| 16 | Clean Alice Send state | `pinned Chrome fixture` | unblocked active Send remains accepted | `PASS` |
| 17 | Transient blocked state | `pinned Chrome fixture` | target waits through blocked state then resolves after unblock | `PASS` |
| 18 | Persistent blocked state | `pinned Chrome fixture` | target times out fail-closed with zero extra click | `PASS` |
| 19 | Ready/microphone negative | `pinned Chrome fixture` | not accepted as Send | `PASS` |
| 20 | Stop negative | `pinned Chrome fixture` | not accepted as Send | `PASS` |
| 21 | Native disabled negative | `pinned Chrome fixture` | not accepted as Send | `PASS` |
| 22 | Marker integrity | `composer_send + browser fixture` | marker must remain exact before click | `PASS` |
| 23 | Stable target sampling | `composer_send regression` | three stable validated samples required | `PASS` |
| 24 | Target before commit ordering | `attachment_delivery_port_content.js` | waitForValidatedTarget precedes SEND_COMMIT | `PASS` |
| 25 | Commit before click ordering | `attachment_delivery_port_content.js` | SEND_COMMIT precedes clickSynchronously | `PASS` |
| 26 | Send commit cardinality | `source gate + worker state machine` | one commit call site; duplicate commit cannot click twice | `PASS` |
| 27 | Click cardinality | `source/browser gate` | one click call site; clean transition exactly one click | `PASS` |
| 28 | Unknown click outcome | `existing delivery logic` | observed click without user-turn never auto-resends | `PASS` |
| 29 | Safe rollback | `port worker regression` | rollback only for proven no-click outcome | `PASS` |
| 30 | Attachment transport | `Alice DnD regressions` | drag_drop_v1 preserved | `PASS` |
| 31 | Attachment readiness | `Alice DnD browser fixture` | exact preview readiness and negatives preserved | `PASS` |
| 32 | Generated full TXT | `large-result regression` | complete generated result becomes one TXT; no truncation | `PASS` |
| 33 | Alice 90k boundary | `large-result regression` | 90,000 text / 90,001 document, UTF-16 safe | `PASS` |
| 34 | ChatGPT threshold isolation | `large-result regression` | 1,048,000/1,048,001 semantics unchanged | `PASS` |
| 35 | ChatGPT transport isolation | `browser/source regression` | file_input_v1 unchanged | `PASS` |
| 36 | Original provider bytes | `direct-binary regression` | provider file byte semantics unchanged | `PASS` |
| 37 | Artifact SHA integrity | `delivery regression` | complete attachment bytes validated before UI mutation | `PASS` |
| 38 | MV3 lifecycle | `wake/live-stop regressions` | recovery and wake path retained | `PASS` |
| 39 | Real Chrome MV3 bootstrap | `extension worker smoke` | service worker/IndexedDB/report capture bootstrap | `PASS` |
| 40 | Mixed HELP/API | `mixed-help regressions` | ordered mixed command behavior unchanged | `PASS` |
| 41 | Command envelope | `command-envelope regressions` | parser/cardinality unchanged | `PASS` |
| 42 | Personal-data policy | `live evidence + no scoped diff` | OPERATION_DISABLED_BY_USER remains local; no bypass | `PASS` |
| 43 | Provider/auth path | `exact production diff` | no provider/auth/request production changes | `PASS_UNCHANGED` |
| 44 | Hidden retry/pagination/fanout | `diff + regressions` | none added | `PASS` |
| 45 | Security/redaction | `exact production diff + direct binary regression` | credentials/base64/protected URL handling unchanged | `PASS_UNCHANGED` |
| 46 | Secondary consumer sweep | `final exact-source audit` | old unsafe one-line Alice Send classifier absent across dist | `PASS` |
| 47 | Manifest dependency order | `manifest.json` | shared/ai_adapters.js loaded before content_script and attachment port | `PASS_UNCHANGED` |
| 48 | Linux exact-source chain | `final CI` | syntax/source/browser/MV3/shared/package gates | `PASS` |
| 49 | Windows exact-source chain | `final CI` | source/shared/package canonical Git-blob parity | `PASS` |
| 50 | Deterministic ZIP | `Linux+Windows final CI` | exact member set/SHA/bytes/fresh extraction | `PASS` |
| 51 | Installed exact new ZIP | `owner browser` | install exact new package | `PENDING_POST_INSTALL` |
| 52 | Live blocked-state wait | `installed exact new ZIP` | if Alice exposes blocked modifier Bridge must not commit/click until clear | `PENDING_POST_INSTALL` |
| 53 | Live large-result auto-Send | `installed exact new ZIP + explicit read` | one complete TXT, one Send, no delivery-triggered provider retry | `PENDING_POST_INSTALL` |
| 54 | Live continuation/reload | `installed exact new ZIP` | post-Send user-turn and MV3 recovery confirmed | `PENDING_POST_INSTALL` |

Unaccounted pre-handoff dependencies: **0**.
Stale active assumptions after secondary sweep: **0**.
Available-but-unverified pre-handoff dependencies: **0**.
Live-only dependencies: **4**, all explicitly `PENDING_POST_INSTALL`.

**DEPENDENCY VERDICT: PASS FOR PRE-HANDOFF SCOPE**

No live-only check is promoted by deterministic CI.
