# Ozon Bridge v0.1.19 — список тестов, которые должен выполнить Codex перед передачей сборки

Дата: 2026-08-19
Статус: `CODEX_TEST_CHECKLIST`

Это **только список тестов**.

Codex — независимый проверяющий. Он должен выполнить перечисленные ниже проверки над точной текущей сборкой и выдать один итоговый отчёт.

Не требуется создавать отдельный «валидатор», новую архитектуру тестов, RERUN-планы, authority bundles, assertion-ledger инфраструктуру или промежуточные отчёты.

## Правило выполнения

- Выполнить весь checklist в **одной задаче Codex** перед передачей сборки оператору.
- Использовать существующие tests/harnesses и обычные временные test-only fixtures/commands, необходимые для проверки конкретного пункта.
- Codex может менять только временные test-only копии harnesses/fixtures и итоговый report. Production candidate изменять запрещено.
- Не возвращаться пользователю после первой обычной ошибки test/harness/environment. Выполнить остальные независимые безопасные проверки и собрать полный доступный failure set в одном итоговом отчёте.
- Провал одного monolithic/historical harness **не имеет права автоматически блокировать независимые блоки**. Если harness упал до нужного assertion, Codex обязан проверить этот независимый блок отдельной test-only fixture/command в этой же задаче.
- `BLOCKED_BY` допустим только если конкретный test действительно невозможно выполнить из-за провалившегося prerequisite. Нельзя помечать B02–B10 blocked только потому, что другой worker/browser harness завершился раньше.
- Historical PASS не является текущим PASS: применимое поведение проверяется на exact current candidate.
- Реальные operator/browser действия в automated gate не требуются.

## Отброшенный отчёт 4f9bd6…

Report commit `4f9bd6ba2c64a8cbfba9e14c5c25c52501702fd8` **не является PASS evidence**.

Его `B01 PASS` ошибочен как gate classification, потому что reconstructed hashes:

- worker `a943160760e21df0f04b9ef3787350a7527205d5ae67cea105349d033bf8f95e`;
- content `82f7d75e4c954e26a2b984e49b8ef9cbdafaa81cfab4681f8bbd015d808092dc`

не совпали с уже доказанной exact reconstruction из frozen ZIP + exact patch:

- worker `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- content `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`.

Две одинаковые A/B реконструкции недостаточны, если обе были сделаны способом, который изменил bytes вне patch hunks (например line-ending conversion).

## Exact candidate identity

Входная authority candidate:

1. exact frozen ZIP:
   `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
2. frozen ZIP SHA-256:
   `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
3. exact repair patch =
   `development/manual-delivery-composer-wait/patch-parts/00.patch.part`
   +
   `development/manual-delivery-composer-wait/patch-parts/01.patch.part`
   в этом порядке;
4. patch bytes: `13648`;
5. patch SHA-256:
   `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
6. starting frozen hashes:
   - worker `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
   - content `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
7. required exact final hashes:
   - worker `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
   - content `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`.

Эти final hashes уже были получены из exact frozen artifact + exact patch в report `ee33f38a56e860dac7f2605de496b24c230516e9` с `git -c core.autocrlf=false apply --check` и exact apply. Content hash `ab3408…` также отдельно закреплён candidate checkpoint `1de4cea770fc8ae09280e65d13e60525fd22e4e7`.

### Обязательная reconstruction

Создать две fresh директории `candidate-A` и `candidate-B`.

Для каждой независимо:

1. fresh-extract exact frozen ZIP;
2. проверить ZIP SHA-256;
3. проверить starting worker/content hashes;
4. собрать exact patch и проверить bytes/SHA-256;
5. из корня extracted production tree выполнить exact check:
   `git -c core.autocrlf=false apply --check <exact-patch>`;
6. затем применить ровно один раз:
   `git -c core.autocrlf=false apply <exact-patch>`;
7. не использовать PowerShell/редактор/скрипт, который decode/re-encode или нормализует EOL production files;
8. не использовать fuzz/manual/context repair;
9. inventory = ровно 17 production files;
10. changed files = только `service_worker.js`, `content_script.js`;
11. protected 15 = byte-identical frozen ZIP;
12. SHA-256 worker/content обязаны быть ровно:
    - `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
    - `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
13. A и B сравнить byte-for-byte по всем 17 files.

Только если все пункты выше PASS, exact candidate считается зафиксированным. После этого production candidate bytes неизменяемы до packaging.

Если A/B одинаковы, но final hashes другие — это `CANDIDATE_RECONSTRUCTION_FAILURE`, а не новая candidate identity.

## Existing harnesses — допустимая test-only адаптация

Разрешено копировать historical harness во временную test-only директорию и менять только stale integrity/fixture/transport preconditions, необходимые для исполнения **того же behavioral assertion**.

Запрещено удалять/ослаблять behavioral assertions или менять production.

### Worker/quota fixture

Для carry-forward worker harness blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`:

- expected worker/content hashes заменить на exact current hashes `dfc101…` / `ab3408…`;
- НЕ заменять guarded-due scenario на произвольный `last=now-57000`;
- использовать утверждённую validation-only correction blob `44e396b9a566f0c33ba3e50ed6dc3dba07770a4d`:
  - после получения persisted `waiting.batch.quota_wait.next_allowed_at` определить `persistedDue`;
  - require `persistedDue > 0`;
  - require `persistedDue >= locally calculated due`;
  - ждать до `persistedDue + 250 ms`;
  - вызвать synthetic quota alarm;
  - ждать provider call до `10000 ms`;
  - require exactly one mocked provider call;
  - require call time `>= persistedDue - 5 ms`;
  - existing duplicate-call assertion после этого остаётся обязательным.

Это fixture timing correction, behavioral quota assertions не ослабляются.

### Regression carry-forward

Historical carry-forward harness blob `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` использовать как behavioral catalog, но:

- base для composer-wait carry-forward = exact frozen ZIP (`34a84…` / `d95d…`), а candidate = exact current `dfc101…` / `ab3408…`;
- stale Step4/V3 hash preconditions заменить на эти exact hashes;
- exact-function assertions для worker regions, которые composer-wait patch не меняет, сохраняются;
- `buildBatchQueryPlan` и прочие planner/quota/cache functions не должны drift-ить из-за EOL reconstruction;
- если exact current candidate hashes правильные, а unchanged protected function отличается — это реальная integrity/regression проблема и должна быть исследована как current-candidate failure, а не автоматически списана на stale fixture.

### Browser/runtime transport

Legacy V3 browser harness blob `841429741d5ff9144a8a40506e657dc4392fe37c` содержит старый transport (`browser.newPage()` и старый launch flow). **Его нельзя запускать как есть.**

Его behavioral assertions можно переносить в test-only fixture, но transport обязан использовать уже квалифицированный Windows/CFT/raw-CDP substrate из corrections `ba0f541bea478db22086bbcc15eb5cab713bae15`, `376886cd29d971a354dc18f313fbeb9ba1153922` и integrated mechanics `53f451835ccb8ab3461cae74c6fbd93aa06a94a9`:

- Node `v24.12.0`;
- Puppeteer `25.4.0`;
- CFT `151.0.7922.47`;
- validation-owned byte-identical CFT copy;
- copied `setup.exe --configure-browser-in-directory=<copiedBrowserDir>` once, `shell:false`, require exit `78`;
- fresh validation profile;
- `ignoreDefaultArgs:true`;
- `headless:false`;
- `enableExtensions:true`;
- `waitForInitialPage:false`;
- `dumpio:true`;
- exact launch args:
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
- не использовать `--disable-gpu-sandbox`;
- не использовать `browser.newPage()`;
- browser-level `Target.createTarget({url:'about:blank'})`;
- resolve raw PAGE target/CDP;
- `Runtime.enable`, `Page.enable`, `Fetch.enable`;
- supported ChatGPT/Alice synthetic navigation fulfilled locally through interception;
- `browser.installExtension(candidateDir)` / dynamic extension id;
- `extension.triggerAction()` запрещён;
- worker: если `extension.workers()` уже видит candidate worker — использовать его; иначе raw PAGE `ServiceWorker.enable` + exact registration + `ServiceWorker.startWorker({scopeURL})` ровно один раз;
- worker runtime: `worker.client.send('Runtime.enable')`, затем direct `Runtime.evaluate('1+1')`; `worker.evaluate()` / `worker.evaluateHandle()` запрещены;
- при необходимости fallback на raw active service-worker CDP target/session той же worker instance без restart;
- worker `Network.enable` до worker behavioral tests;
- browser liveness проверять после worker qualification.

