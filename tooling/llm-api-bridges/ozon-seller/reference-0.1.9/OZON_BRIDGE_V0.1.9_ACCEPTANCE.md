# Ozon Seller LLM API Bridge v0.1.9

## Статус

v0.1.9 исправляет обнаруженный live-дефект v0.1.8: Manual/Copy оставался на legacy single-command execution path, тогда как multi-command batch engine использовался Autorun. В результате две команды `OZON_API_V1` через Manual/Copy попадали в `parseCommand()` как один текст и завершались `INVALID_JSON` до внешнего Ozon request.

v0.1.9 устраняет архитектурное раздвоение. Одна команда теперь является частным случаем batch из одного элемента; Manual/Copy и Autorun используют общий discovery, общий последовательный queue processor и общий batch delivery protocol.

## Source of truth

- Repository: `MaksimUnimax/blood_sand`
- Branch: `work/ozon-data-collection-2026-08-11`
- Base v0.1.8 authority HEAD перед исправлением: `71acc6e2cf41229798244937d4c2391485f2076a`
- Base release ZIP SHA-256 v0.1.8: `79b750b2d16b0f765af674181ea41894681aa778db27e11fb87760960912a5fa`

## Root cause v0.1.8

В v0.1.8 существовали два разных command execution contours:

1. Autorun: full-message `discoverCommands()` → batch queue → serial provider requests → one final `OZON_BATCH_RESULT_V1`.
2. Manual/Copy: `executeManualCommand()` → legacy `OzonContract.parseCommand(commandText)` → один provider request → отдельная manual delivery.

`parseCommand()` намеренно строгий single-command primitive. Если `commandText` содержал две команды, второй marker становился лишним текстом после первого JSON и `JSON.parse()` возвращал `INVALID_JSON`. Live evidence имело `request_id=manual-preexec-*`, `stage=command_parse`, `external_request_executed=false`.

## Архитектура v0.1.9

### Единый command path

Manual/Copy больше не выполняет Ozon request самостоятельно.

Общий путь:

`input text → discoverBatchEntries() → processBatchQueue() → executeOzonCore() serially → per-entry durable result → formatCombinedBatchReport() → generic batch delivery FSM`

- `processManualBatch()` и `processAutoBatch()` являются адаптерами одного `processBatchQueue()`.
- `executeManualCommand()` только проверяет binding/mode, создаёт batch entries и передаёт batch общему processor.
- В `executeManualCommand()` нет прямого `OzonContract.parseCommand()` и нет прямого `executeOzonCore()`.
- Одна команда = batch size 1. Нет отдельного single-command execution engine.
- Повторяющиеся одинаковые команды внутри одного batch не дедуплицируются: каждая является отдельным явно заданным read-only request.

### Ошибки до provider request

Malformed/validation/gate ошибки становятся entries batch-результата с `external_request_executed=false`; они не вызывают Ozon API и не мешают обработке последующих корректных markers.

### Provider execution

- Строго последовательное выполнение; max provider concurrency = 1.
- Каждый корректный entry вызывает не более одного внешнего Ozon request.
- Нет hidden retry, pagination loop или fan-out.
- Recovery не повторяет уже сохранённые completed requests.
- Если service worker перезапустился во время in-flight request и исход неизвестен, entry fail-closed как `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`.

### Единая final delivery FSM

Manual и Autorun используют generic protocol:

- `OZ_BATCH_DELIVERY_AVAILABLE`
- `OZ_BATCH_DELIVERY_INSERT_COMMIT`
- `OZ_BATCH_DELIVERY_INSERTED`
- `OZ_BATCH_DELIVERY_COMPLETE`
- `OZ_BATCH_DELIVERY_FAILED`

После programmatic insertion batch path не читает и не сравнивает содержимое composer, не вычисляет его hash/length, не проверяет attachments. Microphone остаётся единственным success marker после blind wait. Active Send может нажиматься только после fresh classification/revalidation; disabled Send, Stop, Unknown и Microphone не нажимаются.

### Защита пользовательского draft

Перед irreversible insert commit общий delivery path один раз проверяет, что нижний composer пуст. Если там пользовательский текст, insertion не начинается, существующий текст не меняется, batch/delivery state сохраняется recoverable. После insertion содержимое composer не читается.

## Read-only/security invariants

Operation registry не расширен. Enabled operations:

