# Yandex Wordstat Bridge — canonical audited reference

Дата фиксации: 2026-08-10
Статус: **canonical reference для проектирования Ozon/Wildberries LLM↔API bridges**

## Источник

Каноническим образцом является предоставленный владельцем архив:

`wordstat-bridge-v1.1.5-full-function-environment-audit(1).zip`

и его append-only документация:

`WORDSTAT_BRIDGE_DOCUMENTATION_APPEND_ONLY_FULL_FUNCTION_ENVIRONMENT_AUDIT(1).md`

Это supersedes любые более старые Wordstat ZIP/reference, которые могли встречаться в других репозиториях или предыдущих сессиях.

## Проверенная идентичность артефакта

- extension version: `1.1.5`
- ZIP SHA-256: `a39bbe65b046ef6eac5a7890b8afd84e69550db34debf271b7c373d08a1fef1a`
- documentation SHA-256: `437a69022b31621d7a749e3b92c0faf0c45f3d7be60e1a901cda65c3faf0a25a`
- файлов в ZIP: `41`
- fresh regression run именно по предоставленному ZIP: `283 passed / 0 failed`

Manifest подтверждает MV3 extension `Wordstat Bridge — ChatGPT ↔ Yandex`, version `1.1.5`, с service worker, content runtime, popup и shared modules.

## Что считаем reference semantics

Для marketplace bridges переносится не Yandex-specific API protocol, а proven lifecycle/control-plane:

- credentials local-only;
- command/result separation;
- hard allowlist внешних API hosts и операций;
- manual mode и autorun;
- conversation-scoped ownership;
- Manual ↔ Autorun mutual exclusion;
- exactly-once accepted command semantics;
- отсутствие скрытого automatic API retry;
- durable delivery ownership/recovery;
- worker restart recovery без повторения неизвестного paid/side-effecting request;
- один подтверждённый result delivery на одну accepted operation;
- popup state должен отражать worker truth;
- секреты не входят в command/result/diagnostics;
- native LLM UI не используется как arbitrary HTTP transport.

## Что НЕ переносится автоматически

- `WORDSTAT_API_V1` schema;
- Yandex endpoint map;
- `folderId`;
- Yandex pricing semantics;
- Wordstat four-method allowlist;
- Yandex-specific validation.

Для Ozon и Wildberries provider protocol, auth headers, pagination, quotas, history windows и endpoint allowlist определяются отдельно только после официального API-аудита.

## Repository note

Этот файл фиксирует hash-pinned reference и acceptance evidence. Шаг `03A.2` остаётся `IN PROGRESS`, пока executable source tree предоставленного 1.1.5 не импортирован/материализован в `tooling/llm-api-bridges/yandex-wordstat/` и не проверен повторно уже из repository representation.
