# Wildberries Bridge — Ozon parity migration and test authority

Дата: 2026-09-11  
Статус: **EXECUTION AUTHORITY / MIGRATION + TEST PLAN**  
Repository: `MaksimUnimax/blood_sand`  
WB root: `tooling/llm-api-bridges/wildberries/`

## 0. Назначение документа

Этот документ является рабочим authority для переноса зрелого общего функционала Ozon Bridge в Wildberries Bridge.

Цель не состоит в механическом копировании Ozon-кода. Цель — перенести весь provider-neutral runtime, transport, parser, state-machine, safety, delivery, QA и orchestration функционал, а provider-specific часть адаптировать только после проверки актуального Wildberries API.

Документ фиксирует:

1. что можно переносить сразу без дополнительных реальных WB API-вызовов;
2. что требует адаптации и реальных тестов Wildberries API;
3. порядок выполнения работ;
4. обязательные тесты после первого пакета переноса;
5. максимально пакетный набор реальных WB API-тестов;
6. обязательные тесты после адаптационного патча;
7. запреты, acceptance criteria и stop conditions.

## 1. Baseline и границы

На ветке `stage06-wb-terminal-2026-09-08` текущий `wildberries/README.md` всё ещё фиксирует research-state и отсутствие принятого production extension. Поэтому любые поздние WB prototypes/evidence не считаются автоматически authority для этой ветки без отдельной readback/reconciliation.

Текущие исследовательские authorities:

- `WB_API_CAPABILITY_AUDIT_2026-08-10.md`;
- `WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md`;
- `READ_ONLY_OPERATION_MATRIX_V1.md`.

При конфликте приоритет:

1. актуальная официальная Wildberries API документация на дату coding/testing;
2. свежая подтверждённая real-account evidence;
3. `WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md`;
4. старый audit/matrix.

### Hard boundaries

- не копировать Ozon endpoints, aliases, rate limits, entitlement rules, FBO/FBS/FBP semantics или Seller/Performance деление в WB;
- не выполнять write/mutation WB operations в рамках этого parity-прохода;
- реальные тесты — только минимально необходимые read-only calls;
- не вводить hidden pagination, hidden polling, hidden retry или hidden fan-out;
- не повторять запрос с неопределённым outcome;
- credentials не передаются в LLM и не сохраняются в evidence;
- Personal Data OFF означает provider calls = 0 для gated operation;
- disabled/unsupported operation должна завершаться локально, а не зависать в `BUSY`;
- любой batch обязан прийти в terminal state;
- Ozon-specific цифры и ограничения не являются WB authority.

---

# 2. Порядок исполнения

Работа выполняется ровно пятью пакетами.

## PHASE 1 — прямой перенос всего provider-neutral функционала

Перенести весь раздел A ниже одним согласованным пакетом или минимальным числом связанных патчей. Реальный WB API для этого не требуется.

## PHASE 2 — тестирование прямого переноса

Прогнать полный набор тестов T-A. До PASS запрещено переходить к real WB API characterization.

## PHASE 3 — пакетные реальные WB API-тесты

Выполнить максимально возможное число read-only проверок за один проход по каждой token/API family. Цель — получить данные для всех адаптаций раздела B, а не чинить по одной функции за один вызов.

## PHASE 4 — адаптационный патч

На основании PHASE 3 материализовать WB-specific allowlist/config/contracts, включить подтверждённые operations и адаптировать runtime policies.

## PHASE 5 — post-patch acceptance

Прогнать T-B + T-C: локальные regressions, mocked provider tests, browser/MV3 tests и минимальный повторный real-account acceptance набор. Только после полного PASS можно считать parity-пакет принятым.

---

# 3. ПАКЕТ A — можно переносить сразу без дополнительных реальных WB API-тестов

Ниже «без дополнительных API-тестов» означает: перенос разрешён без вызовов Wildberries API, но локальные unit/integration/browser regressions обязательны.

## A01. Multi-AI adapter framework

Перенести:

- provider-neutral AI adapter interface;
- ChatGPT adapter lifecycle;
- Alice adapter lifecycle;
- AI detection;
- composer discovery;
- send-control abstraction;
- delivery capability abstraction;
- fail-closed unknown-AI behavior;
- per-AI delivery policy boundary.

Не переносить Ozon-specific bootstrap text.

## A02. Conversation identity and binding

Перенести:

- AI provider identity;
- conversation ID binding;
- binding revision/generation;
- source label;
- protection from cross-chat delivery;
- rebinding rules;
- new-chat bootstrap handoff.

## A03. Canonical WB command envelope parser

Использовать WB envelope:

```text
WB_API_V1
{"operation":"alias","params":{}}
```

Требования:

