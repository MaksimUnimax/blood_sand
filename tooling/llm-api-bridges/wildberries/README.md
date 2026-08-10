# Wildberries API research

Статус: **research/planning; Wildberries browser extension NOT STARTED**.

## Текущий этап

Здесь хранится только официальный API audit и operation matrix, необходимые для будущего read-only LLM↔Wildberries bridge.

Разработка расширения ещё не начата. В репозитории не должно быть WB extension candidate, provider implementation или acceptance evidence до отдельного этапа разработки из roadmap.

## Текущие артефакты

- `WB_API_CAPABILITY_AUDIT_2026-08-10.md` — официальный capability audit;
- `WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` — актуальные corrections;
- `READ_ONLY_OPERATION_MATRIX_V1.md` — исследовательская матрица read operations для будущего bridge.

## Будущая разработка

После завершения исследовательского этапа отдельным roadmap-шагом будет разработан read-only bridge с локальным хранением WB token(s), командами `WB_API_V1` и результатами `WB_RESULT_V1`.

Архитектурным референсом служит действующий Yandex Wordstat bridge и общий design contract `../shared/LLM_API_BRIDGE_PROTOCOL.md`.

До начала этого шага `WB_API_V1` считается только запланированным протоколом, а не существующим расширением.
