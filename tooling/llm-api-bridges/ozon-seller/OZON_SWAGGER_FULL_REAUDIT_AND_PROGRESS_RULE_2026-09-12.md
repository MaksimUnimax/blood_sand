# Ozon Swagger/OpenAPI — полный повторный аудит и правило сохранения прогресса

Дата: **2026-09-12**  
Статус: **AUTHORITATIVE EXECUTION / RECOVERY RULE**  
Текущий execution state: **DOCUMENTATION_CREATED__SWAGGER_WORK_NOT_STARTED**

> Этот документ обязателен для чтения перед любой следующей работой со Swagger/OpenAPI Ozon Seller API и Ozon Performance API в этом репозитории. Он создан именно затем, чтобы при новом чате, сетевом обрыве или смене исполнителя не восстанавливать методику по памяти и не повторять уже допущенные ошибки.

---

## 1. Что сейчас разрешено и что ещё НЕ начато

На момент создания этого документа пользователь передал два свежескачанных OpenAPI/Swagger-файла Ozon и попросил сначала проверить их, затем подготовить правила будущей работы.

Предварительная проверка содержимого показала:

- файл `swagger.json` соответствует **Ozon Performance API** (`api-performance.ozon.ru`), OpenAPI 3.0.0, API version 2.0; в нём присутствует `POST /api/client/statistics/phrases`;
- файл `swagger (1).json` соответствует **Ozon Seller API** (`api-seller.ozon.ru`), OpenAPI 3.0.0, API version 2.1.

Однако **сам Swagger-аудит, замена старых Swagger authority, удаление старых файлов, изменение operation registry, снятие блокировок, добавление aliases, патч расширения, тесты и live-provider вызовы на этом этапе НЕ начаты**.

Если работа возобновляется из нового чата, нельзя считать, что эти шаги уже выполнены только потому, что данный документ существует.

---

## 2. Зачем вообще нужен новый полный аудит

Цель — получить окончательный, проверяемый и воспроизводимый ответ на вопрос:

> **Какие операции текущих официальных Ozon Seller API и Ozon Performance API Bridge может безопасно использовать для чтения/аналитики, какие read-safe операции сейчас отсутствуют или ошибочно заблокированы, и какие операции действительно меняют состояние магазина/рекламы и должны оставаться запрещёнными?**

Новый проход нужен не для косметического обновления старой таблицы. Он должен заново построить authority из **свежих официальных OpenAPI-файлов**, а старые derived matrices использовать только для сравнения и поиска регрессий.

---

## 3. Две уже допущенные ошибки, которые запрещено повторять

### Ошибка №1 — неполный/наследуемый coverage вместо независимого полного прохода по свежему Swagger

В предыдущих проходах старые allowlist, decision matrix и generated inventories слишком рано стали восприниматься как исходная истина. В результате новый аудит частично проверял уже ранее отобранный набор операций, вместо того чтобы каждый раз начинать от полного свежего OpenAPI operation set.

Последствие: безопасные методы могли оставаться за пределами Bridge просто потому, что их не было в старом реестре или они раньше были неверно отнесены в другой класс.

**Антирегрессионное правило:**

1. Сначала извлечь **все операции** из свежего Seller Swagger и свежего Performance Swagger.
2. Каждая операция должна получить строку в новой canonical operation matrix.
3. Только после этого сравнивать новую matrix со старым registry/allowlist/blocked set.
4. Отсутствие endpoint в старой матрице никогда не означает, что его не надо рассматривать.
5. Старые matrix/allowlist — **comparison evidence, не authority для нового решения**.

### Ошибка №2 — классификация по технической форме запроса вместо фактического бизнес-эффекта

В предыдущем аудите целый класс `ASYNC_REPORT_GENERATION` был заблокирован. Это привело к тому, что, например,

`POST /api/client/statistics/phrases`

— создание задачи **аналитического отчёта по поисковым запросам** — оказалось заблокировано как будто это небезопасная mutation.

