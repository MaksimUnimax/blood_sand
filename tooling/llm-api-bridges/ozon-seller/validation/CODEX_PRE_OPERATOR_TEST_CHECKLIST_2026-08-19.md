# Ozon Bridge v0.1.19 — проверки для Codex перед передачей сборки

Дата: 2026-08-19
Статус: `CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`

## ОБЯЗАТЕЛЬНОЕ ПРАВИЛО ДЛЯ CHATGPT ПЕРЕД ЛЮБЫМ НОВЫМ CODEX-ЗАПУСКОМ

Это правило адресовано ChatGPT, который ведёт проект и готовит Codex-промпты. Оно выполняется **до любого нового Codex run**.

**НИКОГДА не выдавать и не отправлять новый Codex-промпт, пока ДО запуска не доказано, что каждый обязательный пункт B01–B15 физически выполним существующими разрешёнными средствами.**

Если хотя бы для одного обязательного пункта нет готового способа выполнения:

1. `STOP`: новый Codex-промпт и новый Codex run запрещены.
2. Сначала полностью разобрать предыдущий `FAIL/BLOCKED` report и весь набор причин, а не только первую ошибку.
3. Точно назвать, какой разрешённой возможности среды не хватает для каждого такого пункта.
4. Не пытаться исправить отсутствие возможности новым prompt, новым checklist, validator, runner, harness, fixture, helper, ready-test, runbook, assertion-ledger, authority bundle или повторным Codex-запуском.
5. Причина предыдущего `BLOCKED` должна **объективно измениться** до повторного запуска: необходимый штатный способ выполнения должен реально существовать и быть проверен заранее.
6. Перед повторным Codex run ChatGPT обязан заново подтвердить исполнимость **всех B01–B15**, а не только ранее заблокированного пункта.
7. Повторять Codex run в тех же условиях, которые уже дали `BLOCKED`, запрещено.

Это обязательное процессное правило для ChatGPT. Оно не отменяет требования ниже к независимой работе Codex.

Это **только документ с проверками**.

Codex здесь только проверяет готовую сборку. Он **не разрабатывает тесты**, **не пишет тестовые программы**, **не создаёт validator/runner/harness/fixture/helper**, **не исправляет тестовую инфраструктуру**, **не меняет production-код** и **не собирает финальный ZIP**.

Если конкретный пункт нельзя выполнить обычными средствами уже доступной среды Codex, для этого пункта ставится `BLOCKED` с точной причиной. Codex не должен писать код, чтобы «достроить» проверку.

## Жёсткие правила

1. Проверять только exact current candidate.
2. Production candidate менять запрещено.
3. Не создавать и не изменять `.js`, `.mjs`, `.py`, `.ps1` или другие файлы специально для тестирования.
4. Не создавать validator, runner, harness, fixture, assertion-ledger, authority bundle, RERUN-планы и любую другую тестовую инфраструктуру.
5. Использовать только уже доступные средства среды Codex: Git/GitHub, обычные команды проверки файлов, уже готовую Windows/CFT QA-среду, браузер, DevTools, UI расширения и уже существующее безопасное сетевое перехватывание/мокирование.
6. Реальные Seller/Performance credentials не использовать.
7. Реальные запросы к Ozon/Performance/ChatGPT в synthetic browser checks запрещены.
8. Один упавший пункт не блокирует остальные независимые пункты.
9. Пройти весь список B01–B15 и вернуть один итоговый отчёт.
10. Если обнаружена ошибка именно production — описать её, но production не исправлять.
11. После отчёта остановиться. Packaging выполняется отдельно только после разбора полного PASS отчёта.

## Exact candidate

Frozen ZIP:
`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

Frozen ZIP SHA-256:
`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Patch parts, строго в этом порядке:

1. `tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/patch-parts/00.patch.part`
2. `tooling/llm-api-bridges/ozon-seller/development/manual-delivery-composer-wait/patch-parts/01.patch.part`

Patch bytes: `13648`

