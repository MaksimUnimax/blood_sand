# Рекомендации оберегов — «Кровь и Песок»

Статус: рабочая продуктовая и техническая документация до разработки.

Директория `recommendations/` теперь является общей базой знаний для двух **раздельных** контуров:

1. детерминированная система подбора славянских оберегов по дате рождения и полу для будущих VK Community Bot + VK Mini App;
2. операторский контур ответов на вопросы покупателей Ozon/Wildberries: marketplace API → Codex draft → Telegram approval → публикация только после ручного подтверждения.

## Область deterministic recommendation system

- В подборе участвуют только товары семейства `slavic_symbols_oberegs`.
- Зодиакальные, скандинавские, универсальные, православные, патриотические и автомобильные товары не участвуют.
- Основа календарного шага — 16 Чертогов Сварожьего круга в зафиксированной для продукта календарной конвенции.
- Год рождения для расчёта Чертога не используется: достаточно дня и месяца.
- Пол используется как фильтр при выборе товара внутри Чертога.
- Клиенту показывается один товар по умолчанию и не более двух товаров в исключительном случае, когда есть два самостоятельных сильных основания.
- Продажи, популярность SKU и коммерческий приоритет не могут переопределять смысловую рекомендацию.
- Recommendation Core является единым источником результата для всех будущих VK-интерфейсов.

## Документы

### Product/domain

- `RECOMMENDATION_SYSTEM_TZ.md` — продуктово-техническое ТЗ: входы, правила, ограничения, data model, алгоритм и acceptance criteria.
- `RECOMMENDATION_MATRIX.md` — утверждаемая матрица `Чертог × пол → рекомендация`, календарные границы и тип основания.
- `PRODUCT_CLASSIFICATION.md` — классификация всех 25 славянских SKU: гендерная политика, роль в V1 и ограничения.
- `M0_DOMAIN_FREEZE_AUDIT.md` — итоговый аудит всех direct/curated строк V1; фиксирует `DOMAIN_MATRIX_FREEZE_PASS` и список слабых fallback-связей для будущего пересмотра.
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — живой гайд клиентского ответа по подбору: порядок `Чертог → объяснение → оберег → ссылка`, стиль, гендерные ветки, маркетплейсы и актуальные формулировки.
- `MARKETPLACE_QUESTION_REPLY_GUIDE.md` — живой общий гайд черновиков ответов на любые вопросы покупателей Ozon/WB; для вопросов по дате ссылается на специализированный recommendation copy guide.
- `OZON_PRODUCT_LINKS.md` — реестр публичных Ozon-ссылок для всех 76 текущих товаров; славянские позиции вынесены первым разделом и связаны с recommendation identity.
- `WILDBERRIES_PRODUCT_LINKS.md` — реестр публичных Wildberries-ссылок только для карточек категории `Обереги`; `Четки` и другие категории исключены.

### Architecture/implementation design

- `ARCHITECTURE.md` — целевая архитектура `Recommendation Core + VK Bot + VK Mini App`, security boundaries, availability и deployment units.
- `DATA_API_CONTRACT.md` — versioned data model, JSON-конфиги, Recommendation API, session/analytics contracts и validation gates.
- `VK_UX_FLOW.md` — клиентские сценарии бота и Mini App, parsing, validation, handoff и unavailable UX.
- `ROADMAP.md` — последовательность реализации deterministic recommendation system от domain freeze до VK-бота, Mini App и controlled launch.
- `MARKETPLACE_QUESTION_OPERATOR_BOT.md` — отдельная архитектура `Ozon/WB questions → Codex draft → Telegram moderation → ручная отправка`.
- `SERVER_CAPACITY_AUDIT_2026-08-27.md` — исходный pre-deployment аудит shared-сервера.

## Контур 1 — deterministic VK recommendation system

```text
VK Community Bot ─┐
                  ├─→ Recommendation API/Core ─→ versioned recommendation data
VK Mini App ──────┘
```

Bot и Mini App не имеют собственной независимой матрицы.

Текущий domain gate:

```text
DOMAIN_MATRIX_FREEZE_PASS
```

Следующий implementation этап:

```text
M1 — Machine-readable Recommendation Core
```

## Контур 2 — Ozon/WB operator question workflow

```text
Ozon questions ───────┐
                      ├─→ poll/normalize → isolated Codex draft
Wildberries questions ┘                    ↓
                                      Telegram operator
                                      ↓      ↓      ↓
                                  Send    Edit    Skip
                                      ↓
                              marketplace API reply
```

Ключевое правило:

```text
AI_DRAFT != PUBLISHED_REPLY
```

Никакой ответ Codex не публикуется автоматически. Нужна явная команда оператора в Telegram.

## Server checkout policy

На сервер **не нужно клонировать весь `blood_sand`**.

Для доступа Codex к текущей базе знаний используется Git sparse checkout только:

```text
recommendations/
```

Runtime-код операторского Telegram/marketplace сервиса проектируется отдельно и не должен требовать checkout остальных частей монорепозитория.

## Текущий server status

После очистки Avito и восстановления OpenDesign сервер имеет достаточный запас для дальнейшей разработки. Сохраняемые рабочие сервисы: APM, OpenScript/AI Starter, OpenDesign, Business Bridge, Codex и серверная инфраструктура.

OpenDesign repair завершён с `OPENDESIGN_REPAIR_PASS`.

## Ближайшая последовательность

1. sparse checkout `recommendations/` на development server;
2. проверить локальную доступность всех reference docs для Codex;
3. продолжить M1 deterministic Recommendation Core;
4. параллельно/следующим треком спроектировать marketplace operator service;
5. перед Ozon/WB implementation отдельно подтвердить актуальные official questions/replies API contracts и credentials;
6. затем Telegram moderation bot и end-to-end human approval flow.
