# Wordstat Bridge append-only documentation — continuation 1.1.6 / Search overlay

Дата append-entry: 2026-08-12  
Политика: **APPEND-ONLY — не переписывать исторические записи**

## Chain authority

Предыдущий канонический companion document:

`WORDSTAT_BRIDGE_DOCUMENTATION_APPEND_ONLY_FULL_FUNCTION_ENVIRONMENT_AUDIT(1).md`

Проверенная идентичность предыдущего документа:

- bytes: `171659`;
- SHA-256: `437a69022b31621d7a749e3b92c0faf0c45f3d7be60e1a901cda65c3faf0a25a`.

Для 1.1.6 был сформирован полный companion document путём byte-for-byte сохранения всего предыдущего документа и добавления новой записи только в конец:

`WORDSTAT_BRIDGE_DOCUMENTATION_APPEND_ONLY_FULL_FUNCTION_ENVIRONMENT_AUDIT_R2_SEARCH_OVERLAY_1.1.6.md`

Проверенная идентичность полного 1.1.6 companion document:

- bytes: `180644`;
- preserved old prefix: `true`;
- SHA-256: `62548d39f0cb363e21a8ca703d24c8bdcd5de3c2ce41edbcf345f373c9919416`.

Этот repository-файл является читаемой GitHub continuation-записью append-only chain и не заменяет полный companion artifact.

---

## Entry — 2026-08-12 — Search API overlay 1.1.6

### Purpose

Расширить уже accepted Wordstat Bridge 1.1.5 узким read-only overlay для официального Yandex Search API, не создавая второй credential/control-plane stack и не меняя исходную Wordstat protocol semantics.

### New allowlisted protocol

Command prefix:

`YANDEX_SEARCH_API_V1`

Result prefix:

`YANDEX_SEARCH_RESULT_V1`

Разрешены только:

- `webSearch` -> `POST /v2/web/search`;
- `genSearch` -> `POST /v2/gen/search`.

Запрещён arbitrary URL/method/body passthrough.

### Preserved lifecycle guarantees

Из canonical Wordstat 1.1.5 сохраняются:

- local-only credentials;
- one accepted command = one provider request;
- single-flight / durable ownership;
- no hidden automatic API retry;
- reload/service-worker recovery без replay неизвестного paid request;
- bounded result handling;
- secrets не попадают в command/result/diagnostics;
- original `WORDSTAT_API_V1` methods остаются семантически неизменными.

### Official provider channels

WebSearch:

`POST https://searchapi.api.cloud.yandex.net/v2/web/search`

Используется как direct Yandex SERP evidence.

GenSearch:

`POST https://searchapi.api.cloud.yandex.net/v2/gen/search`

Используется только как отдельный evidence type `YANDEX_GENERATIVE_ALICE_TECH` и не переименовывается в direct consumer Alice UI observation.

### R2 WebSearch baseline

- `SEARCH_TYPE_RU`;
- region `225`;
- page `0`;
- first `10` groups;
- fixed mobile User-Agent для primary pass;
- XML для compact organic Top-10 extraction;
- HTML только там, где нужен composition/rich-block evidence.

Generic Bing/Google/web-search не считается Yandex Top-10 evidence.

### Authentication

Сохраняется существующая local Yandex Cloud credential model:

- `Authorization: Api-Key ...`;
- local `folderId`;
- ключ не передаётся в ChatGPT и не коммитится в repository.

Новый token заранее не требуется. Первый live WebSearch provider probe является authority на наличие нужного Search API role/scope у текущего локального API key.

При authorization/provider failure:

- сохранить exact error;
- не делать automatic retry;
- только затем исправлять IAM/scope/key configuration.

### Pricing checkpoint

Официальный тариф был проверен 2026-08-12 в рамках channel audit:

- synchronous WebSearch daytime: `0.488 RUB/request`;
- synchronous WebSearch nighttime 00:00–07:59:59 UTC+3: `0.366 RUB/request`;
- deferred WebSearch daytime: `0.0305 RUB/request`;
- deferred WebSearch nighttime: `0.02541 RUB/request`;
- synchronous generative response: `5.08 RUB/request`.

Authorization errors и internal server errors были документированы Яндексом как non-billable.

Перед каждым будущим paid request тариф должен быть проверен заново по официальному Yandex source; эта запись не является perpetual pricing authority.

### Static / CI acceptance

GitHub Actions workflow:

`.github/workflows/yandex-search-overlay.yml`

Acceptance run:

- run id: `31574779725`;
- accepted head: `bd9b7b43efbf4bd19b105a8ceb138b2776a772c1`;
- conclusion: `success`.

Проверены:

- overlay protocol tests;
- preservation of original Wordstat command/result semantics;
- mobile XML WebSearch contract;
- desktop HTML WebSearch contract;
- GenSearch contract;
- rejection of unsupported device/region controls;
- rejection of arbitrary methods;
- derived package build;
- manifest/import/version verification;
- ZIP packaging.

Full derived extension ZIP SHA-256:

`371a7f0f2cd36ce6ffbbe4f921344207a1e441bf7be6c26f4cb731bfd27e02b9`

Preferred in-place patch ZIP SHA-256:

`a850d26dbb0998ad14629d27d8735f2189cc6c30fb8064d74565fcbbf04b0e9a`

### Installation policy

Для уже установленного unpacked Wordstat Bridge предпочтителен in-place update той же папки:

1. применить overlay;
2. сохранить ту же extension identity/storage namespace;
3. Reload в `chrome://extensions`;
4. не переносить и не раскрывать credentials.

`apply_in_place.py` не читает/экспортирует/изменяет credentials и создаёт local backup, если backup явно не отключён.

### Provider acceptance status at chat handoff

Статус на момент этой записи:

**BUILD/STATIC ACCEPTED; LIVE PROVIDER ACCEPTANCE NOT YET EXECUTED.**

Ни одного live Yandex Search API запроса через новый overlay ещё не выполнено.

Единственный непосредственный blocker roadmap 04.2:

- локально применить in-place overlay к текущему installed extension;
- Reload;
- выполнить ровно один live `webSearch` probe.

Предпочтительный первый probe:

- query: `славянские обереги`;
- method: `webSearch`;
- region: `225`;
- device: PHONE / fixed mobile User-Agent;
- page: `0`;
- groups: `10`;
- response: XML;
- exactly one request;
- fresh official tariff check immediately before execution;
- no automatic retry.

### Required future append entries

После первого live provider probe в append-only chain нужно добавить новую запись с:

- request identity;
- method/query/region/device/format;
- fresh tariff snapshot;
- HTTP/provider result;
- authorization verdict;
- raw evidence reference;
- provider acceptance verdict;
- package/version identity;
- указанием, был ли retry (`must be no automatic retry`).

Если позже обнаружена ошибка в этой записи, исторический текст не редактировать: добавить новую correction/superseding entry в конец.

## Related GitHub authority

- `marketing/roadmap/04_YANDEX_SERP_ALICE_RESEARCH.md`;
- `marketing/research/R2_YANDEX_SEARCH_API_CHANNEL_AUDIT_2026-08-12.md`;
- `marketing/research/R2_YANDEX_SERP_ALICE_CHAT_HANDOFF_2026-08-12.md`;
- `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/ACCEPTANCE_2026-08-12.md`;
- `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/yandex_search_protocol_overlay.js`;
- `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/apply_in_place.py`.