При этом последующие read-операции статуса/списка/скачивания отчёта были разрешены. Получилась неверная граница: читать отчёт можно, а попросить Ozon его сформировать — нельзя.

Причина ошибки: оценивался HTTP method / факт создания server-side report job, а не изменение бизнес-состояния магазина.

**Антирегрессионное правило:**

- `POST` сам по себе не означает mutation;
- `GET` сам по себе не означает read-safe;
- классификация определяется **бизнес-эффектом** операции;
- создание временного read-only analytics/report job — отдельный безопасный класс, если операция не меняет кампанию, ставку, бюджет, карточку, цену, остаток, заказ, склад или иное бизнес-состояние;
- endpoint с side effect должен оставаться mutation даже если он реализован через `GET`.

Эти две ошибки считаются **известными failure classes**. Любой будущий результат, который их повторяет, автоматически не проходит acceptance.

---

## 4. Новая обязательная модель классификации операций

Каждая операция свежих Swagger должна получить ровно один основной класс:

1. **READ_SAFE_DIRECT** — непосредственное чтение без изменения бизнес-состояния.
2. **READ_SAFE_REPORT_START** — запуск формирования read-only аналитического/выгрузочного отчёта.
3. **READ_SAFE_REPORT_STATUS** — проверка статуса/метаданных отчёта.
4. **READ_SAFE_REPORT_DOWNLOAD** — получение результата отчёта.
5. **READ_SAFE_WITH_PRIVACY_GATE** — чтение с персональными/чувствительными данными, разрешаемое только через отдельные ограничения.
6. **CONDITIONAL_READ** — чтение, безопасное только при конкретных параметрах/контексте/лимитах.
7. **MUTATION_BUSINESS_STATE** — меняет магазин, рекламу, цены, остатки, карточки, кампании, ставки, бюджеты, заказы, поставки и т. п.
8. **DEPRECATED_OR_RETIRED** — официальный устаревший/выведенный метод; не таргетировать.
9. **UNRESOLVED_HOLD** — недостаточно evidence для безопасной классификации; не разрешать до разрешения HOLD.

Дополнительные признаки должны храниться отдельно, а не смешиваться с safety-классом: API surface, tag/family, auth scope, request schema, pagination, report lifecycle, rate limits, PII, async, deprecation, current Bridge alias, current implementation state.

---

## 5. Что нужно сделать в следующем полноценном Swagger-проходе

Ниже — общий порядок. Он описывает будущую работу; **этот документ сам по себе не означает, что какой-либо из пунктов уже выполнен**.

### Блок A — Canonical source authority

- повторно проверить оба переданных файла по содержимому;
- вычислить hashes;
- зафиксировать происхождение/дату;
- найти в репозитории все старые Swagger/OpenAPI source snapshots, split transports и manifests;
- определить, какие из них именно source authority, а какие исторические derived evidence;
- заменить старую source authority двумя свежими canonical файлами;
- удалить старые Swagger source copies/parts, которые могут быть ошибочно приняты за current authority;
- исторические отчёты/матрицы не удалять только потому, что они старые: они нужны как regression evidence, но должны быть явно помечены как derived historical output;
- сделать remote readback и убедиться, что current source authority однозначна.

### Блок B — Fresh operation inventory

- парсить свежие Seller и Performance OpenAPI **с нуля**;
- получить полный список `METHOD + PATH + operationId + tag + summary + request/response schema refs`;
- зафиксировать expected operation count из самих файлов;
- проверить, что `inventory_count == swagger_operation_count`;
- никакие старые allowlist/matrix не должны фильтровать входной список.

### Блок C — Safety classification from scratch

- классифицировать 100% операций по модели из раздела 4;
- отдельно проверить все POST/PUT/PATCH/DELETE, но не считать их mutation автоматически;
- отдельно проверить все GET на скрытые side effects;
- отдельно пройти все report/create/generate/submit/status/download lifecycle;
- все неоднозначные случаи отправлять в `UNRESOLVED_HOLD`, а не угадывать.