- только canonical envelope + один JSON object;
- `operation` + `params`;
- неизвестные top-level поля reject;
- URL/method/headers/auth от LLM reject;
- malformed input => provider calls 0;
- Markdown fence не является частью protocol boundary.

## A04. Ordered multi-command parser

Перенести:

- обнаружение нескольких explicit envelopes в одном assistant response;
- source-order preservation;
- N explicit commands => не более N physical provider calls;
- dependency-aware prohibition on speculative execution.

## A05. Manual / Autorun parser unification

Manual и Autorun используют один command parser и одни execution semantics. Отличается только capture source.

## A06. Mixed HELP/API ordered parsing

Ввести:

```text
WB_HELP_V1
```

и поддержать один response, содержащий HELP + API envelopes в исходном порядке.

## A07. Logical request / physical request model

Перенести отдельные идентификаторы и provenance:

- logical command id;
- logical fingerprint;
- physical request id;
- physical fingerprint;
- `external_request_executed`;
- mapping logical result -> physical evidence.

## A08. Exactly-once / no-blind-retry invariant

Перенести:

- unknown outcome => no automatic retry;
- restart/reload/MV3 sleep не дают права повторить provider request;
- quota wait не означает retry;
- delivery recovery не означает provider retry.

## A09. Sequential batch runtime

Перенести:

- ordered execution;
- explicit command boundaries;
- terminal-state accounting;
- no hidden fan-out;
- no hidden pagination;
- no hidden polling.

## A10. Batch terminalization guard

Любой unexpected exception обязан завершать item/batch terminal error. Вечный `BUSY` запрещён.

## A11. Disabled/unsupported local admission

Перенести preflight:

`discover -> preflightExecution -> execute only if enabled`.

Disabled alias должна дать локальный structured error и 0 provider calls.

## A12. Work Session state machine

Перенести состояния и controls:

- inactive;
- active_visible;
- active_hidden;
- recovering;
- error;
- Start;
- Refresh;
- Show/Hide;
- Finish.

Work Session не должна быть тождественна provider request state.

## A13. Work Session durability

Перенести восстановление после:

- popup close;
- tab reload;
- MV3 worker sleep;
- runtime restart.

## A14. Refresh single-flight

Повторный Refresh при активном Refresh => локальный `already in progress`, без второй recovery chain.

## A15. Runtime generation handshake

После reinit/reload старые observers/callbacks не должны продолжать работу как current generation.

## A16. Response boundary after refresh

Assistant output, существовавший до Refresh/rebind, не должен повторно приниматься как новая команда.

## A17. Finish Work Session no-Autorun invariant

Finish не может побочно запускать Autorun или новый provider request.

## A18. Work resume vs provider status separation

Успешное восстановление Work Session не является доказательством возможности повторить старый provider request.

## A19. Operation Registry framework

Перенести единый registry schema как authority для:

- alias;
- provider family;
- method/path metadata;
- semantic effect;
- request style;
- execution enabled;
- currentness;
- safety/privacy class;
- entitlement rule;
- workflow role;
- guidance;
- example/template;
- rate-limit policy reference;
- pagination policy reference;
- cache policy reference.

WB-specific values заполняются только в PHASE 4.

## A20. Guidance / HELP framework

HELP генерируется из того же operation registry, что execution. Не поддерживать отдельный ручной каталог, который может разойтись с runtime.

## A21. Personal Data Gate framework

Перенести механизм gate:

- safe projection;
- personal-data gated operation;
- OFF => 0 provider calls;
- включение gate не replay старую command;
- требуется новая explicit command.

Конкретная WB классификация полей — PHASE 3/4.

## A22. Entitlement framework

Перенести общий механизм:

- `supported_and_entitled`;
- `supported_but_not_entitled`;
- `entitlement_unknown`;
- `unsupported`.

WB-specific token/category/Jam rules не включать до PHASE 3.

## A23. Semantic effect classifier framework

Перенести правило: HTTP method не определяет semantic effect. POST может быть read. Решение берётся из reviewed operation authority.

## A24. Provider response verifier framework

Перенести проверку:

- transport success;
- HTTP status;
- body parse;
- schema validation;
- semantic provider error;
- sanitation;
- safe user-facing error;
- internal diagnostic without secrets.

WB schemas/errors — PHASE 3/4.

## A25. Global quota scheduler engine

Перенести движок:

- account/token scoped quota state;
- family-level coordination;
- cross-tab sharing;
- alarm/resume;
- `Retry-After` storage;
- countdown UI;
- no automatic retry.

WB rate values/families — только PHASE 3/4.

## A26. Cache engine

Перенести механизм, но оставить WB operation caching disabled по умолчанию до characterization:

- account-scoped key;
- request fingerprint;
- TTL metadata;
- exact reuse;
- optional reviewed superset reuse;
- provenance;
- no cache for error/malformed responses.

## A27. Coalescing planner framework

