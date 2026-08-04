# Data Schema Contract — IDs, provenance и канонические observations

Версия: 1.0  
Дата: 2026-08-04  
Статус: **канонический контракт схем исследовательских данных**

Этот документ дополняет `DATA_ARCHITECTURE.md` и фиксирует идентификаторы, provenance, null/status semantics и минимальные канонические схемы normalized observations.

## 1. Базовые сущности

В системе различаются четыре сущности:

- **Query** — поисковая формулировка/тема, которую можно связывать между источниками.
- **Measurement** — один конкретный съём: один API-вызов, один SERP capture, один запрос к Alice, один snapshot страницы/отзыва.
- **Observation** — одна нормализованная запись, полученная из measurement. Один measurement может породить много observations.
- **Ledger record** — текущее сводное состояние Query; не заменяет measurement/observation.

Пример: один `getTop("печать велеса")` = один `measurement_id`, но 100 phrase-results + associations могут стать множеством `observation_id`.

## 2. `query_id`

`query_id` должен быть стабильным для одной и той же поисковой формулировки независимо от источника.

Перед вычислением ID текст приводится к canonical form:

1. Unicode NFC;
2. trim по краям;
3. последовательности whitespace → один пробел;
4. lower-case;
5. операторы Wordstat (`"`, `!`, `[]` и др.) **не удаляются**, если они меняют смысл измерения; операторный вариант является отдельной query-формой.

Формат:

`q_<12 hex>`

где `<12 hex>` — первые 12 символов SHA-256 от UTF-8 canonical query string.

Исходный `query_text` всегда хранится рядом; ID никогда не используется вместо текста в аналитике.

## 3. `measurement_id`

`measurement_id` идентифицирует один факт съёма.

Формат:

`m_<source>_<YYYYMMDDTHHMMSSZ>_<8hex>`

`8hex` — первые 8 символов SHA-256 от строки:

`source|observed_at|root_query_canonical|region|device|operation|raw_ref`

Примеры source:

- `wordstat`;
- `yandex_serp`;
- `alice`;
- `customer`;
- `marketplace`;
- `webmaster_search`;
- `webmaster_alice`;
- `metrika`;
- `commerce`.

Повторный съём всегда получает новый `measurement_id`.

## 4. `observation_id`

`observation_id` идентифицирует одну normalized-запись внутри measurement.

Формат:

`o_<measurement_id_without_prefix>_<kind>_<NNNN>`

где:

- `kind` — тип observation (`phrase`, `serp`, `alice_source`, `fanout`, `review`, `listing`, и т. п.);
- `NNNN` — стабильный порядковый номер внутри measurement, начиная с `0001`.

Observation нельзя переиспользовать для другого факта. Если нормализация была ошибочной, старая запись может быть помечена `INVALID`, а исправленная получает новый observation ID или новую schema-version запись с явной ссылкой на исходную.

## 5. Общий envelope normalized observation

Каждая normalized observation обязана иметь минимум:

| Поле | Назначение |
|---|---|
| `schema_version` | версия схемы, начиная с `1.0` |
| `measurement_id` | ID съёма |
| `observation_id` | ID нормализованного факта |
| `source_type` | provenance-тип |
| `evidence_mode` | `OBSERVED`, `INFERRED` или `DERIVED` |
| `observation_kind` | конкретный тип записи |
| `root_query_id` | query, который инициировал measurement, если применимо |
| `root_query_text` | исходный root query |
| `query_id` | query, к которому относится конкретная observation, если применимо |
| `query_text` | текст конкретной query/formulation |
| `observed_at` | ISO 8601 UTC |
| `region` | регион измерения или `null` с явным status |
| `device` | устройство/scope или `null` с явным status |
| `raw_ref` | repo-relative путь к raw evidence |
| `source_ref` | URL/внешний идентификатор источника, если есть |
| `record_status` | `VALID`, `INVALID`, `SUPERSEDED` |
| `notes` | только пояснение, не подмена факта |

## 6. Provenance: допустимые `source_type`

Канонические значения:

- `SEED`;
- `WORDSTAT`;
- `SERP_QUERY`;
- `ALICE_INPUT`;
- `ALICE_FANOUT_OBSERVED`;
- `ALICE_FANOUT_INFERRED`;
- `ALICE_SOURCE`;
- `WEBMASTER_SEARCH`;
- `WEBMASTER_ALICE`;
- `CUSTOMER_EVIDENCE`;
- `MARKETPLACE_EVIDENCE`;
- `METRIKA_HUMAN`;
- `METRIKA_ROBOT`;
- `COMMERCE_EVENT`.

Правило: provenance описывает происхождение факта, а не его ценность. Один query в Ledger может ссылаться на observations разных `source_type`.

## 7. `evidence_mode`

Значения:

- `OBSERVED` — непосредственно получено из источника/measurement;
- `INFERRED` — аналитически предположено, но источник этого напрямую не показывал;
- `DERIVED` — вычислено/агрегировано из observed records.

Жёсткое правило:

> `ALICE_FANOUT_INFERRED` никогда не хранится как `OBSERVED` без нового прямого evidence.

## 8. Null / zero / availability semantics

Пустое поле не должно иметь неоднозначного смысла.

Для значимых измеряемых полей используется парное поле `<field>_status` со значениями:

- `MEASURED` — значение действительно измерено;
- `NOT_MEASURED` — измерение ещё не выполнялось;
- `NOT_AVAILABLE` — источник/инструмент не дал значение;
- `NOT_APPLICABLE` — поле неприменимо к этому типу observation;
- `INVALID` — измерение получено, но признано методологически/технически негодным.

Правила:

- числовой `0` + status `MEASURED` означает реальный ноль;
- `null` + `NOT_MEASURED` не равен нулю;
- `null` + `NOT_AVAILABLE` не равен нулю;
- CSV-пустота допускается только если рядом есть status, однозначно объясняющий отсутствие значения.

## 9. Wordstat normalized schema

Один API-вызов = один measurement.

Минимальные observation kinds:

### `wordstat_summary`

- общий request scope;
- `operation` (`getTop`, `getDynamics`, `getRegionsDistribution`, `getRegionsTree`);
- `root_query_id`, `root_query_text`;
- `region`, `device`;
- `total_count` + status, если метод его возвращает;
- период данных;
- `raw_ref`.

### `wordstat_phrase`

- `root_query_id`;
- `query_id` и `query_text` фактической result phrase;
- `count` + `count_status`;
- `relation_type`: `RESULT` или `ASSOCIATION`;
- `rank_in_response`, если применимо;
- `raw_ref`.

### `wordstat_timeseries`

- `query_id`;
- период/дата bucket;
- `count`;
- granularity;
- region/device;
- `raw_ref`.

Counts разных phrase observations не суммируются автоматически как уникальный спрос.

## 10. Yandex SERP normalized schema

Один запрос в конкретный момент/регион/device = один measurement.

Одна SERP-позиция = одна observation `serp_result`.

Минимальные поля:

- `root_query_id`, `root_query_text`;
- `position`;
- `domain`;
- `url`;
- `result_type`;
- `is_marketplace`;
- `is_independent_store`;
- `is_informational`;
- `has_product_block`;
- `has_price`;
- `has_reviews`;
- `has_faq`;
- `has_video`;
- `raw_ref`.

Обычный публичный web search не получает `source_type=SERP_QUERY` и не подменяет direct Yandex measurement.

## 11. Alice normalized schema

Один root query в конкретный момент = один measurement.

Используются отдельные observation kinds:

### `alice_answer`

- `root_query_id`, `root_query_text`;
- `answer_present`;
- snapshot/reference;
- `raw_ref`.

### `alice_source`

- `source_type=ALICE_SOURCE`;
- source domain/url;
- source page type, если классифицирован;
- `evidence_mode=OBSERVED`;
- `raw_ref`.

### `alice_fanout`

- fan-out `query_id`, `query_text`;
- `source_type=ALICE_FANOUT_OBSERVED` + `OBSERVED`, если fan-out непосредственно виден;
- либо `source_type=ALICE_FANOUT_INFERRED` + `INFERRED`, если это наша гипотеза;
- `raw_ref` или ссылка на derived-analysis для inferred.

