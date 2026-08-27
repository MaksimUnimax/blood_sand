# Рекомендации оберегов — «Кровь и Песок»

Статус: рабочая продуктовая и техническая документация до разработки.

Эта директория описывает детерминированную систему подбора славянских оберегов по дате рождения и полу для VK Community Bot + VK Mini App.

## Область системы

- В подборе участвуют только товары семейства `slavic_symbols_oberegs`.
- Зодиакальные, скандинавские, универсальные, православные, патриотические и автомобильные товары не участвуют.
- Основа календарного шага — 16 Чертогов Сварожьего круга в зафиксированной для продукта календарной конвенции.
- Год рождения для расчёта Чертога не используется: достаточно дня и месяца.
- Пол используется как фильтр при выборе товара внутри Чертога.
- Клиенту показывается один товар по умолчанию и не более двух товаров в исключительном случае, когда есть два самостоятельных сильных основания.
- Продажи, популярность SKU и коммерческий приоритет не могут переопределять смысловую рекомендацию.
- Recommendation Core является единым источником результата для всех VK-интерфейсов.

## Документы

### Product/domain

- `RECOMMENDATION_SYSTEM_TZ.md` — продуктово-техническое ТЗ: входы, правила, ограничения, data model, алгоритм и acceptance criteria.
- `RECOMMENDATION_MATRIX.md` — утверждаемая матрица `Чертог × пол → рекомендация`, календарные границы и тип основания.
- `PRODUCT_CLASSIFICATION.md` — классификация всех 25 славянских SKU: гендерная политика, роль в V1 и ограничения.
- `M0_DOMAIN_FREEZE_AUDIT.md` — итоговый аудит всех direct/curated строк V1; фиксирует `DOMAIN_MATRIX_FREEZE_PASS` и список слабых fallback-связей для будущего пересмотра.
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — живой гайд клиентского ответа: порядок `Чертог → объяснение → оберег → ссылка`, стиль, гендерные ветки, маркетплейсы и актуальные формулировки.
- `OZON_PRODUCT_LINKS.md` — реестр публичных Ozon-ссылок для всех 76 текущих товаров; славянские позиции вынесены первым разделом и связаны с recommendation identity.
- `WILDBERRIES_PRODUCT_LINKS.md` — реестр публичных Wildberries-ссылок только для карточек категории `Обереги`; `Четки` и другие категории исключены.

### Architecture/implementation design

- `ARCHITECTURE.md` — целевая архитектура `Recommendation Core + VK Bot + VK Mini App`, security boundaries, availability и deployment units.
- `DATA_API_CONTRACT.md` — versioned data model, JSON-конфиги, Recommendation API, session/analytics contracts и validation gates.
- `VK_UX_FLOW.md` — клиентские сценарии бота и Mini App, parsing, validation, handoff и unavailable UX.
- `ROADMAP.md` — последовательность реализации от domain freeze и machine-readable core до VK-бота, Mini App и controlled launch.
- `SERVER_CAPACITY_AUDIT_2026-08-27.md` — pre-deployment аудит текущего shared-сервера: CPU/RAM/disk/Docker, capacity targets и gate перед server-side implementation.

## Целевая схема

```text
VK Community Bot ─┐
                  ├─→ Recommendation API/Core ─→ versioned recommendation data
VK Mini App ──────┘
```

Bot и Mini App не имеют собственной независимой матрицы.

## Текущий execution milestone

`M0 — Domain freeze` закрыт с gate:

```text
DOMAIN_MATRIX_FREEZE_PASS
```

Перед server-side implementation дополнительно выполняется capacity preparation для shared host. Текущий серверный аудит имеет статус:

```text
SERVER_CAPACITY_READY_WITH_WARNINGS
```

Цель перед server-side coding/deployment:

```text
SERVER_CAPACITY_PREP_PASS
```

После capacity preparation текущий следующий этап — `M1 — Machine-readable Recommendation Core`:

1. создать machine-readable versioned data-файлы;
2. реализовать schema/config validation;
3. реализовать `resolveChertog()`;
4. реализовать `resolveRecommendation()`;
5. покрыть все 32 `Чертог × пол` primary-case и граничные даты автотестами;
6. только после `RECOMMENDATION_CORE_CONTRACT_PASS` переходить к Recommendation API и VK-боту.