Перенести planner interface и safety gates, но не включать ни одного WB coalescing rule до PHASE 3.

## A28. Semantic prefetch framework

Перенести только capability/config framework. Для WB default = disabled до доказательства безопасности.

## A29. Dynamic schema/metadata compiler framework

Перенести compiler/runtime infrastructure и last-known-good snapshot policy. WB source adapters/snapshots — PHASE 3/4.

## A30. Last-known-good authority policy

Новая metadata не становится authority только потому, что она свежее. Битая/неполная metadata => last-known-good или fail-closed.

## A31. Effective Date Contract framework

Перенести типы ограничений:

- date;
- date-time;
- rolling window;
- max history;
- today/future only;
- dynamic min/max;
- relative period.

WB values — PHASE 3/4.

## A32. Report/document workflow model

Перенести generic lifecycle:

`start/read-effect -> reference/task -> explicit next command/status/download`.

Запрещён скрытый polling.

## A33. Durable opaque artifact/file references

Большие файлы/binary payload не должны храниться как огромная inline/base64 строка в transient message state.

## A34. Generic browser file attachment primitive

Перенести создание настоящего File/DataTransfer attachment в AI composer.

## A35. MIME-aware file delivery

Поддержать как transport-level capability:

- TXT;
- CSV;
- XLSX;
- PDF;
- ZIP;
- PNG;
- generic binary.

## A36. Named runtime Port for file delivery

Перенести отдельный durable channel для тяжёлой доставки вместо одного oversized message.

## A37. Chunked attachment transfer

Перенести chunk/reassembly lifecycle с integrity checks.

## A38. Attachment wake worker

Если AI content context уснул, восстанавливать delivery context, а не повторять marketplace request.

## A39. Pending attachment recovery on normal startup

При обычной загрузке content runtime проверяет незавершённую attachment delivery.

## A40. Provider truth preservation on artifact failure

Ошибка artifact store/attachment delivery не должна переписывать успешный provider result как provider failure.

## A41. Mixed result + file completeness

Если batch содержит text + file results, не терять text и не объявлять file attached до успешного attachment result.

## A42. Large result -> document

Если result превышает безопасный размер для конкретного AI, полный payload идёт в attachment, а не обрезается.

## A43. Per-AI delivery thresholds

Threshold определяется AI adapter/capability, не marketplace provider. Значения проверяются browser/UI tests, не WB API.

## A44. Alice oversized TXT delivery

Перенести shared Alice behavior для большого текста как attachment.

## A45. Alice blocked-send guard

Перенести только после локального/live-browser подтверждения current Alice DOM: файл может быть уже добавлен, а Send временно blocked. Runtime должен ждать допустимое terminal transition, а не объявлять преждевременный failure.

## A46. Alice auto-send closed-set/source-order gate

Auto-send разрешается только после подтверждённой конечной последовательности UI states.

## A47. New-chat/bootstrap lifecycle

Перенести:

- editable bootstrap before conversation ID;
- wait for real conversation identity;
- bind only after resolved identity;
- preserve source ordering.

## A48. Composer readiness wait

Готовый provider result не должен теряться из-за того, что composer ещё не появился. Delivery waits for correct composer within bounded local policy.

## A49. XLSX implicit cell reference support

Parser не должен предполагать обязательный explicit cell `r="A1"`.

## A50. XLSX namespace tolerance

Поддержать корректный worksheet XML namespace parsing.

## A51. Fail-closed mixed HELP/API materialization

Невозможно безопасно материализовать ordered mixed batch => provider calls 0.

## A52. Local diagnostics and audit log framework

Перенести structured diagnostics, request IDs, state transitions, error classes и secret redaction.

## A53. Deterministic QA/materializer gates

Перенести принцип: каждый серьёзный runtime patch сопровождается deterministic regression/materializer gate, а не только ручным smoke-test.

---

# 4. T-A — обязательные тесты после PHASE 1

Все T-A должны выполняться без реального WB provider call. Где требуется provider behavior — использовать deterministic mock.

## Parser / protocol

- [ ] `TA-001` single valid `WB_API_V1` envelope parses exactly once.
- [ ] `TA-002` two valid envelopes preserve source order.
- [ ] `TA-003` malformed JSON => 0 mocked provider calls.
- [ ] `TA-004` unknown top-level field => reject before provider.
- [ ] `TA-005` LLM-supplied URL rejected.
- [ ] `TA-006` LLM-supplied headers/auth rejected.
- [ ] `TA-007` Markdown fence does not alter protocol boundary.
- [ ] `TA-008` mixed `WB_HELP_V1 + WB_API_V1` preserves order.
- [ ] `TA-009` disabled alias resolves locally with 0 provider calls.
- [ ] `TA-010` unsupported alias resolves locally with 0 provider calls.

