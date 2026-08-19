# Ozon Bridge v0.1.19 — список тестов, которые должен выполнить Codex перед передачей сборки

Дата: 2026-08-19
Статус: `CODEX_TEST_CHECKLIST`

Это **только список тестов**.

Codex — независимый проверяющий. Он должен выполнить перечисленные ниже проверки над точной текущей сборкой и выдать один итоговый отчёт.

Не требуется создавать отдельный «валидатор», новую архитектуру тестов, RERUN-планы, authority bundles, assertion-ledger инфраструктуру или промежуточные отчёты.

## Правило выполнения

- Выполнить весь этот checklist в **одной задаче Codex** перед передачей сборки оператору.
- Использовать уже существующие тесты/harnesses и обычные test-only команды/временные fixtures, необходимые для проверки конкретного пункта.
- Codex может создавать/менять только временные test-only файлы и итоговый report; production candidate изменять запрещено.
- Не останавливаться и не возвращаться пользователю после первой обычной ошибки теста/harness/environment. Выполнить все остальные независимые проверки, которые остаются безопасно выполнимыми, и собрать **полный доступный failure set** в одном итоговом отчёте.
- Если один тест зависит от провалившегося prerequisite, отметить его как blocked/неисполненный из-за этого prerequisite в итоговом отчёте, а не требовать отдельного пользовательского запуска только ради следующей причины.
- Не считать historical PASS текущим PASS: каждый применимый пункт ниже должен быть проверен на точном текущем candidate.
- Реальные operator/browser действия в этом automated gate не требуются.

## Точная проверяемая сборка

База:

- frozen ZIP SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Repair:

- patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- изменены только `service_worker.js` и `content_script.js`
- остальные 15 production-файлов должны остаться byte-identical frozen-сборке

