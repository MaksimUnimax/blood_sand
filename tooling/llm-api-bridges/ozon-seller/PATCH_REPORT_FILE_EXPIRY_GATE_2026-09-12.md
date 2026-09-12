# Report-file expiry: обязательные GATE-01–35

CI `34687477934`; executable `3f543bde2f8b4c0a561ecb50aeba111ff108751a`; PRE-HANDOFF PASS.

| Gate | Требование | Результат | Доказательство |
|---|---|---|---|
| GATE-01 | Direct patch authorization | PASS | Прямое разрешение владельца в текущем диалоге. |
| GATE-02 | Frozen defect set / evidence collection | PASS | Замороженный план, журнал инцидента и шесть независимых RED. |
| GATE-03 | Exact patch scope | PASS | Два production-файла; 30 остальных побайтово сохранены. |
| GATE-04 | No hidden mutation | PASS | Изменения только в repair-ветке; публикация fast-forward, без force/reset. |
| GATE-05 | Exact failing workflow reconstructed | PASS | Воспроизведены create/info/get, policy, accounting, output и ручная доставка текста. |
| GATE-06 | Do not stop at the first confirmed cause | PASS | Проверены шесть причин и все восемь файлов-потребителей. |
| GATE-07 | Exhaustive dependency-closure inventory | PASS | D01–D24 и построчная инвентаризация потребителей. |
| GATE-08 | Full dependency path proof and lifetime classification | PASS | Для каждого пути указаны сроки, состояние, потребители и доказательство. |
| GATE-09 | Architecture-invariant comparison | PASS | Единая логика абсолютного срока; прежние правила безопасности сохранены. |
| GATE-10 | Separate bridge defects from provider/account blockers | PASS | Готовый живой URL с 403 остаётся 403; expiry не подменяет все ошибки. |
| GATE-11 | Cross-command durability contract | PASS | Deadline записывается в session-state, не в память одного worker. |
| GATE-12 | Forced recreation between dependent commands | PASS | Пересоздание между зависимыми шагами и фактическая остановка MV3 в Chrome. |
| GATE-13 | Same-instance test is supplemental only | PASS | Отдельный same-instance контроль дополнен новыми runtime и реальным новым worker. |
| GATE-14 | Fresh-state replay | PASS | Тестовые новые коды/refs; исторические пользовательские URLs не запрашивались. |
| GATE-15 | Restart-sensitive negative control | PASS | Неизвестные, старые, повреждённые, просроченные и future-dated refs не выполняют GET. |
| GATE-16 | Test the browser boundary with available proof, then reserve true live-only behavior for live certification | PASS | Закреплённый Chrome, реальный session/IndexedDB/worker; live отдельно. |
| GATE-17 | Manifest/runtime endpoint parity | PASS | Manifest, hosts и порядок модулей не менялись; entry smoke PASS. |
| GATE-18 | Installed-artifact parity | PASS | Идентичный ZIP на Linux/Chrome/Windows и 32 канонических Git blobs. |
| GATE-19 | Rebuild invalidates previous package evidence | PASS | Все финальные проверки относятся к одному замороженному executable. |
| GATE-20 | Exact request preservation | PASS | Параметры и fingerprints сохраняются прежним кодом; regressions PASS. |
| GATE-21 | Logical/physical request accounting | PASS | В реальном worker проверены metadata1, valid GET1, expired/policy0. |
| GATE-22 | No hidden retry or duplicate provider request | PASS | Повторная команда после пересоздания не исполняется; retry/refetch не добавлены. |
| GATE-23 | Negative guard plus positive control | PASS | Положительные случаи и пять специально испорченных реализаций. |
| GATE-24 | Fail-honest entitlement | PASS | Проверки entitlement и provider taxonomy проходят; обходов нет. |
| GATE-25 | Personal-data policy OFF guard | PASS | Unknown-history rpf_p блокируется при policy OFF; ON — положительный контроль. |
| GATE-26 | Provenance-aware privacy path | PASS | Известные факты и неизвестная история разделены; имя отчёта не делает его safe. |
| GATE-27 | Semantic redaction | PASS | Прежние redaction-regressions и новые выходные данные без подписанных URLs. |
| GATE-28 | No URL/base64/credential leakage | PASS | Фиктивная подпись и credentials не попадают в отчёты; inline base64 удаляется. |
| GATE-29 | Trusted-host / SSRF guard | PASS | HTTPS/host/credentials/redirect негативные и позитивные проверки. |
| GATE-30 | Targeted regression for every defect in patch scope | PASS | Шесть RED, 30 основных и 33 смежных сценария GREEN. |
| GATE-31 | Previous repaired-defect and dependency guards | PASS | Все 31 прежних regression-скрипта + HELP39 на обеих платформах. |
| GATE-32 | Full exact workflow and dependency-closure gate | PASS | 24 пути закрыты доступными проверками; реальный capture/IDB проверен отдельно от UI live. |
| GATE-33 | No stale or fabricated dependencies | PASS | Старые URL refs не объявляются свежими при миграции; нет выдуманной безопасной provenance. |
| GATE-34 | Read-only safety | PASS | Реальных Ozon-запросов в patch-gate ноль; тестовые transport fixtures и network guard. |
| GATE-35 | Full green run after final candidate | PASS | Один полный финальный run Linux → Chrome → Windows → проверка хешей и отчётов. |

## Проверка после установки

LIVE-GATE-01: PENDING POST-INSTALL.
LIVE-GATE-02: PENDING POST-INSTALL.
LIVE-GATE-03: PENDING POST-INSTALL.
LIVE-GATE-04: PENDING POST-INSTALL.
LIVE-GATE-05: PENDING POST-INSTALL.