## Batch / exactly-once

- [ ] `TA-011` N explicit commands produce <= N physical mock calls.
- [ ] `TA-012` batch executes sequentially where required.
- [ ] `TA-013` dependent command is not speculatively executed.
- [ ] `TA-014` unexpected processor exception terminalizes batch.
- [ ] `TA-015` no terminal path leaves permanent `BUSY`.
- [ ] `TA-016` unknown request outcome is not retried.
- [ ] `TA-017` reload after unknown outcome does not retry.
- [ ] `TA-018` quota alarm resume does not retry old request.

## Conversation / Work Session

- [ ] `TA-019` result cannot be delivered to another conversation binding.
- [ ] `TA-020` rebind increments/changes generation.
- [ ] `TA-021` stale observer cannot submit after reinit.
- [ ] `TA-022` Refresh is single-flight.
- [ ] `TA-023` Finish does not start Autorun.
- [ ] `TA-024` old assistant response before Refresh is not recaptured.
- [ ] `TA-025` Work Session recovers after popup close.
- [ ] `TA-026` Work Session recovers after tab reload.
- [ ] `TA-027` Work Session recovers after simulated MV3 worker sleep.
- [ ] `TA-028` Work Session recovery does not imply provider retry.

## Registry / HELP / gates

- [ ] `TA-029` HELP derives operation data from registry authority.
- [ ] `TA-030` disabled registry operation is not executable.
- [ ] `TA-031` Personal Data OFF blocks gated operation before provider.
- [ ] `TA-032` turning Personal Data ON does not replay old command.
- [ ] `TA-033` entitlement unknown can fail/hold locally without accidental execution according to policy.
- [ ] `TA-034` semantic effect is independent of HTTP method.
- [ ] `TA-035` last-known-good metadata survives malformed fresh snapshot.

## Quota / cache / planner frameworks

- [ ] `TA-036` quota state is scoped by account/token identity.
- [ ] `TA-037` same account across two tabs shares scheduler state.
- [ ] `TA-038` different account identities do not share quota state.
- [ ] `TA-039` `Retry-After` schedules eligibility but does not retry automatically.
- [ ] `TA-040` WB cache is disabled by default before characterization.
- [ ] `TA-041` cached error/malformed payload is impossible.
- [ ] `TA-042` WB coalescing rules default to none.
- [ ] `TA-043` WB semantic prefetch default is disabled.

## File / large-result delivery

- [ ] `TA-044` TXT attachment delivery works in browser mock profile.
- [ ] `TA-045` CSV attachment delivery works.
- [ ] `TA-046` XLSX attachment delivery works.
- [ ] `TA-047` PDF attachment delivery works.
- [ ] `TA-048` ZIP/generic binary attachment delivery works.
- [ ] `TA-049` file is not declared attached before successful composer attachment.
- [ ] `TA-050` attachment failure preserves provider truth.
- [ ] `TA-051` pending attachment survives worker restart.
- [ ] `TA-052` normal startup resumes pending delivery.
- [ ] `TA-053` delivery recovery produces 0 provider retries.
- [ ] `TA-054` named-Port/chunk reassembly preserves byte integrity.
- [ ] `TA-055` mixed text+file batch preserves complete text.
- [ ] `TA-056` oversized result becomes full attachment, not truncated text.
- [ ] `TA-057` per-AI threshold chooses different mode where configured.
- [ ] `TA-058` composer-not-ready waits instead of dropping result.

## XLSX regressions

- [ ] `TA-059` XLSX without explicit cell `r` parses correctly.
- [ ] `TA-060` XLSX worksheet namespace variants parse correctly.

## Alice / ChatGPT browser adapters

- [ ] `TA-061` ChatGPT text delivery smoke PASS.
- [ ] `TA-062` ChatGPT attachment delivery smoke PASS.
- [ ] `TA-063` Alice text delivery smoke PASS.
- [ ] `TA-064` Alice oversized TXT attachment smoke PASS.
- [ ] `TA-065` Alice blocked-send state waits and later sends once.
- [ ] `TA-066` Alice blocked-send timeout fails locally without duplicate send.
- [ ] `TA-067` new-chat bootstrap waits for resolved conversation ID.

### PHASE 2 gate

`PHASE_2 = PASS` только если `TA-001..TA-067` PASS либо отдельный test помечен `NOT_APPLICABLE` с записанным техническим основанием. Ни один FAIL нельзя замаскировать как warning.

---

# 5. ПАКЕТ B — требует реальных WB API-тестов перед включением

Ниже переносится не Ozon-значение, а только после characterization формируется WB-specific authority.

## B01. Seller/account identity

Подтвердить current `seller-info` behavior, token types, identity fields и account-scoping key для quota/cache/provenance.

## B02. Token categories and auth variants

