# Рекомендации оберегов — «Кровь и Песок»

Статус: рабочая продуктовая и техническая документация.

Директория `recommendations/` является общей базой знаний для двух **раздельных** контуров:

1. детерминированная система подбора славянских оберегов по дате рождения и полу для будущих VK Community Bot + VK Mini App;
2. отдельный операторский сервис Ozon/Wildberries: marketplace question → Telegram operator first → manual answer или optional Codex → Telegram review → публикация только после ручного подтверждения.

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
- `MARKETPLACE_QUESTION_REPLY_GUIDE.md` — живой общий гайд черновиков ответов на вопросы покупателей Ozon/WB; prompt может ссылаться на него вместе с recommendation-документами.
- `OZON_PRODUCT_LINKS.md` — реестр публичных Ozon-ссылок для текущих товаров.
- `WILDBERRIES_PRODUCT_LINKS.md` — реестр публичных Wildberries-ссылок для карточек категории `Обереги`.

### Architecture/implementation design — recommendation/VK

- `ARCHITECTURE.md` — целевая архитектура `Recommendation Core + VK Bot + VK Mini App`, security boundaries, availability и deployment units.
- `DATA_API_CONTRACT.md` — versioned data model, JSON-конфиги, Recommendation API, session/analytics contracts и validation gates.
- `VK_UX_FLOW.md` — клиентские сценарии бота и Mini App, parsing, validation, handoff и unavailable UX.
- `ROADMAP.md` — последовательность реализации deterministic recommendation system от domain freeze до VK-бота, Mini App и controlled launch.

### Architecture/implementation design — Marketplace Question Operator

- `MARKETPLACE_QUESTION_OPERATOR_BOT.md` — краткий актуальный overview Telegram-first operator workflow.
- `MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md` — implementation authority V1: runtime topology, Telegram-first gate, optional Codex, three-profile control, retention, secrets and development gates.
- `MARKETPLACE_QUESTION_OPERATOR_A1_API_CONTRACTS.md` — точные Ozon/WB question read/write contracts, auth fields, pagination, send/reconciliation and live-credential acceptance gate.
- `MARKETPLACE_QUESTION_OPERATOR_A2_STATE_TELEGRAM_CONTRACT.md` — SQLite schema refinement, answer revisions, Q-ID correlation, state transitions, Telegram callback/input contract and stale/double-send protection.
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

M1 Recommendation Core пока не является текущим приоритетом.

## Контур 2 — Ozon/WB Marketplace Question Operator

Текущий V1 workflow:

```text
Ozon questions ───────┐
                      ├─→ poll/normalize → SQLite → Telegram operator FIRST
Wildberries questions ┘                         ↓
                                      ┌──────────┼─────────────┐
                                      │          │             │
                                  Manual       Codex         Ignore
                                      │          │
                                      │          ↓
                                      │      Codex draft
                                      │          │
                                      └──────┬───┘
                                             ↓
                                      Telegram review
                                      ↓      ↓      ↓
                                   Send    Edit   Ignore
                                      ↓
                              marketplace API reply
```

Hard rules:

```text
TELEGRAM_FIRST_GATE
NO_HUMAN_SEND_ACTION -> NO_MARKETPLACE_REPLY
```

Codex является только optional `prompt -> answer text` engine. Новый вопрос не отправляется Codex автоматически.

Каждому вопросу присваивается внутренний ID вида `Q-000184`; исходный вопрос и этот ID показываются вместе с любым manual/Codex ответом или ошибкой, чтобы Telegram-сообщения нельзя было перепутать.

## Codex profiles for operator service

Зафиксированы три существующие авторизации:

```text
codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third
```

Активный профиль выбирается в Telegram. При лимите/ошибке оператор может сменить профиль и отдельной кнопкой повторить генерацию того же Q-ID. Автоматического failover нет.

## Server checkout/runtime policy

Runtime Marketplace Question Operator — отдельный standalone project:

```text
/opt/marketplace-question-operator
```

Recommendation/reference documents нужны сервису локально, но полный checkout остального `blood_sand` для runtime не требуется.

История Codex attempts/job traces хранится не более 5 суток; минимальные question identity rows сохраняются для дедупликации.

## Текущий server status

После очистки Avito и восстановления OpenDesign сервер имеет достаточный запас для разработки. Сохраняемые рабочие сервисы: APM, OpenScript/AI Starter, OpenDesign, Business Bridge, Codex и серверная инфраструктура.

OpenDesign repair завершён с `OPENDESIGN_REPAIR_PASS`.

## Текущая последовательность Marketplace Question Operator

```text
A0 architecture freeze                         DONE
A1 Ozon/WB API contracts                       DONE (live credential acceptance later)
A2 state/DB/Telegram callback contract          DONE
A3 project scaffold + SQLite/state machine      NEXT
A4 marketplace read adapters
A5 Telegram-first moderation
A6 Codex runner/profile switching/retry
A7 marketplace write adapters
A8 interactive secrets + live credential smoke
A9 systemd/recovery/5-day retention
A10 controlled real end-to-end test
```

Codex writes code only from the frozen implementation contracts. It is not responsible for inventing product architecture.
