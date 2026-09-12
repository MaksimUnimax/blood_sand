# C03 — Start: причинная цепочка перед исправлением интеграции

Дата: 2026-09-12. Продолжать выполнение после checkpoint.

## Источники
Ozon artifact 10289311013 скачан целиком. Внешний ZIP f712fbfcbf5ddf5aa2c39b18b750bedf3518cc7c6d438e4c7e26cbda9c2e85c0. Внутренний установочный ZIP: 259583 байта, 78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac; совпало с buildinfo. Локально ozon_latest/ содержит точные 32 runtime-файла.

WB: восстановленный C02 P1 WIP. Его Start в shared/runtime_worker.js сразу меняет inactive/error -> binding -> active_visible и не посылает начальный prompt. resolvePopupContext требует подтверждённого conversation ID, поэтому новый чат до первого сообщения не проходит. Bootstrap отдельно привязывает после одного лишь появления ID, не ждёт связанный завершённый ответ. Это три разных дефекта одной сквозной цепочки.

Ozon shared/work_session_model.js — тот же короткий state enum. Полная транзакция реализована НЕ в вымышленном отдельном model-файле, а в service_worker.js: 804–1028 (create/commit/readback/outcome/watch/clear), 5305–5397 (Start и pending identity handlers), 5510–5542 (rehydration через content-ready). Content: 1750–1823 — start watcher и sendWorkSessionPrompt; 2399–2411 — dispatch. Эти диапазоны прочитаны. Ozon сохраняет intent/revision до dispatch и send actor до click, потерянный основной ответ не разрешает второй Send, только подтверждённый send + новый законченный assistant turn открывают Work.

## Изменяемые зависимости WB
Popup Start/Finish и pending-state rendering; реальный worker dispatcher; durable pending record + монотонная ревизия для tab; origin/AI/conversation/runtime generation; сохранение Send intent и readback; content composer/Send guard; baseline user/assistant IDs; полный completed-response proof; bind/work transition; content startup rehydration; popup close/worker recreation; Finish/tab close cancellation; legacy bootstrap без преждевременного bind. Provider registry/hosts/172 serializer и токены не изменять.

## Проверка и перенос
Сначала RED на восстановленном P1 через настоящий worker dispatcher. Затем подключённый worker/content Start, а не отдельный неиспользуемый модуль. Сохранить uncertainty после committed click, запретить скрытый resend. Подтверждение user turn и нового assistant turn не брать из одного произвольного boolean: проверять origin/generation/current identity и DOM proof в content. Граница нового чата не даёт права отправлять/привязывать в произвольный существующий другой чат.

Незакрытые P2/P3/P4 recovery/P5–P9 остаются в объёме работы. Новых owner/live PASS нет. Реальных provider calls нет.