### Блок D — Bridge crosswalk и gap analysis

Для каждой Swagger operation сопоставить:

- есть ли alias в `OzonOperationRegistry`;
- правильный ли host/path/version;
- соответствует ли request contract свежей schema;
- правильный ли provider routing;
- правильный ли entitlement/safety class;
- есть ли старый ложный block;
- есть ли безопасная операция, которой вообще нет в Bridge;
- есть ли alias, который больше не существует в Swagger;
- есть ли deprecated target.

Результат должен показывать **не только missing methods**, но и wrong-path, wrong-version, wrong-schema, wrong-safety, stale/deprecated и false-block случаи.

### Блок E — Implementation patches

Только после принятой новой matrix:

- добавить отсутствующие read-safe aliases;
- исправить неверные contracts;
- реализовать `READ_SAFE_REPORT_START → STATUS → DOWNLOAD` как явный lifecycle;
- снять ошибочные блокировки read-safe report generation;
- не ослаблять настоящий mutation gate;
- не добавлять скрытый polling, hidden retries или неявный fan-out;
- не расширять wildcard-доступ там, где можно использовать exact `METHOD + PATH + schema`.

### Блок F — Regression / coverage QA

Обязательные machine gates:

- `swagger_total_operations == classified_operations`;
- `unclassified_operations == 0`;
- `read_safe_swagger_ops_missing_from_bridge == 0` для выбранного target scope;
- `mutation_ops_exposed_as_read == 0`;
- `deprecated_ops_targeted == 0`;
- `wrong_method_path_pairs == 0`;
- `report_start_without_status_or_download_contract == 0` там, где lifecycle требует продолжения;
- старые known false blocks, включая `statistics/phrases`, должны иметь явный regression test;
- неизвестные операции fail closed.

### Блок G — Build, live read validation, release, readback

- собрать candidate extension;
- прогнать offline/unit/regression tests;
- выполнить только безопасные live-read probes там, где нужны реальные credentials/provider behavior;
- никаких mutation probes без отдельного явного owner approval;
- сохранить live evidence;
- собрать release artifact;
- выполнить remote readback exact files/hashes;
- опубликовать final coverage report и final cursor.

---

## 6. Адаптивный метод разбиения работы и сохранения прогресса

Работу нельзя вести одним длинным несохранённым run. Но нельзя и коммитить каждые 5 строк. Используется **Adaptive Checkpoint Window (ACW)**.

### 6.1 Базовый размер окна

По умолчанию один рабочий блок должен занимать примерно:

- **30–60 минут содержательной работы**, или
- **40–80 Swagger operations ручной/семантической классификации**, или
- **одну логически завершённую API family**,

что наступит раньше.

Это не жёсткий таймер. Главная единица — **recoverable semantic unit**: после блока следующий исполнитель должен иметь возможность продолжить без повторения уже выполненной интеллектуальной работы.

### 6.2 Когда блок можно увеличить

Блок разрешено увеличить до примерно **80–120 операций**, если одновременно выполняются условия:

- обработка детерминированная и выполняется сохранённым скриптом;
- raw/canonical source уже сохранён;
- результат можно полностью воспроизвести из committed inputs + committed script;
- нет ручной классификации, которую пришлось бы повторять после обрыва.

### 6.3 Когда блок надо уменьшить

Блок надо уменьшить примерно до **15–40 операций / 15–30 минут**, если:

- сеть нестабильна;
- идёт ручная смысловая классификация;
- обнаружен новый failure class;
- меняются safety rules;
- начинается новая API family;
- работа затрагивает несколько файлов, которые трудно восстановить автоматически.

### 6.4 Запреты

Нельзя:

