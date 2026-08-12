# 03A — Режим marketplace-данных до возврата к Wordstat

Статус: **[~] АКТИВНЫЙ EXECUTION RULE ДЛЯ 03A**  
Исходная фиксация: 2026-08-11  
Owner override: **2026-08-12**  
Scope: **Ozon-primary → Ozon-centric master → re-baseline 03 → Wordstat. Wildberries выполняется параллельно и не блокирует этот путь.**

## Приоритет этого документа

Это текущий owner execution rule. В части, где старые формулировки `03A_MARKETPLACE_API_TOOLING_AND_ASSORTMENT.md`, `roadmap/README.md` или иных документов требуют обязательного завершения Wildberries до Ozon-centric master / re-baseline Wordstat, действует owner override от 2026-08-12 из этого файла.

Wildberries не удаляется из проекта и не объявляется ненужным. WB bridge остаётся отдельным параллельным track и позднее должен обогатить product master дополнительными listing/seller facts, но **его отсутствие больше не является gate для продолжения текущего исследования**.

## Решение владельца от 2026-08-12

Для текущего исследования товарный и seller baseline строится по Ozon, потому что Ozon является основной площадкой по фактическому объёму продаж данного магазина. Информация о товарах для текущего re-baseline берётся из Ozon evidence. Wildberries до готовности собственного расширения пропускается в critical path.

Это разрешает после технического закрытия текущего Ozon collection pass:

- построить Ozon-centric Product/SKU/Listing master;
- сгруппировать фактический Ozon ассортимент в ProductFamily;
- использовать Ozon ordered-units/revenue как seller evidence для определения порядка исследования семей;
- выполнить re-baseline roadmap 03;
- возобновить Wordstat по всему фактическому Ozon ассортименту.

Это **не разрешает** подменять отсутствующие факты догадками или считать Ozon evidence доказательством поведения Wildberries.

## Текущий порядок исполнения

1. Закрыть текущий Ozon read-only collection pass: для каждого требуемого слоя иметь либо capture, либо доказанный gap/ограничение.
2. Нормализовать доказанный Ozon ассортимент и identity из доступных captures.
3. Построить Ozon-centric Product/SKU/ProductFamily baseline.
4. Свести доступный Ozon seller analytics baseline без выдумывания отсутствующих метрик.
5. Зафиксировать product-family re-baseline для roadmap 03 и новый seed/root scope.
6. **Остановиться перед первым новым Wordstat API measurement и запросить запуск Wordstat extension у владельца.**
7. Wildberries bridge/ingestion продолжать параллельно отдельным track; после готовности добавить WB mapping в master как enrichment, а не как prerequisite для текущего Wordstat pass.

## Критерий закрытия текущего Ozon collection pass

Ozon pass считается достаточным для перехода к Ozon-centric master, когда для каждого обязательного слоя выполнено одно из двух:

1. данные реально сняты и сохранены с provenance; или
2. доказано и явно зафиксировано `UNAVAILABLE / NOT_EXPOSED / CONTRACT_GAP / ACCESS_RESTRICTED / RATE_LIMITED`.

Не требуется бесконечно повторять rate-limited или contract-failed запросы. Один и тот же HTTP 429/4xx запрос без нового contract evidence автоматически не повторяется.

## Фактический Ozon checkpoint на 2026-08-12

Canonical browser extension `ozon-llm-api-bridge` v0.1.3 прошёл real-account usage в текущем governed capture flow.

Доказано и сохранено:

- `roles` — real-account read capability evidence;
- `stocks_current` — полный product-level snapshot: **76 current stock items**, terminal continuation подтверждён;
- `analytics_data` — SKU-level `ordered_units + revenue` для нескольких периодов; 90-day offset=0 capture содержит **1519 ordered units / 2,584,012 RUB revenue**;
- `posting_fbo_list` — cursor pagination полностью закрыта для трёх смежных окон **2026-05-13..2026-08-10**;
- FBO captures содержат product joins, status/cancellation facts, warehouse/cluster и финансовые поля в пределах sanitized evidence;
- повторные analytics continuation для нескольких окон получили HTTP 429 и не повторяются автоматически;
- isolated `returns` analytics probe получил HTTP 400;
- `product_queries` contract probe получил HTTP 400;
- `session_view` isolated probe получил HTTP 400.

Явные текущие gaps/ограничения:

- catalog product list/info/attributes aliases отсутствуют в bridge v0.1.3;
- current price/promotions aliases отсутствуют;
- warehouse/cluster dictionaries и dedicated warehouse-stock aliases отсутствуют;
- finance/accrual aliases отсутствуют;
- dedicated returns/cancellations aliases отсутствуют;
- reviews/questions не входят в bridge allowlist;
- Performance API advertising contour не подключён;
- `posting_fbs_get` намеренно не используется из-за customer-PII risk;
- `product_queries_details` не вызывается без валидных identifiers/request contract;
- supply-order aliases не вызываются без доказанных IDs/request contract;
- часть analytics pagination/history остаётся rate-limited; это фиксируется как gap, а не заполняется предположением.

Эти gaps не отменяют существование соответствующих Ozon API families; они означают только, что текущий governed bridge/capture не доказал их usable contract/data в этой сессии.

## Правило хранения и доказательности

Канонический поток:

`measurement registry → raw Ozon evidence → normalized Ozon records → Ozon-centric product-family baseline`

Требования:

- raw append-only;
- normalized записи имеют provenance;
- `null`, `0`, `not measured`, `not exposed`, `access denied`, `rate limited` и `contract gap` не смешиваются;
- secrets и customer PII не сохраняются в LLM/GitHub evidence;
- marketplace facts не превращаются автоматически в окончательные site/business решения;
- product-family grouping допустим как исследовательская классификация фактического Ozon assortment и должен быть отделён от Ozon category taxonomy, если category API не был снят.

## Security rule

`/v1/roles` — capability evidence, а не security allowlist. Разрешены только read-only aliases текущего bridge. Mutation/write operations запрещены. Неизвестный side effect блокируется fail-closed.

## Следующее действие

Построить Ozon-centric normalized Product/SKU/ProductFamily baseline из доказанного полного 76-item stock snapshot и 90-day seller analytics, затем подготовить новый roadmap-03 Wordstat scope. Первый новый Wordstat request не запускать до явного сигнала владельца о запуске Wordstat extension.