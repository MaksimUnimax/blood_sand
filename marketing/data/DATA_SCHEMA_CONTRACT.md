# Data Schema Contract — IDs, provenance и канонические observations

Версия: 1.1  
Дата: 2026-08-04  
Статус: **канонический контракт схем исследовательских данных**

Этот документ дополняет `DATA_ARCHITECTURE.md` и фиксирует идентификаторы, provenance, временную точность, null/status semantics и минимальные канонические схемы normalized observations.

## 1. Базовые сущности

В системе различаются четыре сущности:

- **Query** — поисковая формулировка/тема, связываемая между источниками.
- **Measurement** — один конкретный съём: API-вызов, SERP capture, запрос к Alice, snapshot страницы/отзыва.
- **Observation** — одна нормализованная запись внутри measurement. Один measurement может породить много observations.
- **Ledger record** — текущее сводное состояние Query; не заменяет measurement/observation.

Пример: один `getTop("печать велеса")` = один `measurement_id`, а summary + 100 results + 6 associations = отдельные observations внутри этого measurement.

## 2. `query_id`

`query_id` стабилен для одной и той же поисковой формулировки независимо от источника.

Canonical form перед вычислением ID:

1. Unicode NFC;
2. trim;
3. последовательности whitespace → один пробел;
4. lower-case;
5. операторы Wordstat (`"`, `!`, `[]` и др.) сохраняются, если меняют смысл измерения.

Формат:

`q_<12 hex>`

где `<12 hex>` — первые 12 символов SHA-256 от UTF-8 canonical query string.

Исходный `query_text` всегда хранится рядом.

## 3. Время наблюдения и его точность

Нельзя придумывать время, которого нет в первичном evidence.

Обязательные поля:

- `observed_at` — фактически известное время/дата наблюдения;
- `observed_at_precision` — точность значения.

Допустимые значения `observed_at_precision`:

- `SECOND` — известны дата, час, минута, секунда;
- `MINUTE` — известны дата, час, минута;
- `DATE` — известна только календарная дата.

Для новых автоматизированных съёмов по возможности обязательно сохраняется UTC timestamp минимум до секунды. `DATE` используется только если источник/исторический raw не содержит более точного времени.

Пример исторического evidence `2026-08-04` нельзя искусственно превращать в `2026-08-04T00:00:00Z`.

## 4. `measurement_id`

`measurement_id` идентифицирует один факт съёма.

При `SECOND`/`MINUTE` используется временной ключ, отражающий реально известную точность. При `DATE` используется только дата.

Форматы:

- точное время: `m_<source>_<YYYYMMDDTHHMMSSZ>_<8hex>`;
- дата без времени: `m_<source>_<YYYYMMDD>_<8hex>`.

`8hex` — первые 8 символов SHA-256 от строки:

`source|observed_at|root_query_canonical|region|device|operation|raw_ref`

Примеры `source`:

- `wordstat`;
- `yandex_serp`;
- `alice`;
- `customer`;
- `marketplace`;
- `webmaster_search`;
- `webmaster_alice`;
- `metrika`;
- `commerce`.

Повторный съём всегда получает новый `measurement_id`. После публикации ссылок на measurement ID не меняется.

## 5. `observation_id`

Формат:

`o_<measurement_id_without_prefix>_<kind>_<NNNN>`

где `kind` — тип observation, а `NNNN` — стабильный порядковый номер внутри measurement.

Один observation ID не может описывать несколько разных фактов.

## 6. Общий envelope normalized observation

Каждая normalized observation обязана иметь минимум:

| Поле | Назначение |
|---|---|
| `schema_version` | версия схемы |
| `measurement_id` | ID съёма |
| `observation_id` | ID записи |
| `source_type` | provenance |
| `evidence_mode` | `OBSERVED`, `INFERRED`, `DERIVED` |
| `observation_kind` | конкретный тип записи |
| `root_query_id` | query, инициировавший measurement, если применимо |
| `root_query_text` | исходный root query |
| `query_id` | query конкретной observation, если применимо |
| `query_text` | текст конкретной query/formulation |
| `observed_at` | фактически известное время/дата |
| `observed_at_precision` | `SECOND`, `MINUTE`, `DATE` |
| `region` | регион или `null` с явным status |
| `device` | устройство/scope или `null` с явным status |
| `raw_ref` | repo-relative путь к raw evidence |
| `source_ref` | URL/внешний ID, если есть |
| `record_status` | `VALID`, `INVALID`, `SUPERSEDED` |
| `notes` | пояснение, не подмена факта |

## 7. Provenance: допустимые `source_type`

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

Provenance описывает происхождение факта, а не его ценность.

## 8. `evidence_mode`

- `OBSERVED` — непосредственно получено из источника;
- `INFERRED` — аналитически предположено;
- `DERIVED` — вычислено/агрегировано из observed records.

`ALICE_FANOUT_INFERRED` никогда не становится `OBSERVED` без нового прямого evidence.

## 9. Null / zero / availability semantics

Пустое поле не должно иметь неоднозначного смысла.

Для значимых измеряемых полей используется `<field>_status` либо channel-level status со значениями:

- `MEASURED`;
- `NOT_MEASURED`;
- `NOT_AVAILABLE`;
- `NOT_APPLICABLE`;
- `INVALID`.

Правила:

- `0` + `MEASURED` = реальный ноль;
- `null` + `NOT_MEASURED` ≠ ноль;
- `null` + `NOT_AVAILABLE` ≠ ноль;
- CSV-пустота допустима только при однозначном status.

## 10. Wordstat normalized schema

Один API-вызов = один measurement.

### `wordstat_summary`

Минимум:

- operation (`getTop`, `getDynamics`, `getRegionsDistribution`, `getRegionsTree`);
- `root_query_id`, `root_query_text`;
- region/device;
- period/scope;
- `total_count` + status, если метод возвращает;
- `raw_ref`.

### `wordstat_phrase`

Минимум:

- `root_query_id`;
- `query_id`, `query_text`;
- `count` + `count_status`;
- `relation_type`: `RESULT` или `ASSOCIATION`;
- `rank_in_response`, если применимо;
- `raw_ref`.

### `wordstat_timeseries`

Минимум:

- `query_id`;
- date/bucket;
- count + status;
- granularity;
- region/device;
- `raw_ref`.

Counts разных phrase observations не суммируются как уникальный спрос.

## 11. Yandex SERP normalized schema

Один запрос в конкретный момент/region/device = один measurement. Одна позиция выдачи = одна `serp_result` observation.

Минимум:

- root query;
- position;
- domain/url;
- result type;
- marketplace / independent store / informational flags;
- product block / price / reviews / FAQ / video flags;
- `raw_ref`.

Обычный публичный web search не получает `source_type=SERP_QUERY`.

## 12. Alice normalized schema

Один root query в конкретный момент = один measurement.

Используются раздельные observation kinds:

- `alice_answer`;
- `alice_source`;
- `alice_fanout`.

Для `alice_source` используется `source_type=ALICE_SOURCE`, `evidence_mode=OBSERVED`.

Fan-out хранится как:

- `ALICE_FANOUT_OBSERVED` + `OBSERVED`, если он непосредственно виден;
- `ALICE_FANOUT_INFERRED` + `INFERRED`, если это аналитическая гипотеза.

## 13. Customer evidence schema

Одна единица пользовательского свидетельства = одна `customer_evidence` observation.

Минимум:

- platform/source;
- source reference;
- captured/observed time + precision;
- product/entity reference, если есть;
- category (`question`, `review`, `complaint`, `praise`, `usage`, `feature_request` и т. п.);
- допустимый excerpt либо нормализованная paraphrase;
- cluster/topic;
- `evidence_mode=OBSERVED`;
- `raw_ref`.

Интерпретация не превращается в цитату пользователя.

## 14. Marketplace evidence schema

Один listing/result/page snapshot = measurement; конкретные факты становятся `marketplace_listing` / `marketplace_feature` observations.

Минимум:

- marketplace;
- seller/brand, если видно;
- product/listing ID;
- title;
- price + status;
- rating/review count + status;
- URL;
- feature/fact category;
- observed value;
- observed time + precision;
- `raw_ref`.

Marketplace evidence не доказывает продажи конкурента без отдельного источника.

## 15. Post-launch schemas

### `WEBMASTER_SEARCH`

query/date range/impressions/clicks/CTR/average position/landing URL/region-device/raw reference.

### `WEBMASTER_ALICE`

query/period/our-site presence/source page/Share of Voice при наличии/competitor references/raw reference.

### `METRIKA_HUMAN` / `METRIKA_ROBOT`

Human и robot records не смешиваются; источник/referral хранится отдельно от visitor type.

### `COMMERCE_EVENT`

Event type/session-or-order reference без лишних персональных данных/source channel/landing/value/revenue/margin/attribution status.

Ozon/WB outbound click не маркируется как sale без доказанной атрибуции.

## 16. Связи между слоями

Обязательные связи:

`normalized.observation_id → normalized.measurement_id → raw_ref`

`ledger.query_id → latest/relevant measurement IDs + evidence observation IDs`

`derived report → query IDs + observation IDs`

Решение о странице/Page Job должно быть трассируемо до фактического evidence.

## 17. Query Evidence Ledger

Ledger содержит минимум технические поля связи:

- `schema_version`;
- `latest_wordstat_measurement_id`;
- `latest_serp_measurement_id`;
- `latest_alice_measurement_id`;
- `evidence_observation_ids`.

Для каналов и числовых полей используются явные status-поля, чтобы пустота не означала одновременно 0 / not measured / unavailable.

## 18. Legacy files

`marketing/data/yandex_serp_alice_capture_template.csv` остаётся legacy capture template и не используется как каноническая объединённая модель для будущего массового сбора.

Исторический Wordstat raw `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json` сохраняется на исходном пути. Его дата имеет точность `DATE`; точное время не восстанавливается искусственно.

## 19. Контрольные запреты

Нельзя:

- создавать один observation ID для разных фактов;
- смешивать `OBSERVED` и `INFERRED`;
- считать empty равным zero;
- удалять raw evidence при исправлении нормализации;
- менять published measurement ID;
- придумывать отсутствующий timestamp;
- помещать API keys/tokens/secrets в ID/raw_ref/source_ref/notes;
- использовать Ledger как единственное доказательство без трассировки до observation/raw.

Версия 1.1 принята после acceptance test исторического Wordstat `getTop("печать велеса")`, который выявил необходимость явного `observed_at_precision` и поддержки date-only legacy measurements.