- `roles`
- `stocks_current`
- `analytics_data`
- `product_queries`
- `product_queries_details`
- `posting_fbo_list`
- `supply_order_get`
- `supply_order_details`

`posting_fbs_get` остаётся disabled из-за customer PII surface.

Все executable operations имеют effect `READ`. Host permissions и extension permissions не расширены. Permission `downloads` отсутствует. Batch/content/worker не получили новых Blob/File/ObjectURL/download механизмов. Credentials остаются локальными и не включаются в LLM result.

## Verification

### Functional acceptance

Полный acceptance suite v0.1.9: **201/201 PASS, 0 fail, 0 skipped, 0 cancelled**.

Тот же suite выполнен трижды на разных уровнях:

1. development working tree: 201/201 PASS;
2. clean 16-file production tree: 201/201 PASS;
3. fresh extraction непосредственно из final ZIP: 201/201 PASS.

### Live-defect regression and scale matrix

Manual/Copy batch emulator проверяет:

- 1 command;
- 2 commands;
- 5 commands;
- 15 commands;
- 30 commands;
- 60 commands.

Для каждого масштаба подтверждены exact provider request count, max concurrency = 1, exact ordered entry count и ровно один final batch delivery push.

Дополнительно проверены:

- identical commands выполняются независимо;
- valid / malformed / valid сохраняет позднюю корректную команду;
- malformed entry делает 0 provider requests;
- manual-off / autorun-active gate errors делают 0 provider requests;
- completed entries не replay при recovery;
- old-worker in-flight state fail-closed без replay;
- insertion commit one-shot;
- inserted ack actor-bound;
- Microphone confirmation очищает transient batch/delivery state;
- delivery failure сохраняет outgoing payload и batch для recovery;
- pre-existing user composer draft не изменяется.

### Production function execution inventory

Raw V8 coverage использован как независимый audit того, были ли production named functions реально выполнены хотя бы один раз в emulator suite. Результат: **379/379 named production functions executed, 0 missing**. При подсчёте исключены только функции, которые test harness технически дописывает за пределами длины исходного production-файла; они не являются кодом расширения.

- `service_worker.js`: 120/120
- `content_script.js`: 115/115
- `popup.js`: 16/16
- `shared/bridge_autorun_model.js`: 18/18
- `shared/composer_send.js`: 13/13
- `shared/conversation_identity.js`: 4/4
- `shared/manual_controls.js`: 16/16
- `shared/ozon_contract.js`: 42/42
- `shared/ozon_credentials.js`: 5/5
- `shared/ozon_provider.js`: 7/7
- `shared/proven_writing_block_capture.js`: 17/17
- `shared/provider_transport_core.js`: 6/6

Node experimental coverage выводит для VM-loaded scripts пустую таблицу файлов и агрегат `100%`; этот агрегат не используется как evidence, потому что он не атрибутирует VM production scripts. Вместо ложного line-coverage claim используются executable function inventory, branch/input-output emulator tests, static invariants, syntax checks и fresh-package rerun.

### Syntax/package/build

- каждый production `.js` прошёл `node --check`;
- `manifest.json` parse PASS, version `0.1.9`;
- production package содержит **ровно 16 файлов**;
- Chromium `144.0.7559.96 --pack-extension`: exit 0;
- deterministic ZIP rebuild: byte-identical.

## Final artifact

- ZIP: `ozon-bridge-v0.1.9-extension.zip`
- ZIP SHA-256: `22665f5e9bb6250eed88fa53a1c4372c9653877d553a23ab36429490e19a9f70`
- size: 90,220 bytes
- production files: 16

Reproducible v0.1.8→v0.1.9 patch:

- raw patch SHA-256: `a6450e32a3f9ce2df184e9799c65c6b70bfff8209bb4f23e8d95bc641c4888be`
- gzip patch SHA-256: `d238777a2c7f8c21c6ebf16726019bae25a759483c5fad616ad549d83696c893`
- base64 patch file SHA-256: `d1b9289f41098612f1e4feedc1cb9606e4e475ff5da6db56c70c2c163e335f95`

## Remaining acceptance boundary

Automated/source/package/emulator acceptance завершён. Реальный logged-in ChatGPT field test v0.1.9 ещё должен быть выполнен установленным расширением. Рекомендуемый live scale sequence остаётся: **1 → 2 → 5 → 15 → 30 → 60**. Никакого live PASS до фактического ответа расширения не заявляется.
