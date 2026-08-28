# Marketplace Question Operator Bot — Ozon/Wildberries → Telegram → optional Codex → human-approved send

Статус: **active overview — UX corrected 2026-08-28**.

Полный implementation authority V1:

- `MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md`
- `MARKETPLACE_QUESTION_OPERATOR_A1_API_CONTRACTS.md`
- `MARKETPLACE_QUESTION_OPERATOR_A2_STATE_TELEGRAM_CONTRACT.md`
- `MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md` — точный authority по меню/кнопкам/смене Codex.

## 1. Главный принцип

```text
MARKETPLACE QUESTION -> TELEGRAM OPERATOR FIRST
NO HUMAN SEND ACTION -> NO MARKETPLACE REPLY
```

Правильный NEW экран:

```text
Ozon / Wildberries
        ↓
новый вопрос
        ↓
Telegram оператору
        ↓
[✍️ Ответить самому]
[🤖 Отправить в Codex]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Codex получает вопрос только после `🤖 Отправить в Codex` или явного retry/regenerate действия в ветке ошибки.

## 2. Q-ID и correlation

Каждому вопросу назначается внутренний ID:

```text
Q-000184
```

Q-ID + исходный вопрос обязательны во всех важных сообщениях по этому вопросу.

Backend гарантирует связь:

```text
question
answer revision
Codex attempt
Telegram callback/input
marketplace send
```

## 3. Ручной ответ

```text
NEW
 -> ✍️ Ответить самому
 -> оператор вводит текст для точного Q-ID
 -> текст сохраняется как immutable manual revision
 -> REVIEW
```

После ввода ручного ответа бот **не отправляет его автоматически**.

REVIEW показывает вопрос + точный ответ и кнопки:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Только `✅ Отправить` может вызвать marketplace write API.

## 4. Optional Codex

Три авторизации:

```text
codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third
```

`🤖 Отправить в Codex` запускает attempt для того же Q-ID через профиль, активный в момент claim.

`CODEX_RUNNING` также показывает:

```text
[🤖 Сменить Codex]
```

Смена профиля не меняет уже запущенный attempt.

### Success

Успешный Codex-ответ -> REVIEW:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

В успешном REVIEW **нет**:

```text
Сгенерировать
Сгенерировать заново
Перегенерировать
```

Успешный ответ нельзя перегенерировать отдельной кнопкой V1.

### Error

CODEX_ERROR:

```text
[🔄 Повторить]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

`🔄 Повторить` сразу запускает новый attempt того же Q-ID через профиль, активный при нажатии.

## 5. Смена Codex — кнопка в каждом меню

Hard UX invariant:

```text
EVERY QUESTION MENU -> [🤖 Сменить Codex]
```

Кнопка должна присутствовать как минимум в:

```text
NEW
MANUAL_INPUT
CODEX_RUNNING
CODEX_ERROR
REVIEW
EDITING
IGNORED
SENDING
SENT
SEND_FAILED
SEND_UNKNOWN
```

Пользовательский UX **не зависит от `/codex`**.

Обычная смена:

```text
Сменить Codex
 -> [codex1] [codex2 ✓] [codex3]
 -> сохранить active_codex_profile
 -> вернуться в то же меню/состояние
```

Она ничего не генерирует и ничего не отправляет.

## 6. Особая смена Codex из CODEX_ERROR

Это отдельный обязательный flow:

```text
CODEX_ERROR
 -> 🤖 Сменить Codex
 -> выбрать codex1/codex2/codex3
 -> сохранить новый профиль
 -> показать подтверждение смены
```

Выбор профиля **не запускает Codex автоматически**.

Меню подтверждения:

```text
[🔄 Перегенерировать]
[✍️ Ответить самому]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Только `🔄 Перегенерировать` создаёт новый attempt того же Q-ID новым выбранным профилем и переводит в `CODEX_RUNNING`.

Это **единственное место V1**, где существует пользовательская кнопка `Перегенерировать`.

## 7. Редактирование

Из REVIEW:

```text
✏️ Редактировать
 -> ввести новый текст
 -> immutable edited revision
 -> REVIEW
```

После редактирования тот же набор:

```text
[✅ Отправить]
[✏️ Редактировать]
[🚫 Игнорировать]
[🤖 Сменить Codex]
```

Никакой regenerate-кнопки.

## 8. Send/failure/terminal menus

Все они сохраняют `🤖 Сменить Codex`.

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

Marketplace send всегда revision-bound. `SEND_UNKNOWN` не повторяется вслепую — используется A1 reconciliation.

## 9. Prompt

Нет `date/general` regex-router, LLM pre-router или программного классификатора выбора reference docs.

Для каждого вопроса используется единый composite prompt с разрешёнными local references, marketplace/product context, Q-ID и исходным вопросом.

Codex решает, какие разрешённые инструкции относятся к вопросу.

## 10. Polling / storage / runtime

Ozon и Wildberries проверяются приблизительно каждые 10 минут.

`UNIQUE(marketplace, external_question_id)` предотвращает дубли логических вопросов.

V1 использует SQLite и один standalone Python service под systemd.

Detailed Codex attempts/job traces хранятся не более пяти суток, когда уже не нужны текущему состоянию. Минимальная question identity/state сохраняется для дедупликации.

Codex не получает marketplace/Telegram secrets и не имеет функции публикации.

## 11. Текущий implementation gate

Перед продолжением live T4 Telegram acceptance runtime-код должен быть приведён к:

`MARKETPLACE_QUESTION_OPERATOR_TELEGRAM_UX_CONTRACT.md`

Особенно:

```text
Сменить Codex в каждом меню
Manual -> REVIEW -> explicit Send
Success Codex -> REVIEW без regenerate
CODEX_ERROR -> Repeat OR Switch
CODEX_ERROR Switch -> выбор профиля -> confirmation -> Перегенерировать
никакой /codex зависимости
```
