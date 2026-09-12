# P4/P7 Work Start — причинное сопоставление перед исправлением

Дата: 2026-09-12. Статус: SOURCE_COMPARISON_IN_PROGRESS; runtime ещё не изменён.

Точные источники: восстановленный WB WIP из cursor v9 / P1_POPUP_WORK_CHECKPOINT; Ozon exact executable 1b3f0961ff9399430c9e5b3b70a4188f1282429d, ZIP SHA-256 78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac. Ozon source service_worker.js SHA-256 64187be955e9946401dd65b8f323f111574ee5f55263fc53c9b9209da56b14b7; content_script.js fa1c0046a22a61be1b646460baf7bd0a8ce75238e1c85f9b78d028c7b516a5b9. Это engineering reference; его buildinfo явно оставляет LIVE certification PENDING.

## Доказанные расхождения

1. WB runtime_worker.js 41–89: Start немедленно binding -> active_visible, нет отправки начального текста, pending transaction, Send commit, user/assistant proof. Ozon worker 825–1016 и 5305–5384: отдельный persisted intent, readback до dispatch, actor commit до click, durable outcome, baseline assistant IDs; видимость только после новой завершённой реплики.
2. WB resolvePopupContext 470–480 требует confirmed conversation до входа в Work action. Поэтому Start на пустом новом чате не может использовать поздний Ozon pending-identity протокол. Ozon Start читает live surface до наличия conversation ID и не связывает заранее.
3. WB bootstrapContext + wbBootstrap (runtime_worker 92–93, content 1153–1158) — отдельный путь: текст вставляется локально, а появление любого confirmed ID уже может вызвать bind. Это не эквивалент корреляции Start с конкретной отправкой/ответом и требует интеграции, а не новой конкурирующей кнопки.
4. WB clickComposerUntilEmpty (content 1109–1120) возвращает успех при исходно пустом composer, не возвращает click_event_observed и проверяет только опустошение поля. Нельзя выдать этот helper за доказательство отправки Start. Для Start нужен отдельный вызывающий путь с exact prompt/context, durable commit, одним click и доказанным исходом; неизвестный исход не повторять.
5. WB Work state normalize хранит start_intent_id, но не полную pending запись, actor/commit/outcome/baselines/generation. Нужна отдельная долговечная запись, как в Ozon; enum work_session_model.js сам по себе не переносит поведение.

## Прочитанные участки Ozon

Worker 790–1038; 5248–5398; 5497–5538. Content 1732–1827; 2198–2244; 2390–2430. Work Start watcher: intent+revision, origin/AI, новые assistant IDs, turn completion, timeout/cancel. Переинициализация получает watcher только для send_acknowledged, не отправляет prompt повторно.

Важное различие: прочитанный Ozon acknowledgePendingWorkStartSend использует click_event_observed && composer_empty как sent_acknowledged. Сохранённое WB задание дополнительно требует коррелированное подтверждение user-turn; WB уже имеет matchingNewUserTurn. Усиление этого доказательства должно быть отдельно покрыто тестом, не приписано Ozon как уже существующий user-turn gate.

## Зависимости для следующего блока

Pending intent: popup Start -> live tab/AI identity -> storage/local slot по tab -> dispatch -> content runtime actor/generation -> commit/readback -> единственный click -> новый user turn -> persisted outcome -> response watcher -> worker completion -> bind -> active_visible -> visibility acknowledgement -> terminal archive/cleanup.

Проверить все потребители: worker extra-message admission, publicSettingsState/new-chat global popup state, WB_CONTENT_READY / startup recovery, wbWorkRead interruption, manual eligibility, popup disable/render/refresh, content dispose and SPA identity poll, Finish/cancel/tab-close, concurrent Start and stale callbacks, storage failures.

Следующее чтение: точные popup/context helpers; WB CONTENT_READY/default message error path; content stable-send and completed-assistant helpers/dispose. Затем создать RED tests на исходном восстановленном WIP, сохранить каждую проверку и только после этого менять production.

Новые runtime edits: 0. Новые tests: 0. WB/Ozon provider calls: 0. P4/P7 не закрыт; P2/P3 remainder и P5–P9 остаются открыты. Baseline/capsules P1 неизменны.