Patch SHA-256:
`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Starting hashes:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Required final hashes:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Production inventory: ровно `17` файлов.

Изменённые production-файлы: только:

- `service_worker.js`
- `content_script.js`

Остальные 15 production-файлов должны быть byte-identical frozen ZIP.

---

# B01. Целостность сборки

## Что сделать

- Fresh-extract frozen ZIP два раза в две отдельные директории: candidate-A и candidate-B.
- Проверить SHA frozen ZIP.
- Проверить starting worker/content hashes.
- Собрать patch из двух частей в указанном порядке и проверить bytes/SHA.
- Для каждой директории выполнить `git -c core.autocrlf=false apply --check`, затем обычный `git -c core.autocrlf=false apply`, без fuzz/manual repair и без EOL rewrite.
- Проверить final worker/content hashes.
- Сравнить все 17 файлов candidate-A и candidate-B byte-for-byte.
- Проверить, что изменились только worker/content.
- Проверить остальные 15 файлов byte-for-byte против frozen ZIP.
- Проверить все production `.js` через `node --check`.
- Проверить `manifest.json`.
- Проверить, что permissions/host_permissions не расширились.
- Проверить, что tests/reports/dev files/credentials не попали в production tree.

## PASS

Обе reconstruction дают exact final hashes; все 17 файлов A/B одинаковы; изменены только worker/content; лишнего production drift нет.

---

# B02. Обнаружение команд и строгая проверка входа

Проверять через обычное использование расширения на поддерживаемых synthetic ChatGPT/Alice страницах.

## Что сделать

1. Корректная Ozon-команда в поддерживаемом сообщении/code block → обнаруживается ровно одна команда.
2. Окружающий Markdown/обычный текст не создаёт лишних команд.
3. Поддерживаемые Unicode/separator варианты принимаются.
4. Malformed JSON не исправляется молча.
5. Некорректные analytics date/dimension/metric/filter/sort/limit/offset отклоняются.
6. Некорректные product-query date/SKU/sort/page отклоняются.
7. Удалённые/запрещённые операции не исполняются.
8. `posting_fbs_get` не исполняется.

## PASS

Валидные команды принимаются; невалидные отклоняются до provider request; malformed/pre-execution failures дают `0` provider requests.

---

# B03. Безопасность provider boundary

## Что сделать

- Через обычный командный ввод попытаться навязать произвольные URL/host/method/headers/auth/credentials.
- Проверить уже доступный сетевой журнал среды.
- Проверить AI-visible output при success/error.
- Проверить wrong tab/conversation/binding.
- Проверить отсутствие скрытого retry, pagination, fan-out и polling.

## PASS

Используются только разрешённые Seller/Performance endpoints продукта; AI-текст не выбирает arbitrary host/method/auth; credentials/customer PII не выходят в AI-visible output; wrong owner/binding fail closed; скрытых дополнительных provider calls нет.

---

# B04. Seller capability / entitlement

Проверять обычными запросами продукта с уже доступными mocked responses безопасной среды.

## Что сделать

1. Universal analytics request → `0` capability probes.
2. Restricted batch → не более одного fresh capability probe на relevant logical batch.
3. Restart во время/после capability acquisition → начатый probe не replay-ится слепо.
4. Mixed universal/restricted analytics → universal часть остаётся исполнимой, restricted часть обрабатывается по текущим правилам.
5. All-restricted/no-executable → `0` business requests.
6. Restricted dimension/filter/sort/history → fail closed, без изменения смысла запроса.
7. Performance-only flow → `0` Seller capability probes.
8. Raw seller-info identity/company fields не выходят в AI output.

## PASS

Все восемь пунктов соблюдены без лишних Seller business calls.

---

# B05. Планирование, объединение запросов и разделение результатов

## Что сделать

1. Две соседние совместимые analytics-команды, отличающиеся только метриками.
2. Убедиться: один physical provider request, два logical results, исходный порядок сохранён.
3. Две команды с разной non-metric semantics → не объединяются.
4. Проверить deterministic metric union и contract maximum.
5. Mocked provider response с известным порядком метрик → каждый logical result получает правильную проекцию.
6. Непроверяемая/несовместимая projection → fail closed.
7. Provider error/projection failure → без повторного physical request.
8. Restart после уже начатой physical group → без слепого replay.

## PASS

Объединяются только совместимые запросы; logical results остаются правильными и отдельными; replay отсутствует.

---

# B06. Глобальный лимит Seller запросов

**Не подделывать время в storage и не создавать искусственные состояния. Проверять нормальной последовательностью запросов продукта.**

## Что сделать

1. Выполнить первый cold-cache Seller analytics request с уже доступным mocked successful provider response.
2. Сразу после него, не дожидаясь 65 секунд, выполнить второй cold-cache request того же Seller.
3. Убедиться, что второй запрос реально переходит в ожидание и provider call не происходит раньше разрешённого времени.
4. Наблюдать уменьшающийся countdown.
5. После наступления разрешённого времени убедиться, что второй provider call происходит автоматически и ровно один раз.
6. Во время ожидания штатно перезапустить page/content lifecycle или MV3 worker и убедиться, что ожидание восстанавливается без duplicate provider call.
7. Проверить тот же Seller из другого tab/conversation/поддерживаемого AI → bucket общий.
8. Проверить другого Seller → bucket независим.
9. Проверить Api-Key rotation при том же Client-Id → account scope сохраняется, credential revision меняется.
10. Проверить Retry-After → только продлевает срок ожидания.
11. Проверить, что raw credentials отсутствуют в сохранённом quota state.
12. Проверить public state → только безопасные timing fields.

## Обязательные значения

- family: `seller.analytics_data.v1`
- provider minimum: `60000 ms`
- bridge safety: `5000 ms`
- effective interval: `65000 ms`

## PASS

Нет раннего или повторного provider call; ожидание устойчиво к restart; same Seller делит общий bucket; different Seller независим.

---

# B07. Provider response и безопасные ошибки

## Что сделать

1. Valid analytics response → success.
2. HTTP 200 с неправильной shape/cardinality → safe mismatch после единственной provider attempt.
3. Verifier failure → без retry.
4. HTTP 429 → safe error, без immediate retry; Retry-After только продлевает deadline.
5. Transport error → truthful attempted-request provenance.
6. Storage/credential failure до fetch → `0` provider requests.
7. Проверить, что `automatic_retry:false` соответствует фактическому поведению.

## PASS

Ошибочные ответы не принимаются как success, не кэшируются как valid result и не вызывают скрытый повторный запрос.

---

# B08. Verified analytics cache

## Что сделать

1. Выполнить successful verified analytics request.
2. До истечения 60 секунд выполнить совместимый следующий request того же Seller.
3. Cache hit → `0` второго provider call и `0` второго quota acquisition.
4. Safe metric superset → правильная deterministic projection.
5. Другой Seller → miss.
6. Incompatible semantics → miss.
7. Expired entry → miss.
8. Malformed/provider-error response → не кэшируется.
9. Credentials отсутствуют в serialized cache.
10. Cache lookup/hit не меняет quota state неправильно.
11. `analytics_basic_metrics_v1` prefetch расширяет только утверждённый universal subset и не добавляет restricted metrics.

## Обязательное значение

TTL: `60000 ms`.

## PASS

Cache работает только на verified data, не создаёт лишних provider calls и не нарушает quota.

---

# B09. Общий batch engine Manual / Autorun

## Что сделать

- Одна команда → один entry.
- Несколько команд → logical order сохраняется.
- Несколько необходимых physical calls идут строго последовательно.
- Malformed/validation entry обрабатывается безопасно согласно текущей semantics.
- Completed entries не replay-ятся после recovery.
- Старое неоднозначное `requesting` fail closed.
- Нет лишней промежуточной доставки в chat.
- Итоговый report один; logical count/order и physical count правдивы.
- Manual и Autorun не забирают ownership друг у друга.

## PASS

Нет duplicate provider work и duplicate report delivery; порядок и ownership правильные.

---

# B10. Обычная доставка при пустом composer

## Что сделать

1. Получить готовый Manual report при пустом правильном composer.
2. Используется только правильный owner/conversation.
3. Report вставляется ровно один раз.
4. Recognized Send нажимается максимум один раз.
5. Поздний обычный пользовательский Send не задевается старой delivery operation.
6. Disabled Send / Stop / Unknown / Microphone не принимаются за Send.
7. Microphone/accepted AI-ready state подтверждает completion.
8. После completion transient delivery очищена, Manual снова ready.
9. Provider work при recovery не replay-ится.

## PASS

Одна вставка, максимум один правильный Send, корректное завершение, no replay.

---

# B11. Занятый или временно отсутствующий composer

## Занятый composer

1. До готовности report в composer уже есть пользовательский текст.
2. Текст не очищается, не заменяется, не выделяется и не отправляется.
3. Появляется точная постоянная надпись: `Очистите поле ввода, чтобы получить отчёт.`
4. Оставить composer занятым больше 2 секунд → надпись остаётся.
5. Очистить composer.
6. Результат: один insert, один report, максимум один Send; надпись исчезает после успешной вставки.
7. Provider replay = 0.

## Временно отсутствующий composer

1. Composer временно отсутствует во время pending pre-insert report.
2. Это не превращается в terminal `COMPOSER_NOT_FOUND`.
3. Вернуть правильный composer.
4. При пустом composer report вставляется ровно один раз.
5. Duplicate Send/provider replay = 0.

## Restart

Во время ожидания штатно перезапустить page/content lifecycle и убедиться, что pending wait восстанавливается без duplicate insert/Send.

## PASS

Пользовательский текст не повреждён; pending report восстанавливается; доставка происходит ровно один раз.

---

# B12. Manual OFF во время pending report и последующий ON

## Что сделать

1. Создать pending Manual report до вставки при занятом composer.
2. Выключить Manual.
3. Pending report текущего owner отменён, надпись исчезла.
4. Очистить composer → старый report не появляется.
5. Включить Manual обратно → control снова ready/usable.
6. Старый отменённый report не воскресает.
7. OFF не удаляет `requesting`, `quota_waiting`, `insert_committed`, `inserted`, если это не допустимый pending pre-insert claimed report.
8. Другой Manual owner не меняется.
9. Autorun owner не меняется.
10. Binding/credentials/settings сохраняются, кроме Manual flag.
11. Cache и quota state до/после OFF→ON не повреждены.
12. `last_provider_request_at`, `next_allowed_at`, Retry-After и 60000/5000/65000 не меняются из-за toggle.
13. Новый cold-cache request того же Seller до старого deadline ждёт прежний deadline.
14. Provider calls из-за OFF/ON = 0.

## PASS

Отменяется только допустимый pending pre-insert report; quota/cache/owners не повреждаются; после ON можно выполнять новую работу.

---

# B13. UI, bindings и изоляция владельцев

## Что сделать

- Проверить Ozon controls на synthetic ChatGPT.
- Проверить Ozon controls на synthetic Alice.
- Native ChatGPT Copy работает независимо от bridge.
- Native Copy не меняет operation state.
- Busy/ready соответствует worker-owned state.
- Manual toggle доступен для отмены pending Manual report, когда Autorun не является blocking owner.
- Два ChatGPT conversation owner не перезаписывают друг друга.
- ChatGPT и Alice не перезаписывают друг друга.
- Wait/delivery одного owner не очищает состояние другого.
- Restart восстанавливает только правильного owner.

## PASS

Нет cross-owner state corruption и нет использования неправильного conversation owner.

---

# B14. Performance boundary

## Что сделать

- Выполнить Performance-only сценарий в уже доступной synthetic/mocked environment.
- Проверить, что host/auth semantics Performance не изменились из-за Seller repair.
- Performance-only request не вызывает Seller capability probe.
- Seller quota/cache не применяется к Performance request.
- Сетевой журнал показывает `REAL_PERFORMANCE_REQUESTS=0`.

## PASS

Performance остаётся независимым от Seller quota/capability/cache изменений.

---

# B15. Браузер и runtime

Использовать **уже готовую квалифицированную Windows QA среду**. Ничего нового для управления браузером не писать.

Known environment:

- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`
- fresh disposable profile
- validation-owned browser copy
- real external Seller/Performance network blocked/intercepted

