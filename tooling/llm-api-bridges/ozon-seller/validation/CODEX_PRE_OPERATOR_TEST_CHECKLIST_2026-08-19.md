# Ozon Bridge v0.1.19 — список проверок для Codex перед передачей сборки

Дата: 2026-08-19
Статус: `CODEX_TEST_CHECKLIST_DOCUMENT_ONLY`

Это **только документ с проверками**.

Codex здесь только проверяет готовую сборку. Он **не разрабатывает тесты**, **не пишет тестовые программы**, **не создаёт validator/runner/harness/fixture/helper**, **не исправляет тестовую инфраструктуру** и **не меняет production-код**.

Если какой-то пункт невозможно проверить штатными средствами уже доступной среды Codex, Codex пишет для этого конкретного пункта `BLOCKED` и точную причину. Он не должен придумывать новый способ проверки, писать для этого код или менять сборку.

## Жёсткие правила

1. Проверяется только exact current candidate.
2. Production candidate менять запрещено.
3. Нельзя создавать или изменять `.js`, `.mjs`, `.py`, `.ps1` и другие файлы специально для тестирования.
4. Нельзя создавать validator, runner, harness, fixture, assertion-ledger, authority bundle, RERUN-планы или любую другую тестовую инфраструктуру.
5. Можно использовать только уже доступные штатные средства среды Codex: Git/GitHub, обычные команды проверки файлов, уже готовый браузерный QA environment, DevTools, UI самого расширения, существующее сетевое перехватывание/мокирование среды.
6. Реальные Seller/Performance credentials не использовать.
7. Реальные запросы к Ozon/Performance/ChatGPT в synthetic browser checks запрещены.
8. Один упавший пункт не должен автоматически блокировать остальные независимые пункты.
9. Codex должен пройти весь список и вернуть один полный итоговый отчёт.
10. Если обнаружена именно ошибка поведения production — описать её и остановиться на отчёте. Production Codex не исправляет.

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
- Для каждой директории выполнить обычный Git apply с `core.autocrlf=false`, без fuzz/manual repair.
- Проверить final worker/content hashes.
- Сравнить все 17 файлов candidate-A и candidate-B byte-for-byte.
- Проверить, что изменились только worker/content.
- Проверить остальные 15 файлов byte-for-byte против frozen ZIP.
- Проверить все production `.js` через `node --check`.
- Проверить `manifest.json`.
- Проверить, что permissions/host_permissions не расширились.
- Проверить, что tests/reports/dev files/credentials не попали в production tree.

## PASS

Только если обе reconstruction дают exact final hashes, все 17 файлов A/B одинаковы, изменены только worker/content и нет никакого лишнего production drift.

---

# B02. Обнаружение команд и строгая проверка входа

Проверять через обычное использование расширения на поддерживаемых synthetic ChatGPT/Alice страницах.

## Что сделать

1. Поместить корректную Ozon-команду в поддерживаемый code block/message и убедиться, что расширение обнаруживает ровно одну команду.
2. Ту же строку окружить обычным Markdown/текстом так, чтобы лишний окружающий текст не создавал дополнительных команд.
3. Проверить поддерживаемые Unicode/separator варианты.
4. Передать malformed JSON и убедиться, что расширение его не «чинит» молча.
5. Передать некорректные analytics date/dimension/metric/filter/sort/limit/offset.
6. Передать некорректные product-query date/SKU/sort/page.
7. Попробовать удалённые/запрещённые операции.
8. Попробовать `posting_fbs_get`.

## PASS

- Валидные команды принимаются.
- Невалидные команды отклоняются до provider request.
- `posting_fbs_get` не исполняется.
- Malformed/pre-execution failures дают `0` provider requests.

---

# B03. Безопасность provider boundary

## Что сделать

- В командном тексте попытаться передать произвольные URL/host/method/headers/auth/credentials.
- Проверить сетевой журнал среды.
- Проверить AI-visible output при success/error.
- Проверить wrong tab/conversation/binding.
- Проверить отсутствие скрытого retry, pagination, fan-out и polling.

