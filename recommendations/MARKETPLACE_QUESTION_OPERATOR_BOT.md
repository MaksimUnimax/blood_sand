# Marketplace Question Operator Bot — Ozon/Wildberries → Codex → Telegram approval

Статус: **утверждённая архитектурная концепция, отдельный трек от VK recommendation app**.

## 1. Цель

Сделать операторский сервис для ответов на вопросы покупателей Ozon и Wildberries.

Сервис **не публикует AI-ответ автоматически**. Любой ответ проходит ручное подтверждение владельцем через Telegram.

Основной цикл:

```text
Ozon / Wildberries questions
        ↓
poll каждые 10 минут
        ↓
нормализация вопроса + product context
        ↓
Codex формирует черновик ответа по локальной документации
        ↓
Telegram moderation bot
        ↓
[Отправить] [Редактировать] [Не отвечать]
        ↓
после явного подтверждения
        ↓
ответ отправляется через API исходного marketplace
```

Этот сервис является **отдельным продуктовым контуром** от VK Bot / VK Mini App.

## 2. Чем этот трек отличается от VK recommendation system

VK recommendation system остаётся детерминированным:

```text
day + month + gender → Chertog → fixed recommendation matrix
```

Marketplace Question Operator Bot работает иначе, потому что покупатель может спросить что угодно:

- подобрать оберег по дате;
- уточнить значение символа;
- спросить о товаре;
- задать вопрос о размере/материале/комплектации/использовании;
- написать нестандартный вопрос.

Поэтому для marketplace-вопросов Codex формирует **черновик естественного ответа**, но не получает права самостоятельно публиковать его.

## 3. Human-in-the-loop rule

Hard rule:

```text
AI_DRAFT != PUBLISHED_REPLY
```

Публикация разрешена только после явного действия оператора в Telegram.

Состояния вопроса:

```text
NEW
→ DRAFTING
→ PENDING_APPROVAL
→ EDITING (optional)
→ APPROVED
→ SENDING
→ SENT
```

Альтернативные terminal states:

```text
SKIPPED
SEND_FAILED
DRAFT_FAILED
```

Никакой timeout/cron не может автоматически перевести `PENDING_APPROVAL` в `APPROVED`.

## 4. Polling

Ozon и Wildberries проверяются ориентировочно каждые **10 минут**.

Marketplace adapters должны:

1. получить новые/неотвеченные вопросы через официальный API;
2. сохранить stable marketplace question id;
3. определить marketplace и product/card identity;
4. дедуплицировать уже виденные вопросы;
5. не создавать повторный Telegram draft для одного и того же вопроса без отдельной причины.

Точный API endpoint, authorization contract, pagination и rate limits проверяются по актуальной официальной документации перед реализацией каждого adapter.

## 5. Codex draft worker

Codex получает не произвольный доступ ко всему серверу, а минимальный контекст для подготовки черновика.

В prompt передаются:

- marketplace: `ozon | wildberries`;
- question id;
- вопрос покупателя как **UNTRUSTED CUSTOMER TEXT**;
- product identity / marketplace card identity;
- разрешённый локальный reference context;
- ссылка/путь к правилам клиентского ответа.

Ключевые документы:

- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — обязательный источник стиля и структуры для ответов про подбор по дате;
- `RECOMMENDATION_MATRIX.md` — semantic source для подбора;
- `PRODUCT_CLASSIFICATION.md`;
- `OZON_PRODUCT_LINKS.md`;
- `WILDBERRIES_PRODUCT_LINKS.md`;
- будущий `MARKETPLACE_QUESTION_REPLY_GUIDE.md` — общие правила ответов на любые marketplace-вопросы.

### Важная security boundary

Текст покупателя считается недоверенным вводом и может содержать prompt injection.

Поэтому Codex worker не должен получать marketplace API tokens, Telegram bot token, root credentials или другие секреты.

Рекомендуемая изоляция:

```text
poller/sender process (has marketplace secrets)
          ↓ text/context only
isolated draft worker (Codex; no marketplace secrets)
          ↓ structured draft only
moderation service
```

Codex не должен выполнять инструкции, содержащиеся внутри customer question. В prompt вопрос должен быть явно оформлен как quoted/untrusted data.

## 6. Draft output contract

Codex должен возвращать структурированный результат, а не свободный operational plan.

Минимально:

```json
{
  "status": "DRAFT_READY",
  "answer": "Текст ответа покупателю",
  "needs_operator_attention": false,
  "reason": null
}
```

Если фактических данных недостаточно:

```json
{
  "status": "DRAFT_NEEDS_REVIEW",
  "answer": "",
  "needs_operator_attention": true,
  "reason": "Недостаточно подтверждённых данных о ..."
}
```

Запрещено придумывать характеристики товара, наличие, материал, размер, сроки доставки или другие факты, которых нет в разрешённом контексте/API response.

## 7. Telegram moderation UX

