# Ozon Bridge v0.1.3 — документация

Дата сборки: 2026-08-11

## Назначение релиза

v0.1.3 — точечный UX/security-safe hotfix поверх v0.1.2.

Причина: верхние persistent status-плашки v0.1.2 можно было заменить новым состоянием программно, но пользователь **не мог закрыть текущую плашку вручную**.

## Что изменено

Каждая status-плашка ChatGPT теперь имеет явную кнопку `×` в правом верхнем углу.

Поведение:

- `×` закрывает только конкретную отображаемую плашку;
- для keyed persistent-state закрытие одновременно удаляет текущий DOM item из `statusToastByKey`;
- `clearToast(key)` после ручного закрытия не находит уже закрытый item;
- если позже реально появляется новое состояние (новый запрос, новая ошибка, новая доставка, новое ожидание команды), bridge создаёт новую актуальную плашку;
- закрытие плашки **не** останавливает autorun, не отменяет API request и не меняет run state — это только управление отображением;
- кнопка имеет `aria-label="Закрыть"` и `title="Закрыть"`.

Плашки по-прежнему закреплены сверху справа и не перекрывают composer.

## Сохранённые функции v0.1.2

v0.1.3 сохраняет весь функционал v0.1.2:

- controlled provider/bridge error → безопасный `OZON_RESULT_V1 result.error` в чат;
- autorun после доставленной контролируемой ошибки может принять следующую отдельную read-only команду;
- нет automatic retry того же запроса;
- исправлен прежний ложный `TOO_MANY_KEYS` на широком FBO response;
- импорт/экспорт пары `Client-Id + Api-Key` с SHA-256 и атомарной записью;
- `posting_fbs_get` остаётся заблокирован из-за customer PII;
- mutation/write operations не добавлены;
- один `OZON_API_V1` = не более одного внешнего Ozon API request.

## Allowlist v0.1.3

- `roles`
- `stocks_current`
- `analytics_data`
- `product_queries`
- `product_queries_details`
- `posting_fbo_list`
- `supply_order_get`
- `supply_order_details`

Намеренно заблокирован: `posting_fbs_get`.

## Live acceptance, уже полученная для v0.1.2-базы

Перед этим hotfix пользователь на реальном Ozon account подтвердил два ключевых исправления v0.1.2:

1. большой `posting_fbo_list` с `financial_data=true`, который раньше падал на `TOO_MANY_KEYS`, вернул HTTP 200 с широкими `financial_data.products`;
2. в autorun изолированный `session_view` вернул HTTP 400 / code 3 в чат, после чего тот же autorun принял **другую** `analytics_data` команду и успешно получил HTTP 200.

v0.1.3 меняет только status-card dismiss UX поверх этой базы. Сам крестик требует короткого user-side smoke test после установки.

## Автоматические тесты v0.1.3

Source suite:

- 228/228 PASS
- 0 FAIL

Coverage:

- lines: 99.28%
- branches: 92.83%
- functions: 94.66%

Новый regression проверяет:

- `×` реально присутствует в status item;
- доступен по `aria-label="Закрыть"`;
- click удаляет status item;
- keyed map очищается;
- повторный `clearToast` возвращает false после ручного dismiss.

Финальный production ZIP был распакован в свежую директорию и тем же suite протестирован уже по файлам из ZIP:

- 228/228 PASS
- 0 FAIL

Дополнительно:

- production source → extension tree → unpacked ZIP: 16/16 byte-exact;
- JS syntax: PASS;
- Chromium `--pack-extension`: exit 0;
- canonical Wordstat v1.1.5 regression: 283/283 PASS.

## Установка поверх v0.1.2

Чтобы сохранить текущий `chrome.storage.local`:

1. остановить autorun;
2. заменить production-файлы в **той же unpacked-папке** файлами v0.1.3;
3. в `chrome://extensions` нажать `Reload`;
4. полностью обновить вкладку ChatGPT;
5. открыть popup и проверить версию `v0.1.3`;
6. вызвать любую status-плашку и проверить, что справа сверху виден `×` и он её закрывает.

## Финальный артефакт

`ozon-bridge-v0.1.3-extension.zip`

- size: 79343 bytes
- SHA-256: `fe535cbe1f34d7a1e7684346ca7cad0a71c3ff6ac1018854cde03dd26fe6c5a9`
- production files: 16
- credentials/tests/evidence в production ZIP отсутствуют.