## PASS

- Используются только фиксированные Seller/Performance endpoints продукта.
- AI-текст не может выбрать произвольный host/method/auth.
- Mutation/write operations не появляются.
- Credentials и customer PII не попадают в AI-visible output.
- Wrong owner/binding fail closed.
- Один logical request не создаёт скрытых дополнительных provider calls.

---

# B04. Seller capability / entitlement

Проверять обычными запросами продукта с mocked provider responses в уже доступной безопасной среде.

## Что сделать

1. Universal analytics request: убедиться, что capability probe не выполняется.
2. Batch с restricted capability: не более одного fresh capability probe на relevant logical batch.
3. Проверить restart во время/после capability acquisition: начатый probe не должен слепо повторяться.
4. Проверить mixed universal/restricted analytics: universal часть сохраняется, restricted часть обрабатывается по текущим правилам.
5. Проверить all-restricted/no-executable: `0` business requests.
6. Проверить restricted dimension/filter/sort/history: fail closed, без изменения смысла запроса.
7. Проверить Performance-only flow: `0` Seller capability probes.
8. Убедиться, что raw seller-info identity/company fields не попадают в AI output.

## PASS

Все восемь пунктов соблюдены, без лишних Seller business calls.

---

# B05. Планирование, объединение запросов и разделение результатов

## Что сделать

1. Дать две соседние совместимые analytics-команды, отличающиеся только метриками.
2. Убедиться, что они могут быть объединены в один physical provider request, а logical results остаются двумя и сохраняют порядок.
3. Дать две команды с разной non-metric semantics — они не должны объединяться.
4. Проверить deterministic metric union и предел contract maximum.
5. Подать mocked provider response с проверяемым порядком метрик и убедиться, что каждый logical result получает правильную проекцию.
6. Сделать projection непроверяемой/несовместимой — результат должен fail closed.
7. При provider error/projection failure не должно быть повторного physical request.
8. После restart уже начатая physical group не должна слепо replay-иться.

## PASS

Правильное объединение только совместимых запросов, правильное разделение logical results, отсутствие replay.

---

# B06. Глобальный лимит Seller запросов

**Не подделывать время в storage и не создавать искусственную fixture. Проверять через нормальную последовательность запросов продукта.**

## Что сделать

1. Выполнить первый cold-cache Seller analytics request с mocked successful provider response.
2. Сразу после него, не дожидаясь 65 секунд, выполнить второй cold-cache request того же Seller.
3. Убедиться, что второй запрос входит в ожидание, а provider call не происходит раньше разрешённого времени.
4. Наблюдать, что countdown уменьшается.
5. После наступления разрешённого времени убедиться, что второй provider call происходит автоматически и ровно один раз.
6. Во время ожидания перезапустить page/content или service-worker lifecycle штатным способом и убедиться, что ожидание восстанавливается, а provider call не дублируется.
7. Повторить ожидание из другого tab/conversation/ChatGPT/Alice для того же Seller — bucket должен быть общим.
8. Проверить другого Seller — его bucket независим.
9. Проверить Api-Key rotation при том же Client-Id — account scope сохраняется, credential revision меняется.
10. Проверить Retry-After — он может только продлить срок ожидания.
11. Проверить, что raw credentials не появляются в сохранённом quota state.
12. Проверить public state: только безопасные timing fields.

## Обязательные значения

- family: `seller.analytics_data.v1`
- provider minimum: `60000 ms`
- bridge safety: `5000 ms`
- effective interval: `65000 ms`

## PASS

Ни одного раннего или повторного provider call; ожидание устойчиво к restart; same Seller делит общий bucket; different Seller независим.

---

# B07. Проверка provider response и безопасные ошибки

## Что сделать

1. Successful valid analytics response → принять.
2. HTTP 200 с неправильной shape/cardinality → safe mismatch после единственной provider attempt.
3. Verifier failure → без retry.
4. HTTP 429 → безопасная ошибка, без immediate retry; Retry-After только продлевает deadline.
5. Transport error → truthful attempted-request provenance.
6. Storage/credential failure до fetch → `0` provider requests.
7. Проверить, что `automatic_retry:false` соответствует реальному поведению.