Для реально доступных токенов подтвердить:

- Bearer behavior;
- category access;
- Personal/Service/Basic distinctions, если применимы;
- необходимость `X-Client-Secret`, если применимо;
- 401/403 distinctions.

## B03. Subscription/Jam entitlement

Подтвердить current subscription endpoint и фактическую связь entitlement с Analytics/Search capabilities. Не считать Jam requirement доказанным только по старой документации.

## B04. Current operation allowlist

Повторно сверить official Swagger/release notes и классифицировать каждую операцию:

- current read;
- current mutation;
- deprecated/sunset;
- unsupported/unresolved;
- personal-data gated;
- entitlement gated.

## B05. Exact request/response schemas

Для включаемых operations получить реальные response shapes и подтвердить schema compiler/validator.

## B06. Rate limits and quota families

Реально проверить/document-confirm:

- per-family interval/window;
- burst;
- scope: token/account/IP/endpoint;
- headers;
- `Retry-After` semantics;
- 429 body.

Не намеренно доводить аккаунт до агрессивного rate-limit stress, если официальный ответ/headers можно получить безопаснее.

## B07. Error envelope matrix

Получить безопасные реальные примеры/формы:

- 400 validation;
- 401 invalid/missing auth via controlled non-secret fixture where safe;
- 403 entitlement/category;
- 404 where meaningful;
- 429 only if безопасно и необходимо;
- provider 5xx only observationally, не провоцировать.

## B08. Cards cursor pagination

Проверить:

- first page;
- cursor fields;
- next page explicit request;
- termination;
- max page size;
- stable identities;
- no hidden pagination.

## B09. Cards trash

Проверить отдельную operation/schema/access.

## B10. Prices and discounts

Проверить:

- page size/offset;
- currency/price/discount fields;
- next-page contract;
- category/token access.

## B11. Seller warehouses

Проверить warehouse list и stable warehouse identity.

## B12. FBS stocks per warehouse

Проверить request schema, item limits, current rate family и zero/empty behavior.

## B13. WB warehouse-remains async report

Проверить полностью, но без hidden polling:

1. create/start;
2. task reference;
3. explicit status request;
4. explicit download after ready;
5. MIME/file name/content-disposition;
6. expiry/error behavior.

## B14. Sales funnel products

Проверить date window, comparison schema, pagination/limit, entitlement и metrics.

## B15. Sales funnel history

Проверить allowed history window и distinction direct history vs generated report.

## B16. Generated seller analytics

Проверить task/download lifecycle, Jam/subscription restrictions, file format, TTL/storage и rate limits.

## B17. Search analytics/report family

Проверить exact current methods, entitlement/Jam restrictions, date/period contract, pagination и metric schema.

## B18. FBS new orders

Проверить schema, pagination/empty state, PII fields и Personal Data classification.

## B19. FBS order history

Проверить max 30-day contract, pagination, boundaries, timezone/date semantics и PII.

## B20. FBS order statuses

Подтвердить POST-as-read semantic effect и request identifier limits.

## B21. Goods returns analytics

Проверить current endpoint/schema/date contract и PII/sensitive fields.

## B22. Finance sales report list

Проверить pagination/date parameters/current schema.

## B23. Finance period detail

Проверить historical lower boundary, pagination/large result и decimal precision.

## B24. Finance report-ID detail

Проверить ID type/precision и availability dates.

## B25. Acquiring list/detail

Проверить country/account restrictions и 403/empty distinctions.

## B26. Promotion campaign groups

Проверить status/type grouping semantics и rate limit.

## B27. Promotion campaign info

Проверить maximum campaign IDs/request, schema и pagination/chunking rules. Никакого hidden fan-out.

## B28. Promotion search-cluster stats

Проверить exact current endpoint, date period, metrics, request cardinality и restrictions.

## B29. Promotion calendar/details/nomenclatures

Проверить current schemas, pagination и token access.

## B30. Feedbacks

Проверить pagination, date/status filters, PII/content fields, rate limit.

## B31. Questions

Проверить pagination, PII/content fields, rate limit.

## B32. Seller rating

Проверить token restrictions и aggregate schema.

## B33. Cache eligibility by operation

На основании provider semantics назначить для каждой operation:

- cache disabled;
- exact-only TTL;
- safe superset reuse if formally proved;
- no-cache sensitive/personal/live-state cases.

## B34. Safe coalescing candidates

Искать только там, где два logical requests можно доказуемо обслужить одним идентичным physical request без потери semantics и без расширения чувствительности. Default = none.

## B35. Semantic prefetch candidates

Включать только после доказательства, что prefetch не увеличивает call count/risk, не раскрывает лишние данные и не ломает quota contract. Default = disabled.

## B36. Effective Date Contract values

Материализовать реальные min/max/history windows по каждой operation.

