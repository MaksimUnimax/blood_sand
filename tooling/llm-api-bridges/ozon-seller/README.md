# Ozon Seller API research

Статус: **API research in progress. Ozon browser extension does not exist and development has not started.**

Эта директория хранит только исследовательские материалы для будущего read-only LLM↔Ozon bridge.

## Канонические research artifacts

- `OZON_API_CAPABILITY_AUDIT_2026-08-10.md` — основной capability audit и provenance уже подтверждённых official methods;
- `OZON_OFFICIAL_API_VERIFICATION_PASS_2026-08-10.md` — второй official-source verification pass, полный blocking data-surface checklist и правила promotion endpoint → future implementation spec;
- `OZON_OFFICIAL_REVALIDATION_2026-08-11.md` — свежая current-source перепроверка: public-API-only rule, current stock/supply evidence, OAuth constraint, active seller-promotions capability и актуальность cancellation gap; exact catalog/prices/returns/warehouse/report/ads schemas по-прежнему не считаются подтверждёнными без official library evidence;
- `OZON_NEGATIVE_VERIFICATION_2026-08-11.md` — отдельная фиксация отрицательной проверки current official evidence: правдоподобные catalog/product/price endpoint candidates намеренно остаются `UNCONFIRMED`, historical official paths не считаются current без fresh verification;
- `OZON_DATA_SURFACE_MATRIX_V1.md` — матрица достаточности API evidence для полного импорта ассортимента и причинной seller diagnostics;
- `OZON_ENDPOINT_DISCOVERY_QUEUE_2026-08-10.md` — очередь blocking endpoint families для exact official verification; наличие метода в queue не означает подтверждение;
- `OZON_READ_ONLY_ALLOWLIST_V1.json` — **research-only** machine-readable список методов, уже подтверждённых официальными Ozon materials. Это не код расширения и не production allowlist.

## Текущий research scope

До разработки расширения нужно получить достаточный current official read surface для:

- полного seller catalog/listing master;
- product attributes/media/status;
- prices/discounts/promotions;
- stocks/FBO/FBS/warehouses/clusters/geography;
- seller/product/search-query analytics;
- FBO/FBS postings;
- cancellations/returns;
- supply/replenishment;
- finance/realization/reports;
- advertising statistics;
- reviews/questions там, где официальный API даёт read access;
- pagination, history windows, quotas/rate limits, auth/account/subscription restrictions.

## Текущее уточнение после revalidation 2026-08-11

- seller promotions/actions API capability подтверждён как действующий в 2026, но exact read-only endpoints/schema всё ещё pending;
- partial FBS cancellation detection подтверждён как актуальная current integration need, но exact read endpoint не получен;
- `/v4/product/info/stocks`, `/v3/supply-order/get`, `/v1/supply-order/details`, product-query analytics и уже принятые posting/finance families сохраняют official provenance;
- exact searches по official Ozon domain не дали current confirmation для `/v3/product/list`, `/v3/product/info/list`, `/v4/product/info/attributes`, `/v5/product/info/prices`; отсутствие результата не доказывает отсутствие метода, но запрещает promotion в allowlist;
- candidate catalog/price/return/warehouse endpoints из сторонних discovery sources не переводятся в `CONFIRMED` и не входят в allowlist;
- historical official methods также не считаются current автоматически: пример `/v3/product/info/stocks` уже вытеснен current official `/v4/product/info/stocks`;
- official interactive Seller API library в текущей research environment остаётся недоступна как стабильный browsable snapshot, поэтому blocking schemas не закрываются догадками.

## Жёсткое правило

Exact method/path/schema считается подтверждённым только по current official Ozon source. Сторонние SDK/Postman/generated clients могут использоваться для discovery, но не как source of truth.

Неподтверждённые endpoints не добавляются в будущий bridge. Scraping кабинета/сайта не является заменой API.

## Следующий этап

Сейчас выполняется roadmap `03A.3 — Полный официальный API-аудит Ozon`.

`03A.4 — Разработать Ozon LLM browser extension` остаётся **НЕ НАЧАТО** и начнётся только после достаточного закрытия blocking API research.
