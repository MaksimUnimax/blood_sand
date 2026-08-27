# Marketplace Question Operator Bot — Ozon/Wildberries → Telegram → optional Codex → human-approved send

Статус: **active overview**.

Полный implementation authority для V1:

`MARKETPLACE_QUESTION_OPERATOR_A0_ARCHITECTURE.md`

## 1. Главный принцип

V1 больше не использует автоматический путь:

```text
marketplace -> Codex -> Telegram
```

Правильный путь:

```text
Ozon / Wildberries
        ↓
новый вопрос
        ↓
Telegram оператору
        ↓
[Ответить самому] [Отправить в Codex] [Игнорировать]
```

Codex получает вопрос **только после явного действия оператора**.

Публикация в marketplace возможна только после отдельного явного `Отправить` в Telegram.

## 2. Correlation

Каждому вопросу назначается внутренний публичный ID вида:

```text
Q-000184
```

Этот ID и исходный вопрос покупателя обязательны во всех Telegram-сообщениях, связанных с вопросом, ручным ответом, Codex-черновиком, ошибкой или повторной генерацией.

Backend, а не Codex, гарантирует связь ответа с вопросом.

## 3. Manual answer

`Ответить самому` переводит вопрос в режим ручного ввода. Оператор отвечает reply-сообщением на специальный Telegram input prompt, связанный с конкретным Q-ID.

После ввода текста бот показывает вопрос + ответ и только затем:

```text
[Отправить] [Редактировать] [Игнорировать]
```

## 4. Optional Codex

`Отправить в Codex` запускает локальный Codex CLI для этого конкретного вопроса.

Три существующие авторизации:

```text
codex1 -> /root/.codex
codex2 -> /root/.codex_second
codex3 -> /root/.codex_third
```

Активный Codex переключается из Telegram. Автоматического failover нет.

Если генерация упала по лимиту/auth/error, Telegram показывает исходный вопрос, Q-ID, профиль, ошибку и кнопки:

```text
[Повторить] [Сменить Codex] [Ответить самому] [Игнорировать]
```

Повтор создаёт новую draft attempt для **того же** Q-ID.

Успешный Codex-ответ всегда показывается вместе с исходным вопросом и Q-ID:

```text
[Отправить] [Редактировать] [Сгенерировать заново] [Игнорировать]
```

## 5. Prompt

В коде нет фильтра `date/general`, regex-router или предварительного классификатора.

Для каждого вопроса используется один составной prompt. Он может ссылаться на:

- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
- `RECOMMENDATION_MATRIX.md`;
- `PRODUCT_CLASSIFICATION.md`;
- `OZON_PRODUCT_LINKS.md`;
- `WILDBERRIES_PRODUCT_LINKS.md`;
- другие разрешённые локальные документы.

Prompt будет дорабатываться на реальных тестах. Сервис только собирает prompt + runtime context и получает текст ответа Codex.

## 6. Polling

Ozon и Wildberries проверяются приблизительно каждые 10 минут.

`UNIQUE(marketplace, external_question_id)` предотвращает повторные Telegram-карточки для одного marketplace-вопроса.

Сбой одного marketplace не блокирует второй.

## 7. Storage

V1 использует SQLite.

Основные данные вопроса сохраняются для дедупликации.

Подробные Codex attempt/history, job directories, JSONL/stdout/stderr и диагностические traces хранятся не более **5 суток**, затем автоматически очищаются.

## 8. Secrets

Секреты не попадают в GitHub или исходный код.

На integration gate Codex запускает интерактивный server-side secret installer и ждёт terminal input. Владелец непосредственно вводит Telegram token, WB token и текущие Ozon credential fields. Секреты сохраняются в защищённый server file и не печатаются обратно.

Точные поля Ozon/WB фиксируются после A1 current API verification.

## 9. V1 runtime simplicity

V1 — один standalone Python service под systemd, без Redis/PostgreSQL/Celery/Docker.

Codex является только optional `prompt -> answer text` engine и не получает права отправлять ответы в marketplace.

## 10. Development order

```text
A0 architecture freeze                  DONE
A1 Ozon/WB API contract verification
A2 state/DB/Telegram callback contract
A3 scaffold + SQLite/state machine
A4 read adapters
A5 Telegram-first moderation
A6 Codex profiles/retry/regenerate
A7 write adapters
A8 secrets + credential smoke
A9 systemd/recovery/retention
A10 real end-to-end test
```

До A7 никакая реализация не должна публиковать marketplace replies.