## B37. Personal Data classification

На реальных schemas определить fields/operations, требующие Personal Data Gate.

## B38. Binary/report delivery from real WB

Подтвердить настоящие provider filenames, MIME, content disposition, empty file behavior, generated CSV/XLSX/ZIP если такие реально выдаются.

## B39. Cursor/task/reference durability

Проверить, какие provider refs можно безопасно сохранять и использовать после worker/tab restart, и их expiry.

## B40. Business workflow transparency

Для cards/prices/orders/reports/campaigns/finance доказать, что multi-step workflows остаются explicit и не маскируются под один скрытый request.

---

# 6. PHASE 3 — пакетный real WB API characterization plan

Цель — не делать по одному тесту на один патч. Все доступные read-only проверки объединяются по token category/family и выполняются сериями с сохранением evidence.

## Batch R1 — Common / identity / entitlement

Одним проходом:

- [ ] `R1-01` seller identity;
- [ ] `R1-02` subscriptions/Jam;
- [ ] `R1-03` token category behavior;
- [ ] `R1-04` entitlement projection;
- [ ] `R1-05` sanitized 401/403 behavior if safe;
- [ ] `R1-06` account-scoping identity for scheduler/cache.

## Batch R2 — Content

- [ ] `R2-01` cards page 1;
- [ ] `R2-02` explicit cursor page 2 if cursor exists;
- [ ] `R2-03` end-of-pagination behavior;
- [ ] `R2-04` cards trash;
- [ ] `R2-05` schema/currentness;
- [ ] `R2-06` rate headers/limits observationally.

## Batch R3 — Prices + seller warehouse + FBS stocks

- [ ] `R3-01` prices page 1;
- [ ] `R3-02` explicit offset page 2 if applicable;
- [ ] `R3-03` warehouses;
- [ ] `R3-04` stocks for one valid warehouse;
- [ ] `R3-05` empty/zero stock semantics where naturally present;
- [ ] `R3-06` rate-limit family evidence.

## Batch R4 — Analytics/search/generated reports

Максимально одним authorization context:

- [ ] `R4-01` sales funnel products;
- [ ] `R4-02` funnel history;
- [ ] `R4-03` warehouse-remains task create;
- [ ] `R4-04` explicit status;
- [ ] `R4-05` explicit download if ready;
- [ ] `R4-06` generated analytics create/list/status/download where current API allows;
- [ ] `R4-07` search analytics/report;
- [ ] `R4-08` Jam/entitlement distinction;
- [ ] `R4-09` date-contract boundaries using safe valid/invalid parameters;
- [ ] `R4-10` binary MIME/filename/content checks.

## Batch R5 — Orders / returns

- [ ] `R5-01` new orders;
- [ ] `R5-02` order history valid period;
- [ ] `R5-03` controlled >30-day invalid request to confirm local/preflight contract where official contract is already authoritative; avoid provider call if local rule is sufficient;
- [ ] `R5-04` explicit next page if pagination exists;
- [ ] `R5-05` statuses lookup on safe known identifiers if available;
- [ ] `R5-06` returns analytics;
- [ ] `R5-07` Personal Data field inventory.

## Batch R6 — Finance

- [ ] `R6-01` report list;
- [ ] `R6-02` period detail for small bounded period;
- [ ] `R6-03` report-ID detail where a valid report ID is naturally available;
- [ ] `R6-04` acquiring list;
- [ ] `R6-05` acquiring detail where available;
- [ ] `R6-06` decimal/ID precision;
- [ ] `R6-07` large-result/file behavior;
- [ ] `R6-08` account/country restriction evidence.

## Batch R7 — Promotion / calendar

- [ ] `R7-01` promotion groups;
- [ ] `R7-02` campaign info for bounded known IDs;
- [ ] `R7-03` search-cluster stats;
- [ ] `R7-04` calendar;
- [ ] `R7-05` promotion details;
- [ ] `R7-06` nomenclatures;
- [ ] `R7-07` request cardinality/rate rules.

## Batch R8 — Feedback / questions / rating

- [ ] `R8-01` feedbacks;
- [ ] `R8-02` questions;
- [ ] `R8-03` rating;
- [ ] `R8-04` pagination;
- [ ] `R8-05` PII/content inventory;
- [ ] `R8-06` rate/access behavior.

### PHASE 3 evidence requirements

Для каждого вызова сохранить без credentials:

- UTC/local timestamp;
- operation alias candidate;
- official endpoint + method;
- token category, но не token value;
- sanitized request params;
- HTTP status;
- relevant rate-limit headers;
- response shape/schema fingerprint;
- pagination/task/reference fields;
- PII classification notes;
- currentness source;
- provider-call count;
- verdict: `READY / GATED / DISABLED / DEPRECATED / NEEDS_RECHECK`.