`--no-sandbox` разрешён только для disposable isolated synthetic validator CFT/profile и не должен попадать в production/package/operator Chrome.

Во всех automated tests:

- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser tests;
- реальные Seller/Performance credentials не использовать;
- production modifications by Codex = `0`.

# 1. Candidate integrity

Проверить:

- exact frozen ZIP SHA-256;
- exact patch bytes/SHA-256;
- exact `core.autocrlf=false` patch check/apply;
- candidate-A и candidate-B exact final worker/content hashes;
- A/B byte-identical по 17 files;
- production inventory = 17;
- changed files = только worker/content;
- protected 15 byte-identical frozen ZIP;
- unchanged regions/functions внутри worker/content не получили EOL/global rewrite вне intended patch hunks;
- все production `.js` проходят `node --check`;
- `manifest.json` валиден;
- permissions/host_permissions не расширились неожиданно;
- tests/reports/dev files/credentials отсутствуют в production tree.

# 2. Command discovery и строгий контракт

Проверить независимо, даже если worker quota/browser harness позже падает:

- команды корректно обнаруживаются в поддерживаемых ChatGPT/Alice code blocks/messages;
- произвольный окружающий Markdown/текст не создаёт лишние команды;
- поддерживаемые Unicode/separator варианты принимаются;
- malformed JSON не чинится молча;
- malformed/pre-execution failures дают 0 provider requests;
- analytics date/dimension/metric/filter/sort/limit/offset валидируются строго;
- product-query date/SKU/sort/page валидируются строго;
- удалённые/запрещённые операции недоступны;
- `posting_fbs_get` заблокирован PII boundary.

# 3. Provider/security boundary

Проверить независимо:

- только фиксированные Seller/Performance hosts;
- AI-текст не выбирает произвольный URL/host/method/headers/auth/credentials;
- mutation/write operations не открыты;
- credentials не попадают в AI-visible output;
- unsafe provider fields/bodies санитизируются;
- customer PII не выводится;
- нет скрытых retry/pagination/fan-out/polling;
- нет тихого truncation/invented generic caps;
- wrong tab/conversation/binding fail closed.

# 4. Seller capability / entitlement

Проверить независимо test-only worker fixture:

- capability probe внутренний и не AI-callable;
- raw seller-info identity/company fields не попадают в AI output;
- universal analytics делает 0 capability probes;
- relevant logical batch делает максимум 1 fresh capability probe;
- worker restart не replay-ит уже начатый capability probe;
- entitlement states явные;
- mixed universal/restricted analytics сохраняет утверждённую partial semantics;
- all-restricted/no-executable analytics делает 0 business requests;
- restricted dimension/filter/sort/history semantics fail closed;
- Performance-only flow делает 0 Seller capability probes.

# 5. Query planner / coalescing / projection

Проверить независимо:

- coalescing только contiguous compatible analytics commands;
- различающиеся non-metric semantics не объединяются;
- metric union deterministic и в пределах contract maximum;
- logical requests/results раздельны после одного physical request;
- projection использует verified physical metric order;
- unprovable projection fail closed;
- projection failure/provider error не replay-ит provider request;
- restart после начатого physical group не replay-ит его вслепую.

# 6. Global Seller quota scheduler

Проверить с persisted-due fixture correction выше:

- family `seller.analytics_data.v1`;
- provider minimum `60000` ms;
- bridge safety `5000` ms;
- effective interval `65000` ms;
- один Seller делит bucket между tabs/conversations/ChatGPT/Alice;
- разные Seller accounts изолированы;
- Api-Key rotation при том же Client-Id сохраняет account scope и меняет credential revision;
- raw credentials отсутствуют в quota persistence;
- concurrent acquisition выдаёт ровно один permit;
- cache miss не обходит quota;
- один coalesced physical request расходует один permit;
- pre-provider `quota_waiting` переживает MV3 restart;
- persisted due wake создаёт ровно один mocked provider call;
- provider call не начинается раньше persisted `next_allowed_at`;
- requesting/already-attempted work не replay-ится startup/alarm;
- immediate retry отсутствует;
- Retry-After только продлевает, но не сокращает due;
- public quota state содержит только safe timing metadata.

# 7. Response verifier / safe errors