## PASS

Ошибочные ответы не проходят как success, не кэшируются как valid result и не вызывают скрытого повторного запроса.

---

# B08. Verified analytics cache

## Что сделать

1. Выполнить successful verified analytics request.
2. До истечения 60 секунд выполнить совместимый следующий request того же Seller.
3. Убедиться, что совместимый cache hit не создаёт второй provider call и не берёт второй quota permit.
4. Проверить safe metric superset → корректная deterministic projection.
5. Проверить другой Seller → miss.
6. Проверить incompatible semantics → miss.
7. Проверить expired entry → miss.
8. Проверить malformed/provider-error response → не сохраняется в cache.
9. Проверить, что credentials отсутствуют в serialized cache.
10. Проверить, что cache lookup/hit не портит quota state.
11. Проверить `analytics_basic_metrics_v1`: prefetch расширяет только утверждённый universal subset и не добавляет restricted metrics.

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
- Malformed/validation entry не ломает безопасную обработку остальных согласно текущей semantics.
- Completed entries не replay-ятся после recovery.
- Old `requesting` ambiguity fail closed.
- Нет промежуточной лишней доставки в chat.
- Итоговый report один, logical count/order и physical count правдивы.
- Manual и Autorun не забирают ownership друг у друга.

## PASS

Все пункты соблюдены без duplicate provider work и duplicate report delivery.

---

# B10. Обычная доставка при пустом composer

## Что сделать

1. Получить готовый Manual report при пустом правильном composer.
2. Убедиться, что используется только правильный owner/conversation.
3. Report вставляется ровно один раз.
4. Recognized Send нажимается максимум один раз.
5. После этого обычный пользовательский Send не должен быть задет старой delivery operation.
6. Disabled Send / Stop / Unknown / Microphone не должны ошибочно нажиматься как Send.
7. Microphone/accepted AI-ready state подтверждает завершение.
8. После completion transient delivery очищена, Manual снова ready.
9. Provider work при recovery не replay-ится.

## PASS

Одна вставка, максимум один правильный Send, корректное завершение, no replay.

---

# B11. Занятый или временно отсутствующий composer

## Что сделать

### Занятый composer

1. Перед готовностью report поместить в composer пользовательский текст.
2. Убедиться, что этот текст не очищается, не заменяется, не выделяется и не отправляется.
3. Убедиться, что появляется точная постоянная надпись:
   `Очистите поле ввода, чтобы получить отчёт.`
4. Оставить composer занятым больше 2 секунд — надпись не должна исчезнуть.
5. Очистить composer вручную.
6. Убедиться: один insert, один report, максимум один Send, надпись исчезает после успешной вставки.
7. Provider replay = 0.

### Временно отсутствующий composer

1. Сделать composer временно отсутствующим во время pending pre-insert report.
2. Это не должно становиться terminal `COMPOSER_NOT_FOUND`.
3. Вернуть правильный composer.
4. При пустом composer report должен вставиться ровно один раз.
5. Duplicate Send/provider replay = 0.

### Restart

Во время ожидания перезапустить page/content lifecycle и убедиться, что pending wait восстанавливается без duplicate insert/Send.

## PASS

Пользовательский текст не повреждён, pending report остаётся восстанавливаемым, delivery происходит ровно один раз.

---

# B12. Manual OFF во время pending report и последующий ON

## Что сделать

1. Создать pending Manual report до вставки, при занятом composer.
2. Выключить Manual.
3. Убедиться, что pending report текущего owner отменён и надпись исчезла.
4. Очистить composer — старый report не должен появиться.
5. Включить Manual обратно — control снова usable/ready.
6. Убедиться, что старый отменённый report не воскресает.
7. Проверить, что OFF не удаляет состояния `requesting`, `quota_waiting`, `insert_committed`, `inserted`, если они не являются eligible pre-insert claimed operation.
8. Проверить другого Manual owner — не меняется.
9. Проверить Autorun owner — не меняется.
10. Проверить binding/credentials/settings — сохраняются, кроме самого Manual flag.
11. До и после OFF→ON сравнить cache и quota state.
12. Проверить `last_provider_request_at`, `next_allowed_at`, Retry-After и 60000/5000/65000 — не меняются из-за toggle.
13. Выполнить новый cold-cache request того же Seller до старого deadline — он обязан ждать прежний deadline.
14. Provider calls из-за OFF/ON = 0.

