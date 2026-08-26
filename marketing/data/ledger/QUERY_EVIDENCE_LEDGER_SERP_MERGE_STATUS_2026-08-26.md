# Query Evidence Ledger — Search merge status — 2026-08-26

Статус: **SEARCH EVIDENCE PERSISTED; CANONICAL LEDGER MERGE VALIDATED, NOT YET REPLACED**

## Зачем этот файл

Зафиксировать точную точку продолжения синхронизации `marketing/data/ledger/query_evidence_ledger.csv` после primary Yandex Search capture. Этот файл нужен, чтобы при обрыве диалога не потерять ни результаты, ни обнаруженный дефект старого Ledger.

## Уже сохранённые Search-артефакты

- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md` — аналитический capture 10/10 primary queries;
- `marketing/data/normalized/yandex_search/20260826__search__primary10__225.tsv` — URL-level Top-10 dataset (100 results);
- `marketing/data/normalized/yandex_search/20260826__search__primary10__measurements.csv` — canonical measurement manifest;
- `marketing/data/normalized/yandex_search/20260826__search__primary10__summaries.csv` — derived composition summaries;
- `marketing/data/ledger/query_evidence_serp_patch_2026-08-26.csv` — Search→Ledger staging patch.

## Canonical measurement IDs

| query | measurement_id | provider request_id |
|---|---|---|
| славянские обереги | `m_yandex_serp_20260826_a794a881` | `search-09aa3f63-f501-4dd7-903d-62223aff930a` |
| печать велеса | `m_yandex_serp_20260826_49ab5424` | `search-12a4010f-75a2-4748-8a39-27561f73ffbc` |
| оберег в машину | `m_yandex_serp_20260826_6f75b1dc` | `search-7236a7d2-9cb5-462d-aa90-49668e4b6c69` |
| подвеска на зеркало в машину | `m_yandex_serp_20260826_4a7c4eb2` | `search-f667a06f-56ba-4ba3-8c7b-c353ee83fccc` |
| вегвизир | `m_yandex_serp_20260826_3fb74d56` | `search-ab2de857-7959-4968-a9f3-8b5d75cc51b2` |
| талисман знак зодиака | `m_yandex_serp_20260826_af98649b` | `search-a59d7e42-69d4-4e10-9fcf-ff7108e6d415` |
| алатырь оберег | `m_yandex_serp_20260826_cedfa61b` | `search-bd9baea9-119c-4ec2-93db-5302893f8996` |
| оберег велес | `m_yandex_serp_20260826_333632c7` | `search-de6f1c2c-d7c3-406a-84ad-a2a43a3bbe1d` |
| подарок мужчине в машину | `m_yandex_serp_20260826_bf569343` | `search-2e6f5d82-da75-4421-add8-8ffa0b880b20` |
| подарок автомобилисту | `m_yandex_serp_20260826_04b66634` | `search-70e6be3e-d119-41d3-9657-ec6f48d993be` |

`request_id` не используется как `measurement_id`; он хранится как provider/source reference.

## Найденный legacy-дефект Ledger

Существующая строка `подвеска на зеркало в машину` в `query_evidence_ledger.csv` имеет неполное/сдвинутое хвостовое заполнение CSV-полей. Стандартный `csv.DictReader` показывает недостающие trailing fields и сдвиг значений в области Alice/Webmaster/commerce/decision columns.

Это дефект существующего файла до Search merge, а не новых Search observations.

Для исправления строки подтверждён ожидаемый канонический state:

- `alice_status=NOT_MEASURED`;
- `alice_fanout_observed=NOT_MEASURED`;
- `webmaster_search_status=NOT_APPLICABLE`;
- `webmaster_alice_status=NOT_APPLICABLE`;
- `customer_evidence_status=NOT_MEASURED`;
- `marketplace_evidence_status=NOT_MEASURED`;
- `human_demand_H=PROVISIONAL_HIGH`;
- `alice_importance_A=NOT_ASSESSED`;
- `commercial_value_C=NOT_ASSESSED`;
- `owned_asset_value_O=NOT_ASSESSED`;
- `commerce_status=NOT_APPLICABLE`;
- `decision_status=PENDING_MORE_EVIDENCE`;
- исходные Wordstat reason/notes сохраняются;
- Search summary добавляется отдельно.

## Проверенный merge-result

В аналитическом merge-проходе получено:

- исходных Ledger rows: 13;
- после добавления отсутствующих primary Search queries: 19;
- `serp_status=MEASURED`: 10 rows;
- CSV structural validation: **PASS**;
- rows with extra columns: 0;
- rows with missing columns: 0;
- Wordstat evidence существующих строк не удаляется;
- Alice поля не повышаются до measured;
- `serp_product_block` остаётся `NOT_MEASURED`;
- `serp_device` остаётся пустым/неутверждённым, потому что provider measurement не был device-specific.

## Важная оговорка по новым Ledger rows

Часть новых Search queries также присутствует в финальном R1 Wordstat report. Однако старый canonical Ledger не содержит для них связанных Wordstat `measurement_id`/observation IDs. Поэтому нельзя придумывать linkage.

До отдельного backfill новые rows должны получать Search evidence честно, а Wordstat linkage либо добавляется из существующих raw/normalized R1 artifacts, либо остаётся явно незаполненным. `NOT_MEASURED` в таком transitional row не означает нулевой спрос.

## Точка продолжения

1. Не выполнять новый Search query.
2. Считать 10 primary Search measurements сохранёнными и нормализованными.
3. При следующем canonical Ledger rewrite сначала исправить legacy row `подвеска на зеркало в машину`, затем применить `query_evidence_serp_patch_2026-08-26.csv` и canonical measurement IDs.
4. Не заполнять Alice/browser-only fields из Search API.
5. Следующий исследовательский переход определяется roadmap 04: decision-useful browser/UI gaps → consumer Alice primary observations → evidence-driven secondary.