Ожидаемые финальные hashes:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`
- production inventory: ровно 17 файлов

Во всех автоматизированных тестах:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser interception
- реальные Seller/Performance credentials не использовать
- production-файлы не изменять

# 1. Candidate integrity

Проверить:

- frozen ZIP имеет точный SHA-256;
- repair patch имеет точный SHA-256;
- patch применяется чисто, без fuzz/manual repair;
- итоговая сборка содержит ровно 17 production-файлов;
- изменены только `service_worker.js` и `content_script.js`;
- остальные 15 production-файлов byte-identical frozen-сборке;
- hashes worker/content совпадают с указанными выше;
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

- используются только фиксированные Seller/Performance hosts;
- AI-текст не может выбрать произвольный URL/host/method/headers/auth/credentials;
- mutation/write operations не открыты;
- credentials не попадают в AI-visible output;
- unsafe provider fields/bodies санитизируются;
- customer PII не выводится;
- нет скрытых retry/pagination/fan-out/polling;
- нет тихого truncation/invented generic caps;
- wrong tab/conversation/binding fail closed.

# 4. Seller capability / entitlement

Проверить:

- capability probe остаётся внутренним и не вызывается AI напрямую;
- raw seller-info identity/company fields не попадают в AI output;
- universal analytics делает 0 capability probes;
- relevant logical batch делает максимум 1 fresh capability probe;
- worker restart не replay-ит уже начатый capability probe;
- entitlement states остаются явными;
- mixed universal/restricted analytics сохраняет утверждённую partial semantics;
- all-restricted/no-executable analytics делает 0 business requests;
- restricted dimension/filter/sort/history semantics fail closed;
- Performance-only flow делает 0 Seller capability probes.

# 5. Query planner / coalescing / projection

Проверить:

- coalescing только contiguous compatible analytics commands;
- различающиеся non-metric semantics не объединяются;
- metric union deterministic и не превышает contract maximum;
- logical requests/results остаются раздельными после одного physical request;
- projection использует проверенный physical metric order;
- unprovable projection fail closed;
- projection failure/provider error не вызывает replay provider request;
- restart после уже начатого physical group не replay-ит его вслепую.

# 6. Global Seller quota scheduler

Проверить:

- family: `seller.analytics_data.v1`;
- provider minimum: `60000` ms;
- bridge safety: `5000` ms;
- effective interval: `65000` ms;
- один Seller делит bucket между tabs/conversations/ChatGPT/Alice;
- разные Seller accounts изолированы;
- rotation Api-Key при том же Client-Id сохраняет account scope и меняет credential revision;
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
- public quota state содержит только безопасную timing metadata.

# 7. Response verifier / safe errors

Проверить:

- успешный analytics payload проверяется до projection/cache;
- invalid HTTP-200 payload становится safe mismatch после единственной попытки provider request;
- verifier failure не вызывает retry;
- HTTP 429 безопасен и только продлевает Retry-After state;
- transport errors сохраняют truthful attempted-request provenance;
- storage/credential failure до fetch даёт 0 provider requests;
- `automatic_retry:false` остаётся правдивым.

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
- `analytics_basic_metrics_v1` расширяет только утверждённый universal metric subset;
- prefetch не добавляет restricted metrics и не меняет прочие semantics;
- совместимый следующий request может получить cache hit без второго provider call и без второго quota acquisition;
- cache hit/lookup не портит quota state.

# 9. Manual / Autorun common batch engine

Проверить:

- одна команда остаётся batch из одного entry;
- multi-command order сохраняется;
- несколько physical requests выполняются строго serial;
- malformed/validation entries следуют текущей safe continuation semantics;
- completed entries не replay-ятся после recovery;
- old-worker `requesting` ambiguity fail closed;
- нет unintended intermediate chat delivery;
- final batch report сохраняет logical order/count и truthful physical count;
- Manual и Autorun ownership разделены.

# 10. Delivery FSM — нормальный пустой composer

Проверить:

- ready report + empty правильный composer входит в insertion path;
- используется только правильный owner/conversation;
- worker insert commit остаётся irreversible permission boundary;
- report вставляется ровно один раз;
- staged recognised Send нажимается максимум один раз;
- обычный последующий пользовательский Send не затрагивается;
- disabled Send / Stop / Unknown / Microphone не трактуются как Send;
- Microphone/current accepted AI-ready marker подтверждает success;
- completion очищает transient delivery и возвращает Manual readiness;
- delivery recovery не replay-ит provider work.

# 11. Manual delivery — занятый или временно отсутствующий composer

Проверить текущий repair:

- чужой непустой текст composer никогда не очищается/заменяется/выделяется/отправляется;
- временно отсутствующий composer — recoverable pre-insert state, не terminal failure;
- occupied/missing composer не запрашивает worker insert commit;
- pending report остаётся worker-owned в recoverable pre-insert state;
- при занятом composer показывается точно `Очистите поле ввода, чтобы получить отчёт.`;
- plate не исчезает по timeout, пока report pending;
- DOM observation/reacquisition работает, fallback polling ограничен;
- после появления правильного пустого composer выполняется ровно один insert commit и одна вставка report;
- wrong-owner composer никогда не используется;
- plate исчезает только после успешной вставки или explicit cancellation;
- content/page restart восстанавливает ожидание без duplicate insert/Send;
- дальнейший one-Send/Microphone flow остаётся прежним;
- ожидание composer даёт 0 provider replay.

# 12. Manual OFF cancellation / OFF -> ON

Проверить narrow cancellation только для pre-insert claimed delivery:

- `status === delivering`;
- `delivery.mode === batch_watch_v1`;
- `delivery.phase === claimed`;
- insert permission ещё не committed.

Проверить:

- удаляется только eligible pending operation текущего owner;
- останавливается только его composer waiter/plate;
- cancelled report никогда не появляется после re-enable;
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
- после OFF -> ON Manual public state снова ready при отсутствии новой операции;
- UI Ozon control снова usable, старый busy state не залипает;
- новый cold-cache same-Seller request после OFF -> ON всё ещё соблюдает ранее сохранённый deadline.

# 13. UI / bindings / owner isolation

Проверить:

- Ozon controls структурно bind-ятся в ChatGPT/Alice;
- native ChatGPT Copy остаётся независимым;
- native Copy не меняет bridge operation state;
- busy/ready UI следует worker-owned state;
- Manual toggle остаётся доступен для cancellation pending Manual report, если Autorun не блокирует owner;
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
- extension устанавливается через доступный Puppeteer/CFT runtime;
- content script стартует на synthetic supported pages;
- page/content lifecycle restart не дублирует owner state/provider/insertion/Send;
- interception подтверждает `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `REAL_CHATGPT_REQUESTS=0`;
- неожиданный runtime/console failure валит соответствующий тест;
- environment/harness failure не выдаётся за production behavior failure.

# 16. Packaging

Только если блоки 1–15 PASS:

- собрать новый ZIP ровно из tested 17-file production tree;
- не включать tests/reports/credentials/dev artifacts;
- посчитать ZIP SHA-256;
- распаковать ZIP в fresh directory;
- сравнить все 17 файлов byte-for-byte с tested candidate;
- повторно проверить JS syntax, manifest и inventory;
- при любом byte drift пакет не передавать.

# Итоговый отчёт Codex

Для каждого блока 1–16 вывести `PASS` или `FAIL`; если проверка объективно заблокирована провалившимся prerequisite, явно указать `BLOCKED_BY:<причина>` и не выдавать это за PASS.

Дополнительно вывести:

- exact tested candidate hashes;
- production inventory count;
- changed files;
- protected files verification;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser tests;
- production modifications by Codex = `0`;
- package path/SHA только если блоки 1–15 PASS;
- **полный список всех обнаруженных failed/blocked tests в этом одном запуске**.

Полный PASS допускается только если все блоки 1–16 PASS.

Терминальный маркер полного PASS:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

Даже этот PASS является automated/synthetic/browser QA. Logged-in live acceptance выполняется отдельно после передачи точного проверенного ZIP.
