# Ozon Bridge v0.1.19 — список тестов, которые должен выполнить Codex перед передачей сборки

Дата: 2026-08-19
Статус: `CODEX_TEST_CHECKLIST`

Это **только список тестов**.

Codex — независимый проверяющий. Он должен выполнить перечисленные ниже проверки над точной текущей сборкой и выдать один итоговый отчёт.

Не требуется создавать отдельный «валидатор», новую архитектуру тестов, RERUN-планы, authority bundles, assertion-ledger инфраструктуру или промежуточные отчёты.

## Правило выполнения

- Выполнить весь этот checklist в **одной задаче Codex** перед передачей сборки оператору.
- Использовать существующие тесты/harnesses и обычные test-only команды/временные fixtures, необходимые для проверки конкретного пункта.
- Codex может создавать/менять только временные test-only файлы и итоговый report; production candidate изменять запрещено.
- Не возвращаться пользователю после первой обычной ошибки test/harness/environment. Выполнить остальные независимые безопасные проверки и собрать полный доступный failure set в одном итоговом отчёте.
- Провалившийся prerequisite может блокировать только реально зависимые проверки; остальные тесты должны продолжаться.
- Historical PASS не является текущим PASS: применимое поведение проверяется на текущем candidate.
- Реальные operator/browser действия в automated gate не требуются.

## КРИТИЧЕСКОЕ правило candidate identity

Candidate **НЕ определяется заранее придуманными финальными SHA-256 worker/content**.

Единственная входная authority candidate:

1. exact frozen ZIP:
   `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`
2. frozen ZIP SHA-256:
   `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
3. exact repair patch = `patch-parts/00.patch.part` + `patch-parts/01.patch.part` в этом порядке;
4. patch bytes: `13648`;
5. patch SHA-256:
   `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`;
6. patch применяется ровно один раз, чисто, без fuzz/manual/context repair;
7. измениться могут только `service_worker.js` и `content_script.js`; остальные 15 production-файлов остаются byte-identical frozen ZIP.

Исходный candidate checkpoint `1de4cea770fc8ae09280e65d13e60525fd22e4e7` прямо требовал **вычислить финальный exact-frozen worker SHA только во время final reconstruction**. Поэтому старый checklist pin `dfc101f6...` не является входным условием gate и удалён.

Historical expected content SHA `ab3408a2...` и historical/local worker hashes могут использоваться только как сведения для forensic comparison. Они не имеют права заменить exact derivation `frozen ZIP + exact patch` или остановить функциональные тесты, если две независимые exact reconstructions дают одинаковые bytes/hashes и выполняются все scope/integrity условия ниже. Любое расхождение с historical metadata надо записать в report как metadata/fixture discrepancy, а не автоматически объявлять production behavior failure.

### Обязательная независимая фиксация candidate перед функциональными тестами

- создать **две** fresh директории `candidate-A` и `candidate-B`;
- независимо распаковать в каждую exact frozen ZIP;
- до patch проверить ZIP SHA и starting production inventory;
- до patch проверить starting frozen worker/content hashes:
  - worker `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
  - content `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
- независимо применить один и тот же exact patch ровно один раз к A и B;
- в A и B проверить inventory = 17 и changed scope = только worker/content;
- все protected 15 сравнить byte-for-byte с frozen ZIP;
- вычислить SHA-256 всех 17 файлов A и B;
- потребовать byte-for-byte равенство A и B для всех 17 файлов;
- фактически полученные одинаковые SHA-256 `service_worker.js` и `content_script.js` объявить `CURRENT_WORKER_SHA256` и `CURRENT_CONTENT_SHA256` и считать immutable identity candidate **для всего оставшегося gate и packaging**;
- если A и B различаются, это `CANDIDATE_RECONSTRUCTION_FAILURE` и functional PASS невозможен;
- не подменять полученные bytes другим historical/local candidate.

### Правило использования существующих historical harnesses

Existing harnesses разрешено копировать во временную test-only директорию и адаптировать только их **устаревшие integrity/fixture preconditions**, необходимые для запуска над текущим exact candidate:

- historical expected worker/content SHA заменить на `CURRENT_WORKER_SHA256` / `CURRENT_CONTENT_SHA256`;
- current repair carry-forward regression base = **exact frozen ZIP до composer-wait patch**, а не более старая Step4 worker-база `7133956f...`;
- browser harness должен проверять текущий computed candidate, а не старый V3 hash;
- transport можно приспособить к уже доказанному рабочему Windows/CFT/Puppeteer пути, если старый transport несовместим с текущим QA environment.

При такой test-only адаптации **запрещено удалять, ослаблять или переписывать behavioral assertions ради PASS**. Stale historical SHA/base/transport failure классифицируется как harness fixture issue, а не production failure.

Во всех автоматизированных тестах:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser interception
- реальные Seller/Performance credentials не использовать
- production candidate не изменять после фиксации A/B identity.

# 1. Candidate integrity

Проверить:

- exact frozen ZIP SHA-256;
- exact repair patch bytes/SHA-256;
- clean one-time patch application в двух fresh reconstructions;
- A/B byte-identical после patch;
- итоговая сборка содержит ровно 17 production-файлов;
- изменены только `service_worker.js` и `content_script.js`;
- остальные 15 production-файлов byte-identical frozen ZIP;
- actual `CURRENT_WORKER_SHA256` и `CURRENT_CONTENT_SHA256` вычислены из A/B и записаны в report;
- все production `.js` проходят `node --check`;
- `manifest.json` валиден;
- permissions/host_permissions не расширились неожиданно;
- tests/reports/dev files/credentials отсутствуют в production tree.

# 2. Command discovery и строгий контракт

Проверить:

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

Проверить:

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

Проверить:

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

Проверить:

- coalescing только contiguous compatible analytics commands;
- различающиеся non-metric semantics не объединяются;
- metric union deterministic и в пределах contract maximum;
- logical requests/results раздельны после одного physical request;
- projection использует verified physical metric order;
- unprovable projection fail closed;
- projection failure/provider error не replay-ит provider request;
- restart после начатого physical group не replay-ит его вслепую.

# 6. Global Seller quota scheduler

Проверить:

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
- due wake создаёт ровно один provider call;
- provider call не начинается раньше `next_allowed_at`;
- requesting/already-attempted work не replay-ится startup/alarm;
- immediate retry отсутствует;
- Retry-After только продлевает, но не сокращает due;
- public quota state содержит только safe timing metadata.

# 7. Response verifier / safe errors

Проверить:

- successful analytics payload проверяется до projection/cache;
- invalid HTTP-200 payload становится safe mismatch после единственной provider attempt;
- verifier failure не вызывает retry;
- HTTP 429 безопасен и только продлевает Retry-After state;
- transport errors сохраняют truthful attempted-request provenance;
- storage/credential failure до fetch даёт 0 provider requests;
- `automatic_retry:false` правдив.

# 8. Verified analytics cache / prefetch

Проверить:

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

Проверить:

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

Проверить:

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

Проверить текущий repair:

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

Проверить:

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

Проверить:

- Seller changes не меняют Performance host/auth semantics;
- Performance-only request не вызывает Seller capability probe;
- Seller quota/cache не применяется к unrelated Performance request;
- `REAL_PERFORMANCE_REQUESTS=0`.

# 15. Browser/runtime

В доступном Codex Windows QA environment проверить:

- MV3 service worker загружается;
- extension устанавливается через существующий Puppeteer/CFT runtime;
- content script стартует на synthetic supported pages;
- page/content lifecycle restart не дублирует owner state/provider/insertion/Send;
- interception подтверждает `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `REAL_CHATGPT_REQUESTS=0`;
- unexpected runtime/console failure валит affected test;
- environment/harness fixture failure не выдаётся за production behavior failure.