## Что сделать

1. Browser запускается и остаётся жив.
2. Exact candidate extension устанавливается уже доступным способом среды.
3. Version = `0.1.19`.
4. Extension id определяется корректно.
5. Synthetic ChatGPT и Alice открываются уже доступным безопасным способом среды.
6. Content script запускается.
7. MV3 service worker активен.
8. Worker runtime и network observation доступны штатными средствами среды.
9. В браузере реально повторить B10–B13: empty composer, occupied composer, missing composer recovery, Manual OFF→ON, native Copy, two-owner isolation, ChatGPT/Alice isolation, restart/recovery, one Send/Microphone semantics.
10. Проверить console/runtime errors; неожиданная ошибка валит соответствующий пункт.

## PASS

Все browser-observable поведения реально наблюдены на exact candidate без написания нового test code и без реального внешнего network.

---

# Что обязательно вернуть в итоговом отчёте

- exact checklist commit;
- exact branch/candidate authority;
- frozen ZIP SHA-256;
- patch bytes/SHA-256;
- exact patch mode `core.autocrlf=false`;
- candidate-A worker/content hashes;
- candidate-B worker/content hashes;
- `A_B_BYTE_IDENTICAL=true|false`;
- production inventory count;
- changed files;
- protected 15 identity result;
- B01–B15: `PASS`, `FAIL` или объективный `BLOCKED`;
- для каждого FAIL/BLOCKED: какое действие реально выполнено и что реально наблюдалось;
- полный список фактически выполненных проверок;
- полный список невыполненных проверок с причиной;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser checks;
- `production modifications by Codex=0`.

Полный PASS допускается только если B01–B15 PASS.

Terminal marker:

`OZON_PRE_OPERATOR_TESTS_PASS`

После публикации отчёта Codex останавливается. **ZIP не собирать.** Packaging и fresh-extract verification выполняются отдельно только после разбора полного PASS отчёта. Logged-in live acceptance также выполняется отдельно после передачи exact tested ZIP.