Observed и inferred fan-out не хранятся в одном поле без provenance.

## 12. Customer evidence schema

Одна конкретная единица пользовательского свидетельства = одна observation `customer_evidence`.

Минимальные поля:

- platform/source;
- source URL или внутренний evidence reference;
- captured_at;
- product/entity reference, если есть;
- evidence category (`question`, `review`, `complaint`, `praise`, `usage`, `feature_request`, и т. п.);
- короткий допустимый excerpt либо нормализованная paraphrase;
- cluster/topic;
- `evidence_mode=OBSERVED`;
- `raw_ref`.

Нельзя превращать аналитическую интерпретацию отзыва в прямую цитату пользователя.

## 13. Marketplace evidence schema

Один listing/result/page snapshot = measurement; конкретные факты могут становиться observations `marketplace_listing` / `marketplace_feature`.

Минимальные поля:

- marketplace;
- seller/brand, если видимо;
- product/listing ID, если видимо;
- product title;
- price + status;
- rating/review count + status;
- URL;
- feature/fact category;
- observed value;
- captured_at;
- `raw_ref`.

Marketplace evidence подтверждает то, что реально видно в snapshot, но не доказывает продажи конкурента без отдельного источника.

## 14. Webmaster и post-launch schemas

### `WEBMASTER_SEARCH`

Минимум:

- query_id/query_text;
- date range;
- impressions;
- clicks;
- CTR;
- average position;
- landing URL;
- region/device, если доступно;
- raw/export reference.

### `WEBMASTER_ALICE`

Минимум:

- query_id/query_text;
- observation period;
- our-site presence;
- source page;
- Share of Voice, если доступно;
- competitor/source references;
- raw/export reference.

### `METRIKA_HUMAN` / `METRIKA_ROBOT`

Human и robot records не смешиваются. Human source/referral хранится отдельно от visitor type.

### `COMMERCE_EVENT`

Минимум:

- event type;
- session/order reference без секретных/лишних персональных данных;
- source channel;
- landing/page;
- value/revenue/margin, если применимо;
- attribution status.

Ozon/WB outbound click не маркируется как sale без доказанной атрибуции.

## 15. Связи между слоями

Обязательные связи:

`normalized.observation_id → normalized.measurement_id → raw_ref`

`ledger.query_id → latest/relevant measurement IDs + evidence observation IDs`

`derived report → ledger/query IDs + observation IDs, на которых основан вывод`

Решение о странице/Page Job должно быть трассируемо минимум до `query_id`, а для фактических аргументов — до observation/raw evidence.

## 16. Изменение Query Evidence Ledger

Ledger должен содержать минимум следующие технические поля связи:

- `schema_version`;
- `latest_wordstat_measurement_id`;
- `latest_serp_measurement_id`;
- `latest_alice_measurement_id`;
- `evidence_observation_ids`.

Они не заменяют агрегированные значения Ledger, а позволяют проверить их происхождение.

## 17. Legacy capture template

`marketing/data/yandex_serp_alice_capture_template.csv` считается legacy capture template.

Причина: одна строка одновременно содержит SERP result и Alice source fields, что становится неоднозначным при нескольких SERP results и нескольких Alice sources.

До шага 02.5 файл не удаляется. Для новых массовых measurement в пунктах 03–04 должны использоваться логически раздельные SERP и Alice normalized observations по контракту выше.

## 18. Контрольные запреты

Нельзя:

- создавать один observation ID для нескольких разных фактов;
- смешивать `OBSERVED` и `INFERRED`;
- использовать пустое значение как синоним нуля;
- удалять raw evidence при исправлении нормализации;
- менять historical measurement ID после публикации ссылки на него;
- помещать API keys/tokens/secrets в ID, raw_ref, source_ref или notes;
- использовать Ledger как единственное доказательство без возможности дойти до observation/raw.

Следующий шаг roadmap 02.4 определяет порядок обновления Ledger и quality gates на основе этого контракта.