- держать более ~60 минут невоспроизводимой ручной работы только в памяти/чате;
- переходить к следующей крупной API family, не сохранив предыдущую;
- откладывать commit «до конца всего аудита»;
- считать локальный/чатовый результат сохранённым до Git commit + remote readback;
- после сетевого обрыва начинать блок заново, не проверив cursor и последний commit.

---

## 7. Что сохраняется после каждого блока

Каждый значимый блок должен закончиться **без остановки общего процесса** следующей короткой последовательностью:

1. материализовать block output;
2. обновить machine-readable cursor;
3. commit;
4. remote readback commit/file presence;
5. сразу продолжить следующий блок.

Не требуется писать длинный человеческий отчёт после каждого блока. Достаточно минимального recoverable набора.

Минимальный checkpoint содержит:

- block id;
- API (`SELLER` / `PERFORMANCE` / `BOTH`);
- входной source hash/ref;
- диапазон или family уже обработанных operations;
- количество processed / remaining;
- найденные новые failure classes / unresolved HOLD;
- output file paths;
- commit SHA;
- `next_block`;
- статус `IN_PROGRESS`, `BLOCK_COMPLETE`, `FAILED_RECOVERABLE`, `FINAL_PASS`.

---

## 8. Рекомендуемое количество крупных блоков

Не создавать десятки искусственных этапов. Для всей работы ориентир — **7–9 крупных блоков**, перечисленных в разделе 5 (A–G), с адаптивными подблоками только там, где объём этого требует.

Практически наиболее крупный Seller classification block может быть разбит на несколько подблоков по естественным API families или по ACW-окнам. Performance API, если он значительно меньше, обычно не требует такого же количества подблоков.

Номер блока — это checkpoint, а не расписание. Блоки можно объединять или делить по ходу, если сохраняется принцип ACW и recoverability.

---

## 9. Cursor / recovery rule

Во время фактического аудита должен существовать один current machine-readable cursor, например:

`tooling/llm-api-bridges/ozon-seller/validation/swagger-reaudit-2026-09-12/SWAGGER_REAUDIT_CURSOR.json`

Он должен обновляться после каждого checkpoint.

При восстановлении после обрыва:

1. прочитать этот документ полностью;
2. прочитать cursor;
3. проверить current remote branch HEAD;
4. открыть outputs последнего `BLOCK_COMPLETE`;
5. продолжить с `next_block`;
6. не пересчитывать уже сохранённую ручную работу без конкретной причины;
7. если последний блок имеет `IN_PROGRESS` без committed output, повторять только этот незавершённый блок.

---

## 10. Acceptance criteria всего повторного Swagger-аудита

Работа не считается законченной, пока одновременно не выполнено:

- свежие официальные Seller + Performance OpenAPI являются однозначной current source authority;
- старые source Swagger copies не могут быть перепутаны с current authority;
- 100% операций двух свежих Swagger попали в inventory;
- 100% операций классифицированы или явно находятся в HOLD;
- все read-safe операции target scope либо реализованы Bridge, либо имеют документированную внешнюю/аккаунтную причину отсутствия;
- ложные safety blocks устранены;
- настоящий mutation surface не ослаблен;
- report-generation lifecycle корректно отделён от business mutation;
- current Bridge aliases проверены на method/path/version/schema drift;
- regression tests ловят обе известные ошибки из раздела 3;
- build/tests/readback PASS;
- final matrix и final cursor опубликованы в Git.

---

## 11. Жёсткая граница текущего шага

**На момент коммита этого документа выполнение остановлено намеренно.**

Сейчас разрешено только наличие этой документации.

НЕ выполнено и не должно считаться выполненным:

- удаление старых Swagger;
- загрузка свежих Swagger в репозиторий;
- новый operation inventory;
- новый safety audit;
- изменение Bridge;
- снятие `BLOCK_ASYNC_REPORT_GENERATION`;
- provider/live calls;
- build/release.

Следующая фактическая работа начинается только по отдельной команде владельца.