# 16. Packaging

Только если блоки 1–15 PASS:

- собрать **новый** ZIP ровно из tested candidate-A 17-file production tree;
- не включать tests/reports/credentials/dev artifacts;
- посчитать ZIP SHA-256;
- fresh-extract;
- сравнить все 17 extracted files byte-for-byte с tested candidate-A;
- повторно проверить JS syntax, manifest и inventory;
- повторно проверить worker/content SHA = `CURRENT_WORKER_SHA256` / `CURRENT_CONTENT_SHA256`;
- при любом byte drift пакет не передавать.

# Итоговый отчёт Codex

Для каждого блока 1–16 вывести `PASS` или `FAIL`; объективно зависимый blocked test указать как `BLOCKED_BY:<причина>`.

Дополнительно вывести:

- frozen ZIP SHA-256;
- patch bytes/SHA-256;
- candidate-A worker/content SHA-256;
- candidate-B worker/content SHA-256;
- `A_B_BYTE_IDENTICAL=true|false`;
- actual `CURRENT_WORKER_SHA256`;
- actual `CURRENT_CONTENT_SHA256`;
- production inventory count;
- changed files;
- protected 15 byte-identical result;
- historical metadata discrepancies отдельно, если обнаружены;
- harness fixture adaptations, если были, с указанием что менялись только test-only preconditions/transport, а не behavioral assertions;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser tests;
- production modifications by Codex = `0`;
- package path/SHA только если блоки 1–15 PASS;
- полный список всех failed/blocked tests в одном отчёте.

Полный PASS допускается только если все блоки 1–16 PASS.

Терминальный маркер полного PASS:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Этот PASS является automated/synthetic/browser QA. Logged-in live acceptance выполняется отдельно после передачи точного проверенного ZIP.