Проверить независимо:

- successful analytics payload проверяется до projection/cache;
- invalid HTTP-200 payload становится safe mismatch после единственной provider attempt;
- verifier failure не вызывает retry;
- HTTP 429 безопасен и только продлевает Retry-After state;
- transport errors сохраняют truthful attempted-request provenance;
- storage/credential failure до fetch даёт 0 provider requests;
- `automatic_retry:false` правдив.

# 8. Verified analytics cache / prefetch

Проверить независимо:

- cache принимает только successful verified analytics responses;
- cache lookup идёт до quota;
- TTL = `60000` ms;
- same Seller + exact non-metric semantics + safe metric superset может дать hit;
- другой Seller/incompatible semantics/expired entry дают miss;
- provider error/malformed response не кэшируются;
- credentials отсутствуют в cache serialization;
- projection из metric superset deterministic;
- cache hit сообщает `external_request_executed:false`;
- `analytics_basic_metrics_v1` расширяет только утверждённый universal subset;
- prefetch не добавляет restricted metrics и не меняет прочие semantics;
- совместимый следующий request может дать cache hit без второго provider call/quota acquisition;
- cache hit/lookup не портит quota state.

# 9. Manual / Autorun common batch engine

Проверить независимо:

- одна команда остаётся one-entry batch;
- multi-command order сохраняется;
- несколько physical requests строго serial;
- malformed/validation entries следуют safe continuation semantics;
- completed entries не replay-ятся после recovery;
- old-worker `requesting` ambiguity fail closed;
- нет unintended intermediate chat delivery;
- final batch report сохраняет logical order/count и truthful physical count;
- Manual/Autorun ownership разделены.

# 10. Delivery FSM — нормальный пустой composer

Проверить current candidate browser/test-only fixture:

- ready report + empty правильный composer входит в insertion path;
- только правильный owner/conversation;
- worker insert commit остаётся irreversible permission boundary;
- report вставляется ровно один раз;
- staged recognized Send нажимается максимум один раз;
- последующий обычный user Send не затрагивается;
- disabled Send / Stop / Unknown / Microphone не считаются Send;
- Microphone/current accepted AI-ready marker подтверждает success;
- completion очищает transient delivery и возвращает Manual readiness;
- recovery не replay-ит provider work.

# 11. Manual delivery — занятый или временно отсутствующий composer

Проверить current repair:

- чужой непустой composer text не очищается/заменяется/выделяется/отправляется;
- temporarily missing composer = recoverable pre-insert state, не terminal failure;
- occupied/missing composer не запрашивает worker insert commit;
- pending report остаётся worker-owned;
- при занятом composer plate точно `Очистите поле ввода, чтобы получить отчёт.`;
- plate не исчезает по timeout пока report pending;
- DOM observation/reacquisition работает, fallback polling bounded;
- правильный пустой composer → ровно один insert commit и одна вставка report;
- wrong-owner composer не используется;
- plate исчезает только после успешной вставки или explicit cancellation;
- content/page restart восстанавливает wait без duplicate insert/Send;
- downstream one-Send/Microphone flow сохраняется;
- composer waiting даёт 0 provider replay.

# 12. Manual OFF cancellation / OFF -> ON

Narrow cancellation только для pre-insert claimed delivery:

- `status === delivering`;
- `delivery.mode === batch_watch_v1`;
- `delivery.phase === claimed`;
- insert permission ещё не committed.

Проверить:

- удаляется только eligible pending operation текущего owner;
- останавливается только его composer waiter/plate;
- cancelled report не появляется после re-enable;
- OFF не удаляет `requesting`/`quota_waiting`;
- OFF не удаляет `insert_committed`;
- OFF не удаляет `inserted`;
- OFF flag сохраняется до cancellation;
- stale content runtime после OFF не получает insert permission;
- другой Manual owner не меняется;
- Autorun owner не меняется;
- binding сохраняется;
- credentials/settings кроме Manual flag сохраняются;
- verified cache не меняется;
- quota state не меняется;
- `last_provider_request_at` не меняется;
- `next_allowed_at` не меняется;
- `60000/5000/65000` не меняются;
- Retry-After state не меняется;
- OFF/re-enable делает 0 provider requests/replay;
- OFF -> ON Manual public state ready при отсутствии новой operation;
- UI Ozon control снова usable, old busy state не залипает;
- новый cold-cache same-Seller request после OFF -> ON соблюдает ранее сохранённый deadline.