## PASS

Отменяется только допустимый pending pre-insert report; quota/cache/owners не повреждаются; OFF→ON готов к новой работе.

---

# B13. UI, bindings и изоляция владельцев

## Что сделать

- Проверить Ozon controls на synthetic ChatGPT.
- Проверить Ozon controls на synthetic Alice.
- Native ChatGPT Copy работает независимо от bridge.
- Native Copy не меняет operation state.
- Busy/ready соответствует worker-owned state.
- Manual toggle остаётся доступен для отмены pending Manual report, когда Autorun не является blocking owner.
- Два ChatGPT conversation owner не перезаписывают друг друга.
- ChatGPT и Alice не перезаписывают друг друга.
- Wait/delivery одного owner не очищает состояние другого.
- Restart восстанавливает только правильного owner.

## PASS

Нет global current-conversation assumption и нет cross-owner state corruption.

---

# B14. Performance boundary

## Что сделать

- Выполнить Performance-only сценарий в synthetic/mocked environment.
- Проверить, что host/auth semantics Performance не изменились из-за Seller repair.
- Проверить, что Performance-only request не вызывает Seller capability probe.
- Проверить, что Seller quota/cache не применяется к Performance request.
- Сетевой журнал должен показать `REAL_PERFORMANCE_REQUESTS=0`.

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

1. Убедиться, что browser запускается и остаётся жив.
2. Установить exact candidate extension обычным уже доступным способом среды.
3. Проверить version `0.1.19`.
4. Проверить dynamic extension id.
5. Открыть synthetic ChatGPT и Alice страницы через уже доступный безопасный механизм среды.
6. Проверить, что content script запускается.
7. Проверить, что MV3 service worker активен.
8. Проверить worker runtime и network observation штатными средствами среды.
9. Повторить browser-observable проверки из B10–B13:
   - normal empty composer;
   - occupied composer;
   - missing composer recovery;
   - Manual OFF→ON;
   - native Copy independence;
   - two-owner isolation;
   - ChatGPT/Alice isolation;
   - restart/recovery;
   - one Send/Microphone semantics.
10. Проверить console/runtime errors. Неожиданная ошибка валит конкретный affected test.

## PASS

Все перечисленные browser-observable поведения реально наблюдены на exact candidate, без написания нового test code и без реального внешнего network.

---

# B16. Packaging

Запускать только если B01–B15 PASS.

## Что сделать

- Собрать новый ZIP ровно из tested 17-file production tree.
- Не включать tests/reports/credentials/dev artifacts.
- Посчитать ZIP SHA-256.
- Fresh-extract ZIP.
- Сравнить все 17 файлов byte-for-byte с tested candidate.
- Снова проверить JS syntax, manifest и inventory.
- Снова проверить exact worker/content hashes.

## PASS

Fresh-extracted package полностью byte-identical tested candidate.

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
- B01–B16: `PASS`, `FAIL` или объективный `BLOCKED`;
- для каждого FAIL/BLOCKED — конкретное действие, которое было выполнено, и конкретно что наблюдалось;
- полный список фактически выполненных проверок;
- полный список невыполненных проверок с причиной;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- `REAL_CHATGPT_REQUESTS=0` для synthetic browser checks;
- `production modifications by Codex=0`;
- package path/SHA только если B01–B15 PASS;
- fresh-extract byte verification result.

Полный PASS допускается только если B01–B16 PASS.

Terminal marker:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

После отчёта Codex останавливается. Logged-in live acceptance выполняется отдельно после передачи exact tested ZIP.
