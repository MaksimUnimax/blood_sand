# Рекомендации оберегов — «Кровь и Песок»

Статус: рабочая продуктовая и техническая документация.

Директория `recommendations/` является общей базой знаний для двух раздельных контуров:

1. deterministic recommendation system по дате рождения, полу и marketplace, включая consumer VK Bot / VK Mini App;
2. Marketplace Question Operator: Ozon/Wildberries → Telegram operator → manual/optional Codex → review → explicit marketplace send.

## Current recommendation authority

Для любых текущих решений по подбору использовать в таком порядке:

1. `RECOMMENDATION_MATRIX.md` — current effective matrix;
2. `PRODUCT_CLASSIFICATION.md` — current product/gender policy;
3. `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md` — фактические sales signals и owner-approved обоснования замен;
4. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — обязательный customer-facing copy;
5. `OZON_PRODUCT_LINKS.md` / `WILDBERRIES_PRODUCT_LINKS.md` — destination registry;
6. `DATA_API_CONTRACT.md` и `ARCHITECTURE.md` — current implementation contract.

`RECOMMENDATION_SYSTEM_TZ.md` и `M0_DOMAIN_FREEZE_AUDIT.md` являются **superseded V1 historical records** и не должны переопределять V2.

## VK implementation documents

Current VK documents:

- `VK_PLATFORM_ARCHITECTURE.md` — обязательная pre-implementation архитектура VK Bot + Mini App, построенная по официальным VK contracts;
- `VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md` — реестр подтверждённых официальных VK contracts, разрешённых implementation surfaces и `UNRESOLVED` gaps;
- `VK_UX_FLOW.md` — consumer Bot / Mini App UX authority;
- `ROADMAP.md` — V2 implementation sequence;
- `DATA_API_CONTRACT.md` — shared Recommendation API transport contract;
- `prompts/M1_1_CODEX_PROMPT.md` — historical/current M1.1 implementation prompt only; не является VK platform authority.

Hard boundary:

```text
VK Bot / Mini App do not own a separate recommendation matrix.
They consume the same V2 Recommendation Core/API.
```

Platform anti-guessing gate:

```text
нет подтверждённого VK platform contract
→ не придумывать поля / event shape / error semantics / timeout / deep link
→ пометить UNRESOLVED
→ проверить официальную документацию VK или staging contract fixture
→ только потом писать production functionality
```

Для любого M2/M3/M5/M6 implementation prompt обязательное чтение:

```text
VK_PLATFORM_ARCHITECTURE.md
VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
```

Для M3/M5/M6 дополнительно обязательны соответствующие PRE-M3 / PRE-M5 / PRE-M6 gates из этих документов. `UNRESOLVED` item нельзя молча превращать в guessed implementation.

Old VK/V1 examples or prompts that contain:

- `Медведь + мужчина → Сварог + Медвежья лапа`;
- 33 active recommendation rows;
- any secondary/rank-2 recommendation;
- V1 authority above current matrix

are superseded and must not be used for implementation.

## Current V2 recommendation rules

- Только семейство `slavic_symbols_oberegs`.
- 16 Чертогов по `KIP_CHERTOG_CALENDAR_V1`.
- Day/month определяют Чертог; год не влияет на selection.
- Если покупатель указал год, customer-facing ответ обязан сохранить полную дату `DD.MM.YYYY`.
- Пол является частью matrix selection; его нельзя угадывать по имени/аватару.
- Каждый `Чертог × пол × marketplace` возвращает ровно один товар.
- Secondary recommendation отсутствует.
- Реальные продажи имеют высокий вес **при owner-approved offline rebuild матрицы**, но не являются live runtime input.
- Bestseller не используется, если есть явный semantic/visual conflict.
- Marketplace-specific результат разрешён только explicit versioned override.

Текущие special cases:

```text
Медведь male/female → Печать Велеса
Волк male/female    → Велес
Лиса male           → Чернобог
Лиса female         → Мара
Орёл male           → Перун
Орёл female         → Звезда Лады
Раса male/female    → Даждьбог
```

Для `Печать Велеса` customer-facing имя всегда **ровно** `Печать Велеса`; internal aliases не рендерятся.

Текущий marketplace override:

```text
Ворон + male:
Ozon        → Колядник
Wildberries → Алатырь
```

## Sales evidence

Current sales-weighted audit использует два независимых сигнала:

- Wildberries: `Выкупили, шт.`, период `2026-01-01 — 2026-08-28`;
- Ozon: `ordered_units`, период `2026-06-01 — 2026-08-28`.

Периоды и метрики различаются; значения не складываются в один формальный total. Они используются как независимые ranking signals при owner review.

## Customer copy

Для date-based recommendations обязательный порядок:

```text
полная указанная дата → Чертог → темы Чертога → оберег → почему подходит → marketplace link
```

Hard rule:

```text
Input: 19.11.1988
Correct: Дата 19.11.1988 относится к Чертогу Лебедя.
Forbidden: Дата 19.11 относится к Чертогу Лебедя.
```

Продажи, ranking, отсутствие товара/карточки/остатка, fallback terminology и внутренние relation types клиенту не сообщаются.

## Marketplace Question Operator

Current overview: `MARKETPLACE_QUESTION_OPERATOR_BOT.md`.

Implementation authorities:

- `MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md`;
- `MARKETPLACE_QUESTION_OPERATOR_A1_API_CONTRACTS.md`;
- `MARKETPLACE_QUESTION_OPERATOR_A2_STATE_TELEGRAM_CONTRACT.md`;
- `MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md`;
- `MARKETPLACE_QUESTION_REPLY_GUIDE.md`.

Главный workflow:

```text
marketplace question
→ Telegram operator FIRST
→ manual answer / optional Codex / ignore
→ REVIEW
→ explicit Send only
→ marketplace reply
```

Hard rules:

```text
TELEGRAM_FIRST_GATE
NO_HUMAN_SEND_ACTION -> NO_MARKETPLACE_REPLY
```

Codex готовит только draft text. Он не публикует ответ сам.

Для вопросов по подбору по дате `MARKETPLACE_QUESTION_REPLY_GUIDE.md` обязан использовать current V2 recommendation authorities выше; V1 historical docs не должны попадать в semantic decision.

## Runtime/service notes

Marketplace Question Operator — отдельный standalone runtime project:

```text
/opt/marketplace-question-operator
```

Reference documents могут синхронизироваться в runtime, но продуктовый source of truth остаётся в этой директории.

VK recommendation system должен развиваться отдельно от MQO runtime: общая у них business recommendation authority, но transport/state/deployment контуры разные.

Decision marker текущей recommendation policy:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