# 13. UI / bindings / owner isolation

Проверить через qualified raw-CDP browser substrate:

- Ozon controls структурно bind-ятся в ChatGPT/Alice;
- native ChatGPT Copy независим;
- native Copy не меняет bridge operation state;
- busy/ready UI следует worker-owned state;
- Manual toggle доступен для cancellation pending Manual report, если Autorun не блокирует owner;
- два ChatGPT owner не перезаписывают друг друга;
- ChatGPT/Alice ownership изолирован;
- due/delivery одного owner не очищает wait другого;
- content restart восстанавливает только правильного owner;
- нет global current-conversation assumption.

# 14. Performance boundary

Проверить независимо и в browser network accounting:

- Seller changes не меняют Performance host/auth semantics;
- Performance-only request не вызывает Seller capability probe;
- Seller quota/cache не применяется к unrelated Performance request;
- `REAL_PERFORMANCE_REQUESTS=0`.

# 15. Browser/runtime

Использовать только qualified raw-CDP substrate, описанный выше. Старый `V3_BROWSER_COUNTDOWN_HARNESS.mjs` transport как есть запрещён.

Проверить:

- CFT source/copy inventory и setup contract PASS;
- exact launch options/args PASS;
- browser alive;
- extension устанавливается через `browser.installExtension(candidateDir)`;
- dynamic extension id, version `0.1.19`;
- raw PAGE `Target.createTarget`/Runtime/Page/Fetch PASS;
- synthetic supported ChatGPT/Alice pages fulfilled locally;
- content script стартует;
- MV3 service worker найден/активирован разрешённым способом;
- direct worker CDP Runtime PASS;
- worker Network instrumentation PASS;
- visible quota countdown / absolute due clock / decreasing seconds;
- native Copy independence;
- two-owner isolation;
- ChatGPT/Alice structural bindings;
- page/content lifecycle restart не дублирует owner state/provider/insertion/Send;
- normal empty composer delivery;
- occupied/missing composer wait/current repair;
- OFF cancellation + OFF->ON readiness;
- wrong owner/conversation fail closed;
- one-Send/Microphone semantics;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- unexpected runtime/console failure валит affected test;
- environment/harness failure не выдаётся за production behavior failure.

# 16. Packaging

Только если блоки 1–15 PASS:

- собрать **новый** ZIP ровно из exact tested 17-file production tree;
- не включать tests/reports/credentials/dev artifacts;
- посчитать ZIP SHA-256;
- fresh-extract;
- сравнить все 17 extracted files byte-for-byte с tested candidate;
- повторно проверить JS syntax, manifest и inventory;
- повторно проверить worker SHA = `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`;
- повторно проверить content SHA = `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`;
- при любом byte drift пакет не передавать.

# Итоговый отчёт Codex

Для каждого блока 1–16 вывести `PASS` или `FAIL`; только объективно зависимый test может быть `BLOCKED_BY:<причина>`.

Обязательно вывести:

- exact checklist commit;
- frozen ZIP SHA-256;
- patch bytes/SHA-256;
- exact patch command/mode (`core.autocrlf=false`);
- candidate-A worker/content SHA-256;
- candidate-B worker/content SHA-256;
- `A_B_BYTE_IDENTICAL=true|false`;
- production inventory count;
- changed files;
- protected 15 byte-identical result;
- unchanged worker-function carry-forward result;
- worker persisted-due fixture result;
- browser substrate used (`RAW_PAGE_CDP` + direct worker CDP transport);
- факт отсутствия `browser.newPage()` / `worker.evaluate()` в current browser execution;
- все test-only harness adaptations;
- подтверждение, что behavioral assertions не ослаблялись;
- полный список executed tests;
- полный список failed tests;
- полный список blocked tests;
- полный список harness/environment failures;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0`;
- production modifications by Codex = `0`;
- package path/SHA только если blocks 1–15 PASS;
- fresh-extract byte verification result.

Полный PASS допускается только если все blocks 1–16 PASS.

Терминальный маркер полного PASS:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Этот PASS является automated/synthetic/browser QA. Logged-in live acceptance выполняется отдельно после передачи exact tested ZIP.
