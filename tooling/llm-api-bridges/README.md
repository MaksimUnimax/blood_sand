# LLM API Bridges

Статус: архитектурный toolkit проекта `blood_sand`.

## Зачем

Нужен универсальный локальный мост между LLM и авторизованными API продавца/аналитики. Он должен позволять собирать полную доказательную базу по магазину без ручного экспорта десятков отчётов и без передачи API-ключей модели.

## Провайдеры

- `yandex-wordstat/` — действующий Wordstat bridge, эталон lifecycle/exactly-once/recovery.
- `ozon-seller/` — будущий Ozon Seller/analytics bridge.
- `wildberries/` — будущий Wildberries seller/analytics bridge.
- `shared/` — общие требования к protocol, LLM adapters, exactly-once delivery, security и evidence envelope.

## Архитектурный принцип

Разделяем две независимые части:

1. **LLM/browser adapter** — обнаруживает специальный исполняемый блок в конкретной LLM-поверхности и возвращает результат в тот же диалог.
2. **API provider adapter** — знает endpoint, authentication, scopes, pagination, rate limits и schema конкретной площадки.

Это позволяет не привязывать Ozon/WB/Yandex API-логику к DOM одной LLM. Для новой LLM добавляется capture/send adapter, а API provider остаётся тем же.

## Командные семейства

- `WORDSTAT_API_V1` → `WORDSTAT_RESULT_V1`
- `OZON_API_V1` → `OZON_RESULT_V1`
- `WB_API_V1` → `WB_RESULT_V1`

Общая семантика: одна команда = один логический API request/operation; retries и pagination должны быть явно управляемыми и отражаться в evidence, а не скрываться от LLM.

## Security

- credentials хранятся только локально в extension storage;
- credentials не включаются в command/result payload и diagnostics;
- по умолчанию новые marketplace bridges работают **read-only**;
- write/mutation endpoints не включаются в allowlist до отдельного проектного решения;
- запросы выполняются только к официально allowlisted hostnames;
- result сохраняет request id, endpoint/method, time, pagination и HTTP status, но не секреты.
