# Common bridge protocol requirements

## Обязательные свойства

1. LLM-agnostic command/result framing.
2. Exactly-once grant на платный/значимый API request.
3. Stable request id и delivery id.
4. Commit-before-send и recovery без повторного API-вызова.
5. Durable operation ownership при reload/tab/service-worker restart.
6. Explicit pagination: каждая полученная страница связана с root operation и сохраняет provenance.
7. Credentials never leave local extension storage.
8. Read-only allowlist by default for marketplace APIs.
9. Raw result envelope отделён от derived analytics LLM.
10. Любой partial/empty/permission/rate-limit response должен быть явным status, а не интерпретироваться как zero.

## LLM adapters

API provider не должен знать, работает пользователь через ChatGPT, Alice, DeepSeek или другую LLM. Capture/send реализуется отдельными adapters. Текущий Yandex bridge используется как proven reference для ChatGPT lifecycle, но общий toolkit должен позволять добавлять другие adapters без копирования marketplace API-кода.