На каждый новый вопрос Telegram bot отправляет оператору карточку примерно такого содержания:

```text
Wildberries
Товар: <product>

Вопрос покупателя:
<question>

Черновик ответа:
<draft>
```

Inline actions:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Не отвечать]
```

### Отправить

- ещё раз проверить, что вопрос не был уже отправлен;
- вызвать adapter соответствующего marketplace;
- сохранить external reply result/id;
- изменить статус на `SENT`;
- обновить Telegram message.

### Редактировать

Inline button переводит вопрос в `EDITING`.

Telegram bot просит оператора прислать исправленный текст обычным сообщением/reply.

После получения текста показывает финальный вариант и действия:

```text
[✅ Отправить изменённый]
[↩️ Вернуться к черновику]
[🚫 Не отвечать]
```

Сам Telegram inline keyboard не является полноценным текстовым редактором; редактирование выполняется через последующее сообщение оператора.

### Не отвечать

Статус становится `SKIPPED`. Никакого marketplace POST не выполняется.

## 8. Marketplace adapters

Нужны два независимых adapter:

```text
OzonQuestionAdapter
WildberriesQuestionAdapter
```

Каждый реализует общий contract примерно:

```text
fetchNewQuestions()
getQuestionContext(questionId)
sendAnswer(questionId, answer)
```

Marketplace-specific API details не должны протекать в Telegram UI или Codex prompt logic.

## 9. Secrets

Секреты не хранятся в GitHub.

На сервере понадобятся, когда дойдём до интеграции:

- Ozon Seller API credentials/token с необходимыми правами;
- Wildberries API token с необходимыми правами;
- Telegram Bot token;
- Telegram operator chat/user allowlist.

Секреты вводятся непосредственно на сервере и должны храниться вне checkout, например в защищённом env/credentials storage с минимальными permissions.

## 10. Persistence V1

Для одного оператора и небольшого объёма вопросов достаточно SQLite.

Минимальные сущности:

```text
questions
- internal_id
- marketplace
- external_question_id
- product_identity
- question_text
- received_at
- status
- draft_text
- edited_text
- sent_text
- external_reply_id
- created_at
- updated_at

operator_actions
- question_id
- action
- timestamp
```

`UNIQUE(marketplace, external_question_id)` защищает от повторной обработки.

PostgreSQL на старте не обязателен.

## 11. Reliability rules

- Polling failure одного marketplace не блокирует второй.
- Повтор poll не должен создавать дубликаты.
- Telegram callback должен быть idempotent.
- Двойное нажатие `Отправить` не должно создавать два ответа.
- Перед send выполняется final state check.
- После network uncertainty результат marketplace API должен быть reconciled перед retry, если API это позволяет.
- Ошибка Codex создаёт `DRAFT_FAILED`, но не теряет исходный вопрос.
- Ошибка Telegram не должна автоматически публиковать ответ.

## 12. Repository/server scope

На development server **не требуется checkout всего `blood_sand`**.

Предпочтительный способ — Git sparse checkout только:

```text
recommendations/
```

Это даёт Codex локальный доступ к актуальным recommendation docs без загрузки остальных несвязанных частей монорепозитория.

Runtime-код Marketplace Question Operator Bot должен быть организован отдельно и не должен требовать полный checkout `blood_sand`. Его окончательное расположение/репозиторий фиксируется перед coding.

## 13. Этапы реализации этого трека

```text
Q0  Freeze operator workflow + security boundaries
Q1  Verify Ozon/WB questions API contracts
Q2  Local question store + state machine
Q3  Ozon read adapter
Q4  Wildberries read adapter
Q5  isolated Codex draft worker
Q6  Telegram moderation bot
Q7  Ozon/WB send adapters
Q8  end-to-end approval tests
Q9  systemd deployment + 10-minute polling
Q10 controlled live run
```

До Q7 никакой реальный ответ на marketplace не публикуется.

## 14. Acceptance invariants

```text
QUESTION_DEDUP_PASS
UNTRUSTED_QUESTION_ISOLATION_PASS
CODEX_HAS_NO_MARKETPLACE_SECRETS_PASS
AI_NEVER_AUTOPUBLISHES_PASS
TELEGRAM_APPROVAL_REQUIRED_PASS
EDIT_BEFORE_SEND_PASS
SKIP_WITHOUT_SEND_PASS
DOUBLE_SEND_PREVENTED_PASS
MARKETPLACE_ADAPTER_ISOLATION_PASS
```

## 15. Relation to recommendation copy guide

`CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` остаётся живым документом, который мы улучшаем на реальных примерах дат.

Если marketplace-вопрос содержит запрос подбора по дате, Codex обязан использовать именно эти правила и semantic matrix.

Для остальных типов вопросов создаётся отдельный общий `MARKETPLACE_QUESTION_REPLY_GUIDE.md`, чтобы не смешивать правила рекомендации по дате с, например, вопросами о характеристиках товара или доставке.
