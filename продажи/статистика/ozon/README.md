# Ozon — ежемесячная статистика поисковых запросов

Назначение этого раздела — **накапливать фактические поисковые фразы Ozon по товарам «Кровь и песок» без SEO-интерпретации на этапе сбора**.

## Зачем

Seller API даёт детализацию поисковых запросов только за ограниченное доступное окно без Premium. Поэтому вместо разового снимка ведём постоянный накопительный журнал: раз в месяц повторяем сбор по всему текущему Ozon-ассортименту и добавляем новый период. Через 12 месяцев получаем собственную годовую базу запросов по SKU.

Это evidence/data layer. Кластеризация, выводы о релевантности, семантическое ядро и изменения карточек выполняются отдельно и не смешиваются с сырым архивом.

## Канонический источник

Bridge: `ozon-llm-api-bridge`.

Операция: `product_queries_details` (`POST /v1/analytics/product-queries/details`).

Текущий проверенный предел Bridge/Ozon:
- `limit_by_sku` — максимум 15;
- `page_size` — максимум 100;
- до 1000 SKU в одном явном запросе;
- поддерживаются `BY_SEARCHES`, `BY_GMV`, а также Premium-зависимые `BY_VIEWS`, `BY_POSITION`, `BY_CONVERSION`;
- без Premium текущий кабинет пропускает `BY_SEARCHES` и `BY_GMV` в обоих направлениях;
- `BY_VIEWS`, `BY_POSITION`, `BY_CONVERSION` остановлены entitlement-gate до provider request и в месячный сбор без Premium не входят.

## Почему собираем несколько сортировок

`limit_by_sku=15` ограничивает число возвращаемых фраз на один SKU. Разные разрешённые сортировки дают разные 15-фразовые срезы. Поэтому для максимального покрытия без Premium ежемесячный цикл собирает четыре независимых набора:

1. `BY_SEARCHES / DESCENDING`;
2. `BY_SEARCHES / ASCENDING`;
3. `BY_GMV / DESCENDING`;
4. `BY_GMV / ASCENDING`.

После завершения всех четырёх срезов производная таблица может дедуплицироваться по `period + sku + query`, но raw evidence не удаляется.

## Важная поправка: глобальная пагинация при равных значениях нестабильна

Live batch `BY_SEARCHES / ASCENDING` от 2026-09-11 доказал, что отдельные запросы page 1, page 2 и далее могут повторять одинаковые `(sku, query)` строки на разных `query_index`, когда основной показатель сортировки одинаков. Для ASCENDING это особенно заметно из-за большого числа строк с `unique_search_users=0`.

Следовательно:
- `total=1110`, `page_count=12` и формальное покрытие `query_index=1..1110` **не доказывают 1110 уникальных строк**, если страницы вызываются отдельными provider requests;
- глобальный page sweep по всем 76 SKU больше не считается детерминированным completeness authority;
- подробный evidence-файл: `raw/2026-08-13_2026-09-10/BY_SEARCHES_ASC_PAGINATION_INSTABILITY_2026-09-11.md`;
- отклонённые page requests сохранены отдельно в `rejected_unstable_page_requests.tsv`.

## Исправленный способ сбора

Чтобы вообще убрать глобальную page boundary из задачи:

1. фиксируем 76 target SKU;
2. режем их на явные чанки максимум по 6 SKU;
3. при `limit_by_sku=15` один чанк даёт максимум `6 × 15 = 90` строк, то есть помещается в `page_size=100`;
4. для каждого чанка вызываем только `page=0`;
5. каждый чанк — отдельная явная `OZON_API_V1` команда и максимум один provider request;
6. одинаковый chunk plan повторяется для всех четырёх сортировок;
7. raw chunk responses сохраняются с точным `request_id`;
8. дедупликация между сортировками выполняется только в derived layer.

Так мы получаем полный разрешённый 15-per-SKU slice без зависимости от нестабильной межстраничной сортировки.

## Правило исполнения

- одна `OZON_API_V1` команда создаёт не более одного физического business request;
- несколько независимых команд можно отправлять одним sequential batch;
- скрытые retry, pagination-loop и fan-out запрещены;
- при ошибке request не повторяется автоматически;
- сохраняем точный `request_id`, период, sort/chunk и фактически возвращённые строки.

## Хранилище

`raw/<period>/collection_manifest.tsv` — ранний page-level authority до обнаружения проблемы нестабильной пагинации.

`raw/<period>/rejected_unstable_page_requests.tsv` — запросы, выполненные успешно технически, но отклонённые как completeness authority из-за нестабильных page boundaries.

`raw/<period>/BY_SEARCHES_ASC_PAGINATION_INSTABILITY_2026-09-11.md` — доказательство дефекта методики глобальной пагинации и corrected collection rule.

`raw/<period>/product_queries_details_*.tsv|txt` — ранее сохранённые page-level evidence-файлы; они не удаляются.

Новый authoritative monthly capture строится chunk-level, без межстраничной пагинации.

`monthly_search_queries.tsv` — ранний пилотный накопительный файл; он не является completeness authority первого месяца.

`NULL` означает, что provider/Bridge вернул `null`; это не заменяется нулём и не интерпретируется.

## Первый месячный цикл

Период: `2026-08-13` — `2026-09-10`.

Целевой ассортимент: 76 актуальных Ozon SKU из:
`marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`.

Текущий статус:
- ранний `BY_SEARCHES / DESCENDING` global page sweep — сохранён полностью как historical raw, но его прежний deterministic-complete статус **снят до chunked validation/recollection**;
- `BY_SEARCHES / ASCENDING` global page sweep — технически выполнен, но **REJECTED_UNSTABLE_PAGINATION** как completeness authority;
- corrected chunked no-pagination collection — **IN PROGRESS**;
- `BY_GMV` будет собираться тем же chunked способом;
- никакой SEO-аналитики до закрытия raw collection не выполняем.

## Ежемесячное правило

1. Зафиксировать актуальный список Ozon SKU.
2. Использовать доступное непремиальное месячное окно.
3. Разбить SKU на чанки максимум по 6 при `limit_by_sku=15`, `page_size=100`.
4. Для каждого из четырёх разрешённых срезов выполнить `page=0` для каждого чанка отдельной явной командой.
5. Сохранить каждый успешный chunk response с точным `request_id`, периодом, sort и составом SKU.
6. Не удалять старые периоды и не переписывать historical raw задним числом.
7. Новые месяцы только добавлять.
8. Аналитические производные хранить отдельно от raw/evidence журнала.
