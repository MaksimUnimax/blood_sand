# R2 — Yandex Search API direct-observation channel audit

Дата: 2026-08-12  
Статус: **DIRECT SERP CHANNEL CONFIRMED / ALICE-TECH CHANNEL CONFIRMED WITH SCOPE LIMITATION**

## Цель

Проверить, существует ли официальный канал, который позволяет получить воспроизводимое evidence именно из поисковой базы Яндекса без подмены generic web-search, и можно ли использовать существующий локальный Yandex Cloud credential/lifecycle stack проекта.

## Authority

Проверены актуальные официальные страницы Yandex Cloud / AI Studio:

- https://aistudio.yandex.ru/docs/ru/search-api/concepts/web-search.html
- https://aistudio.yandex.ru/docs/ru/search-api/api-ref/WebSearch/search.html
- https://aistudio.yandex.ru/docs/ru/search-api/concepts/html-response.html
- https://aistudio.yandex.ru/docs/ru/search-api/api-ref/authentication.html
- https://aistudio.yandex.ru/docs/ru/search-api/security/
- https://aistudio.yandex.ru/docs/ru/search-api/concepts/limits.html
- https://aistudio.yandex.ru/docs/ru/search-api/pricing.html
- https://aistudio.yandex.ru/docs/ru/search-api/concepts/generative-response.html
- https://aistudio.yandex.ru/docs/ru/search-api/api-ref/GenSearch/search.html
- https://aistudio.yandex.ru/docs/ru/search-api/operations/generative-search.html

## Verdict 1 — direct Yandex SERP

**CONFIRMED.**

Official synchronous REST endpoint:

`POST https://searchapi.api.cloud.yandex.net/v2/web/search`

Required/decision-useful fields:

- `query.searchType = SEARCH_TYPE_RU`;
- `query.queryText = <query>`;
- `query.page = 0`;
- `region = 225` for Russia;
- `folderId = <local folder id>`;
- `responseFormat = FORMAT_XML` or `FORMAT_HTML`;
- `userAgent = <mobile/desktop UA>`;
- `groupSpec.groupsOnPage = 10` for first-page observation.

Official docs state that `userAgent` changes search output for the requested device/browser, including mobile output.

### XML mode

`FORMAT_XML` returns search results without extra SERP elements. It is suitable for reproducible organic-result extraction and smaller evidence payloads.

### HTML mode

`FORMAT_HTML` returns the HTML representation corresponding to Yandex Search results in incognito mode and includes additional SERP elements such as ads, quick answers and other blocks. This is the preferred source for SERP-composition/rich-block validation.

The synchronous REST response contains Base64 `rawData`; after decoding it contains XML or HTML according to `responseFormat`.

## Verdict 2 — authentication reuse

**TRANSPORT/SECRET MODEL COMPATIBLE.**

Yandex Search API supports:

`Authorization: Api-Key <API-key>`

and requires `search-api.webSearch.user`. For scoped API keys, the documented scope is `yc.search-api.execute`.

The existing accepted Wordstat Bridge already:

- stores API key and folder ID locally in extension storage;
- posts to `https://searchapi.api.cloud.yandex.net/*`;
- sends `Authorization: Api-Key ...`;
- has host permission for the whole Search API host;
- has bounded responses and single-flight/exactly-once request ownership.

Therefore a second credential stack is not justified. Access-role/scope compatibility must be verified by one real Search API request; an authorization failure is not billed according to the official tariff rules and must not be auto-retried.

## Verdict 3 — generative / Alice-technology channel

**CONFIRMED AS OFFICIAL ALICE-TECH EVIDENCE, NOT IDENTICAL CONSUMER-UI OBSERVATION.**

Official endpoint:

`POST https://searchapi.api.cloud.yandex.net/v2/gen/search`

Yandex describes the service as generative search using the technology underlying Alice answers. If `site`, `host` and `url` restrictions are omitted, search is performed across the whole Yandex search index / internet. Response includes generated message plus cited `sources`.

However the documented GenSearch request does not expose the same `region` / `userAgent` controls as WebSearch. Therefore:

- it is valid as `YANDEX_GENERATIVE_ALICE_TECH` evidence;
- it must not be labelled as a direct observation of the consumer `Поиск с Алисой` UI;
- if consumer Alice UI remains inaccessible, its status stays `NOT_OBSERVED/BLOCKED`, while official generative API evidence is stored separately.

## Current official pricing

Official pricing checked 2026-08-12.

RUB, VAT included:

- daytime synchronous WebSearch: 488 ₽ / 1000 = **0.488 ₽ per request**;
- nighttime synchronous WebSearch (00:00–07:59:59 UTC+3): 366 ₽ / 1000 = **0.366 ₽ per request**;
- daytime deferred WebSearch: 30.5 ₽ / 1000 = 0.0305 ₽ per request;
- nighttime deferred WebSearch: 25.41 ₽ / 1000 = 0.02541 ₽ per request;
- synchronous generative response: 5080 ₽ / 1000 = **5.08 ₽ per request**.

Authorization errors and internal server errors are not billed according to the official pricing page.

For roadmap 04, synchronous mode is preferred despite higher unit price because evidence must be processed sequentially and immediately; deferred search has a documented minimum processing time of five minutes and can take substantially longer.

## Quotas relevant to R2

Default documented quotas:

- synchronous WebSearch: 10 requests/s, 10,000/hour;
- generative search: 1 request/s, 1,000/hour;
- maximum query length: 400 chars / 40 words;
- maximum returned text-search results: 250.

These limits are far above the decision-grade R2 scope.

## Proposed R2 request pattern

### Primary organic/mobile evidence

For each primary query:

- method: `webSearch`;
- search type: RU;
- region: 225;
- device: PHONE mapped to a fixed mobile UA;
- page: 0;
- groupsOnPage: 10;
- responseFormat: XML for compact organic extraction.

### Rich SERP composition

Use HTML only where needed to verify product/quick-answer/ads/rich elements, because HTML payloads are materially larger. Primary mobile roots should receive HTML observation before final 04 closure if payload size is operationally safe.

### Generative evidence

For the same decision roots:

- method: `genSearch`;
- full Yandex index (no site/host/url restriction);
- Russian search type;
- no partial streaming;
- preserve generated answer and source URLs exactly.

## Tooling decision

Do **not** create a second full browser/credential bridge.

Use the accepted Wordstat Bridge lifecycle and network transport and add a narrowly scoped protocol overlay:

- `YANDEX_SEARCH_API_V1` command prefix;
- `YANDEX_SEARCH_RESULT_V1` result prefix;
- allowlisted `webSearch` and `genSearch` only;
- no arbitrary URL/method/body passthrough;
- one command = one Yandex API request;
- no automatic retry when request outcome is unknown or provider returns an error;
- local credentials only;
- preserve Wordstat commands unchanged.

## Acceptance gate before paid R2 collection

1. Overlay parser unit tests pass.
2. Existing Wordstat protocol tests remain green / semantically unchanged.
3. One `webSearch` probe confirms role/scope and returns direct Yandex result.
4. Cost of the exact request is rechecked from the official tariff immediately before the paid probe.
5. If auth fails: record blocker; no automatic retry.
6. Only after successful probe begin the 10-query mobile primary pass.

## Roadmap implication

04.2 is no longer blocked by lack of a direct Yandex data source. The remaining blocker is local execution support in the existing browser bridge. Implementing the narrow protocol overlay is the next immediate action.