---

# 7. PHASE 4 — что материализуется после real WB tests

После PHASE 3 создать один reviewed WB implementation authority, затем патчить runtime.

Обязательные outputs:

1. `WB_IMPLEMENTATION_OPERATION_REGISTRY_V1.*` — executable/disabled/currentness/safety/entitlement authority;
2. WB rate-limit family config;
3. WB entitlement/token-category config;
4. WB effective-date contracts;
5. WB request/response schemas;
6. WB PII/Personal Data policy map;
7. WB pagination/task/reference rules;
8. WB cache policy map;
9. WB coalescing policy map — default none unless proved;
10. WB semantic prefetch policy — default disabled unless proved;
11. WB binary/report MIME mapping;
12. updated `WB_HELP_V1` guidance generated from registry;
13. full regression fixtures from sanitized real responses;
14. explicit disabled/deprecated operation list.

Никакая operation не включается только потому, что существовала в августовском research matrix.

---

# 8. T-B — тесты adapted WB provider layer после PHASE 4

## Registry / currentness

- [ ] `TB-001` every implemented alias exists exactly once in reviewed registry.
- [ ] `TB-002` no deprecated endpoint executable.
- [ ] `TB-003` no unresolved endpoint executable.
- [ ] `TB-004` HELP and execution registry counts reconcile.
- [ ] `TB-005` each executable operation has semantic effect, entitlement, PII, date, quota and pagination policy.

## Auth / entitlement

- [ ] `TB-006` wrong token category fails before/at provider with correct classification.
- [ ] `TB-007` entitlement/Jam unavailable operation is not treated as transport bug.
- [ ] `TB-008` credentials never appear in LLM result/log fixture.
- [ ] `TB-009` Personal Data OFF => gated operation provider calls 0.
- [ ] `TB-010` Personal Data ON requires a new explicit command.

## Schema / errors

- [ ] `TB-011` valid real fixture passes schema validation.
- [ ] `TB-012` missing required field fixture fails verifier deterministically.
- [ ] `TB-013` malformed body not cached.
- [ ] `TB-014` 400 normalized correctly.
- [ ] `TB-015` 401 normalized correctly.
- [ ] `TB-016` 403 entitlement/access normalized correctly.
- [ ] `TB-017` 429 schedules quota state without automatic retry.

## Pagination / tasks

- [ ] `TB-018` cards cursor explicit next-page command works.
- [ ] `TB-019` prices offset explicit next-page command works.
- [ ] `TB-020` orders pagination explicit next-page command works.
- [ ] `TB-021` no operation performs hidden next page.
- [ ] `TB-022` async report status requires explicit next command.
- [ ] `TB-023` async report download requires explicit next command.
- [ ] `TB-024` task/cursor expiry produces terminal structured error.

## Date contracts

- [ ] `TB-025` valid date boundaries accepted.
- [ ] `TB-026` locally known invalid date range rejected with provider calls 0.
- [ ] `TB-027` timezone/date serialization matches WB contract.

## Quota

- [ ] `TB-028` each tested API family maps to correct scheduler family.
- [ ] `TB-029` shared-account concurrent tabs do not violate configured interval.
- [ ] `TB-030` unrelated API family is not unnecessarily blocked if WB docs/evidence prove separate quota.
- [ ] `TB-031` restart preserves next-eligible timestamp.

## Cache/coalescing/prefetch

- [ ] `TB-032` operations marked no-cache never reuse old result.
- [ ] `TB-033` exact-cache operation reuses only same account+fingerprint within TTL.
- [ ] `TB-034` no cross-account reuse.
- [ ] `TB-035` coalescing remains disabled unless a rule has explicit proof fixture.
- [ ] `TB-036` semantic prefetch remains disabled unless explicitly approved.
- [ ] `TB-037` any enabled coalescing produces same logical outputs as separate fixtures.

## Provider family smoke matrix

- [ ] `TB-038` common identity smoke.
- [ ] `TB-039` content/cards smoke.
- [ ] `TB-040` prices smoke.
- [ ] `TB-041` warehouse/stocks smoke.
- [ ] `TB-042` analytics funnel smoke.
- [ ] `TB-043` generated/warehouse-remains task smoke.
- [ ] `TB-044` search analytics smoke if entitled.
- [ ] `TB-045` orders smoke.
- [ ] `TB-046` returns smoke if available.
- [ ] `TB-047` finance smoke.
- [ ] `TB-048` promotion smoke.
- [ ] `TB-049` feedback/questions smoke.

---

# 9. T-C — full end-to-end acceptance after PHASE 4

Эти тесты проверяют уже весь Bridge, а не только provider adapter.

