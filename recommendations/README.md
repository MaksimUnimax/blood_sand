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
- `MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md` — implementation authority V1: runtime topology, Telegram-first gate, optional Codex, profile control, review/send gate, retention и security.
- `MARKETPLACE_QUESTION_OPERATOR_A1_API_CONTRACTS.md` — точные Ozon/WB question read/write contracts, auth fields, pagination, send/reconciliation and live-credential acceptance gate.
- `MARKETPLACE_QUESTION_OPERATOR_A2_STATE_TELEGRAM_CONTRACT.md` — SQLite schema, answer revisions, Q-ID correlation, corrected state transitions, callback/input contract and stale/double-send protection.
- `MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md` — **самый точный authority для Telegram меню и кнопок**: `Сменить Codex` в каждом меню, manual/Codex review, отсутствие successful-review regeneration и специальный CODEX_ERROR switch → confirmation → `Перегенерировать` flow.
- `SERVER_CAPACITY_AUDIT_2026-08-27.md` — исходный pre-deployment аудит shared-сервера.

Если старый MQO prompt/doc противоречит `MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md` по меню, кнопкам или смене Codex, **Telegram UX Contract имеет приоритет**.

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
                                      ▼          ▼
                                  input text   Codex run
                                      │          │
                                      │      ┌───┴────┐
                                      │      │        │
                                      │   success   error
                                      │      │        │
                                      ▼      ▼        ▼
                                    REVIEW REVIEW  CODEX_ERROR
                                      │      │        │
                                      └──┬───┘        ├─ Repeat
                                         │            └─ Switch Codex
                                         ▼
                              Send / Edit / Ignore
                                         │
                                  explicit Send
                                         ↓
                              marketplace API reply
```

Hard rules:

```text
TELEGRAM_FIRST_GATE
NO_HUMAN_SEND_ACTION -> NO_MARKETPLACE_REPLY
```

Codex является только optional `prompt -> answer text` engine. Новый вопрос не отправляется Codex автоматически.

Каждому вопросу присваивается внутренний ID вида `Q-000184`; исходный вопрос и этот ID показываются вместе с manual/Codex/edited ответом или ошибкой.

### NEW menu

```text
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

### Manual

```text
Ответить самому
 -> ввод текста для exact Q-ID
 -> immutable manual revision
 -> REVIEW
 -> [✅ Отправить] [✏️ Редактировать] [🚫 Игнорировать] [🤖 Сменить Codex]
```

Ручной текст не отправляется автоматически. Marketplace write возможен только после `✅ Отправить`.

### Codex success

```text
Отправить в Codex
 -> CODEX_RUNNING
 -> success
 -> REVIEW
 -> [✅ Отправить] [✏️ Редактировать] [🚫 Игнорировать] [🤖 Сменить Codex]
```

В успешном REVIEW **нет** `Сгенерировать`, `Сгенерировать заново` или `Перегенерировать`.

### Codex error

```text
CODEX_ERROR
 -> [🔄 Повторить]
 -> [✍️ Ответить самому]
 -> [🚫 Игнорировать]
 -> [🤖 Сменить Codex]
```

`Повторить` запускает новый attempt того же Q-ID профилем, активным при нажатии.

Если из CODEX_ERROR нажать `🤖 Сменить Codex`:

```text
выбор codex1/codex2/codex3
 -> сохранить active profile
 -> НЕ запускать Codex
 -> confirmation menu:
    [🔄 Перегенерировать]
    [✍️ Ответить самому]
    [🚫 Игнорировать]
    [🤖 Сменить Codex]
```

Только `🔄 Перегенерировать` после этого запускает новый attempt выбранным профилем.

## Codex profiles for operator service

Зафиксированы три существующие авторизации:

```text
codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third
```

Hard UX invariant:

```text
EVERY QUESTION MENU -> [🤖 Сменить Codex]
```

Кнопка должна быть доступна в NEW, MANUAL_INPUT, CODEX_RUNNING, CODEX_ERROR, REVIEW, EDITING, IGNORED, SENDING, SENT, SEND_FAILED и SEND_UNKNOWN.

В обычном состоянии выбор нового профиля меняет только `active_codex_profile` и возвращает в то же меню. Автоматического failover/генерации нет.

Пользовательский UX смены профиля **не зависит от `/codex`**.

## Send-state UI

```text
IGNORED:
[🤖 Сменить Codex]

SENDING:
[🤖 Сменить Codex]

SENT:
[🤖 Сменить Codex]

SEND_FAILED:
[🔄 Повторить отправку]
[🤖 Сменить Codex]

SEND_UNKNOWN:
[🤖 Сменить Codex]
```

`SEND_UNKNOWN` не retry-ится вслепую: сначала marketplace-specific reconciliation по A1.

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

Архитектурные A0/A1/A2 документы уже существуют; Telegram UX был отдельно скорректирован и заморожен 2026-08-28.

Текущий gate перед продолжением live Telegram acceptance:

```text
runtime implementation
 -> align with MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md
 -> offline exact-menu/state tests
 -> only then resume T4 live acceptance
```

Codex writes code only from the frozen implementation contracts. It is not responsible for inventing product architecture or button semantics.
