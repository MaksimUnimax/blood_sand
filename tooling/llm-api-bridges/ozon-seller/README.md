# Ozon Seller API research

Статус: **research/planning; Ozon browser extension NOT STARTED**.

## Текущий этап

Сейчас здесь хранится только исследование официальной read-only поверхности Ozon API, необходимой для будущего LLM↔Ozon bridge и для последующего импорта полного магазина/аналитики продавца.

Разработка расширения ещё не начата. В репозитории не должно быть Ozon extension candidate, acceptance evidence или утверждений о пройденных browser tests до отдельного этапа разработки из roadmap.

## Текущие артефакты

- `OZON_API_CAPABILITY_AUDIT_2026-08-10.md` — текущий официальный capability audit;
- `OZON_READ_ONLY_ALLOWLIST_V1.json` — исследовательский machine-readable список только тех read methods, которые уже подтверждены официальными материалами и являются кандидатами для будущего bridge.

## Будущая разработка

После завершения API audit отдельным roadmap-шагом будет разработан read-only bridge с локальным хранением `Client-Id`/`Api-Key`, командами `OZON_API_V1` и результатами `OZON_RESULT_V1`.

Архитектурным референсом служит действующий Yandex Wordstat bridge и общий design contract `../shared/LLM_API_BRIDGE_PROTOCOL.md`.

До начала этого шага `OZON_API_V1` считается только запланированным протоколом, а не существующим расширением.