- [ ] `TC-001` ChatGPT -> one WB command -> one provider request -> one exact result.
- [ ] `TC-002` Alice -> one WB command -> one provider request -> one exact result.
- [ ] `TC-003` three independent explicit WB commands -> ordered results, <=3 requests.
- [ ] `TC-004` HELP + API + HELP + API mixed response preserves source order.
- [ ] `TC-005` disabled alias inside batch terminalizes locally and following valid explicit item follows defined batch policy without permanent BUSY.
- [ ] `TC-006` provider 429 does not cause hidden retry.
- [ ] `TC-007` reload during quota wait preserves state and does not duplicate call.
- [ ] `TC-008` reload after completed provider call but before delivery restores result without provider retry.
- [ ] `TC-009` large text result delivered as full attachment when threshold crossed.
- [ ] `TC-010` real WB generated report/binary result delivered byte-identical to captured provider artifact where applicable.
- [ ] `TC-011` attachment delivery failure preserves provider-success provenance.
- [ ] `TC-012` Work Session Refresh does not replay pre-refresh assistant output.
- [ ] `TC-013` Finish Work Session creates 0 WB provider calls.
- [ ] `TC-014` cross-conversation result delivery blocked.
- [ ] `TC-015` Personal Data OFF blocks gated real operation before network.
- [ ] `TC-016` no secret/token/client secret appears in UI response, exported artifact or persisted diagnostic.
- [ ] `TC-017` currentness-disabled/deprecated operation cannot execute.
- [ ] `TC-018` cards explicit cursor continuation works after normal conversation turn.
- [ ] `TC-019` async report explicit task/status/download workflow works without hidden polling.
- [ ] `TC-020` browser extension survives MV3 worker sleep between task/status or result/delivery steps.
- [ ] `TC-021` exact provider-call accounting equals recorded physical-request accounting.
- [ ] `TC-022` all batches reach terminal state.
- [ ] `TC-023` QA detects deliberate stale/deprecated endpoint fixture.
- [ ] `TC-024` QA detects deliberate hidden-retry fixture.
- [ ] `TC-025` QA detects deliberate cross-account cache fixture.

---

# 10. Что специально НЕ переносить из Ozon

Нельзя переносить как WB authority:

- Ozon Seller endpoints;
- Ozon Performance endpoints;
- `Client-Id`/Ozon `Api-Key`/Performance bearer semantics;
- Ozon subscription/Premium rules;
- Ozon Seller vs Performance topology;
- Ozon rate-limit numbers;
- Ozon analytics metric-union limits;
- Ozon B1-B49 aliases;
- Ozon FBO/FBS/FBP-specific business semantics;
- Ozon campaign/SKU contracts;
- Ozon date windows;
- Ozon Swagger snapshots;
- Ozon operation-count totals.

Старые rolled-back Ozon lifecycle/timeout experiments также не переносить, если они были заменены более поздним accepted terminalization/admission design.

---

# 11. Stop conditions

Работа останавливается и не продолжает автоматическое включение операции, если:

- official docs и real behavior конфликтуют materially;
- token category неизвестна;
- semantic effect read/write не доказан;
- endpoint deprecated/sunset/unresolved;
- PII classification неизвестна для чувствительных полей;
- rate-limit family неизвестна и операция способна дать высокий fan-out;
- task/pagination semantics неизвестны;
- реальный response расходится со schema authority;
- provider outcome неизвестен;
- тест выявил duplicate provider call;
- batch остаётся non-terminal;
- delivery failure приводит к повторному WB request.

Такое состояние получает `NEEDS_RECHECK / DISABLED`, а не временный permissive bypass.

---

# 12. Финальный acceptance gate

Parity migration считается завершённой только при одновременном выполнении:

```text
PHASE_1_DIRECT_TRANSFER = COMPLETE
PHASE_2_DIRECT_REGRESSION = PASS
PHASE_3_WB_API_CHARACTERIZATION = COMPLETE_FOR_AVAILABLE_TOKEN_FAMILIES
PHASE_4_ADAPTATION_PATCH = COMPLETE
PHASE_5_FINAL_REGRESSION = PASS
REAL_WB_SMOKE_MATRIX = PASS_OR_EXPLICITLY_GATED
HIDDEN_PROVIDER_RETRY = 0
HIDDEN_PAGINATION = 0
HIDDEN_POLLING = 0
CROSS_ACCOUNT_CACHE = 0
CROSS_CONVERSATION_DELIVERY = 0
PERMANENT_BUSY_PATHS = 0
CREDENTIAL_LEAKS = 0
UNREVIEWED_EXECUTABLE_OPERATIONS = 0
```

Операции, недоступные текущему реальному токену, не считаются автоматически сломанными. Они должны быть явно `GATED / NOT_ENTITLED / UNTESTED_REAL_ACCOUNT`, оставаться disabled до отдельного acceptance и не блокировать принятие уже доказанного provider-neutral runtime.
