# Ozon Seller API research

Статус: **API research in progress. Ozon browser extension does not exist and development has not started.**

Эта директория хранит только исследовательские материалы для будущего read-only LLM↔Ozon bridge.

## Канонические research artifacts

- `OZON_API_CAPABILITY_AUDIT_2026-08-10.md` — основной capability audit и provenance уже подтверждённых official methods;
- `OZON_OFFICIAL_API_VERIFICATION_PASS_2026-08-10.md` — второй official-source verification pass, полный blocking data-surface checklist и правила promotion endpoint → future implementation spec;
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

## Жёсткое правило

Exact method/path/schema считается подтверждённым только по current official Ozon source. Сторонние SDK/Postman/generated clients могут использоваться для discovery, но не как source of truth.

Неподтверждённые endpoints не добавляются в будущий bridge. Scraping кабинета/сайта не является заменой API.

## Следующий этап

Сейчас выполняется roadmap `03A.3 — Полный официальный API-аудит Ozon`.

`03A.4 — Разработать Ozon LLM browser extension` остаётся **НЕ НАЧАТО** и начнётся только после достаточного закрытия blocking API research.