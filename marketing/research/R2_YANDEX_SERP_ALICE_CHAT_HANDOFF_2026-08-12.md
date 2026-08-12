# R2 — Yandex SERP + Alice — chat handoff checkpoint

Дата фиксации: 2026-08-12  
Статус: **HANDOFF — roadmap 04 active, 04.2 blocked only by local extension reload**

## Source of truth

Repository: `MaksimUnimax/blood_sand`  
Working branch: `work/ozon-data-collection-2026-08-11`

Live GitHub is the only authority. The branch is shared with parallel Ozon work and can move concurrently. A new chat MUST first refetch branch HEAD + commit metadata and then reread the authority files below before any action.

HEAD observed immediately before this handoff write:

`80c241bb509a5583af441f8f697847faed0565a5`

This SHA is a checkpoint only, not future authority.

## Authority files for this track

Read in this order:

1. `marketing/roadmap/README.md`
2. `marketing/roadmap/04_YANDEX_SERP_ALICE_RESEARCH.md`
3. `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
4. `marketing/research/R2_YANDEX_SEARCH_API_CHANNEL_AUDIT_2026-08-12.md`
5. `tooling/llm-api-bridges/yandex-wordstat/CANONICAL_REFERENCE_1.1.5.md`
6. `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/ACCEPTANCE_2026-08-12.md`
7. `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/yandex_search_protocol_overlay.js`
8. `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/apply_in_place.py`
9. this handoff file.

## Project state

Roadmap 03 / Wordstat R1 is complete. Do not reopen Wordstat unless later evidence creates a documented requirement.

Roadmap 04 is active:

- `04.1` — COMPLETE;
- `04.2` — IN PROGRESS;
- `04.3` — not started;
- `04.4` — not started;
- `04.5` — not started;
- `04.6` — not started;
- `04.7` — not started.

The immediate project goal is direct Yandex SERP observation on the 10 primary Wordstat-derived queries, mobile first, then decision-useful desktop comparison and Alice layers.

## Primary query set

1. `славянские обереги`
2. `печать велеса`
3. `оберег в машину`
4. `подвеска на зеркало в машину`
5. `вегвизир`
6. `талисман знак зодиака`
7. `алатырь оберег`
8. `оберег велес`
9. `подарок мужчине в машину`
10. `подарок автомобилисту`

Secondary queries remain evidence-driven only, as defined in roadmap 04.

## Direct Yandex channel decision

Official direct Yandex Search API channels were verified from Yandex Cloud / AI Studio docs.

### WebSearch

Endpoint:

`POST https://searchapi.api.cloud.yandex.net/v2/web/search`

Use for direct Yandex SERP evidence.

R2 baseline:

- search type RU;
- region `225`;
- page `0`;
- `groupsOnPage = 10`;
- fixed mobile User-Agent for primary pass;
- `FORMAT_XML` for compact organic Top-10 extraction;
- `FORMAT_HTML` only where composition/rich-block evidence is needed.

Official HTML is treated as Yandex incognito SERP representation; generic Bing/Google/web-search is NOT valid Yandex Top-10 evidence.

### GenSearch

Endpoint:

`POST https://searchapi.api.cloud.yandex.net/v2/gen/search`

This is valid only as separate evidence type `YANDEX_GENERATIVE_ALICE_TECH`.

It MUST NOT be renamed or interpreted as direct consumer `Поиск с Алисой` UI observation. Consumer Alice remains a separate 04.4 evidence channel and may have its own blocker.

## Search overlay implementation

Existing accepted Wordstat Bridge 1.1.5 lifecycle was reused. A second credential stack was deliberately not created.

Overlay protocol:

- command prefix: `YANDEX_SEARCH_API_V1`;
- result prefix: `YANDEX_SEARCH_RESULT_V1`;
- allowlisted methods only: `webSearch`, `genSearch`;
- no arbitrary URL/method/body passthrough;
- one accepted command = one Yandex API request;
- no automatic API retry on provider/auth/unknown-outcome failure;
- credentials remain local-only;
- original `WORDSTAT_API_V1` semantics remain unchanged.

The existing manifest already allowed the whole `searchapi.api.cloud.yandex.net` host; only protocol/capture logic was extended.

## Static / CI acceptance

Search overlay build/static acceptance PASSED.

GitHub Actions:

- workflow: `.github/workflows/yandex-search-overlay.yml`;
- run id: `31574779725`;
- conclusion: `success`;
- accepted CI head: `bd9b7b43efbf4bd19b105a8ceb138b2776a772c1`.

Verified full derived extension ZIP SHA-256:

`371a7f0f2cd36ce6ffbbe4f921344207a1e441bf7be6c26f4cb731bfd27e02b9`

Preferred in-place patch ZIP SHA-256:

`a850d26dbb0998ad14629d27d8735f2189cc6c30fb8064d74565fcbbf04b0e9a`

The in-place path is preferred because a newly loaded unpacked extension can receive a new Chrome extension identity/storage namespace. Patching the currently installed unpacked folder preserves the existing identity/storage and therefore avoids unnecessary credential migration.

`apply_in_place.py` does not read/export/modify credentials and creates a local backup unless explicitly disabled.

## Authentication / token state

Do NOT ask the owner to send the API key to ChatGPT.

Search API uses the same local Yandex Cloud `Api-Key` + `folderId` model. A new token is not assumed necessary.

First live `webSearch` probe is the authority on whether the currently stored key has the required Search API role/scope. If auth fails:

- record the exact provider error;
- do not automatically retry;
- only then resolve role/scope/API-key configuration.

## Pricing checkpoint

Pricing was verified from the official Yandex Search API pricing page on 2026-08-12 during the channel audit:

- synchronous WebSearch daytime: **0.488 RUB/request**;
- synchronous WebSearch nighttime (00:00–07:59:59 UTC+3): **0.366 RUB/request**;
- deferred WebSearch daytime: 0.0305 RUB/request;
- deferred WebSearch nighttime: 0.02541 RUB/request;
- synchronous generative response: **5.08 RUB/request**.

Authorization errors and internal server errors were documented by Yandex as non-billable.

IMPORTANT: before every future paid Search API request, fresh-check the official Yandex tariff again. Do not treat these checkpoint prices as perpetual authority.

## Append-only documentation state

The owner-provided canonical Wordstat documentation is append-only.

For Search overlay 1.1.6 the prior complete documentation was preserved byte-for-byte and one new 1.1.6 entry was appended at the end.

- prior canonical documentation bytes: `171659`;
- prior canonical documentation SHA-256: `437a69022b31621d7a749e3b92c0faf0c45f3d7be60e1a901cda65c3faf0a25a`;
- preserved prefix equality: `true`;
- new companion documentation filename: `WORDSTAT_BRIDGE_DOCUMENTATION_APPEND_ONLY_FULL_FUNCTION_ENVIRONMENT_AUDIT_R2_SEARCH_OVERLAY_1.1.6.md`;
- new documentation SHA-256: `62548d39f0cb363e21a8ca703d24c8bdcd5de3c2ce41edbcf345f373c9919416`.

The documentation remains a separate companion artifact, not hidden inside the extension ZIP. The repository acceptance file records this handoff policy and hashes.

Future provider acceptance/results/corrections must be appended as new entries; do not retroactively rewrite historical append-only entries.

## Current blocker / exact next action

No live Yandex Search API request has been executed yet through the new overlay.

The only current 04.2 blocker is local execution:

1. apply the 1.1.6 Search overlay in-place to the CURRENT installed unpacked Wordstat Bridge folder;
2. open `chrome://extensions`;
3. press Reload for the same extension;
4. confirm the extension loaded without errors;
5. then perform exactly ONE live `webSearch` provider probe on a primary query.

Preferred first probe:

- query: `славянские обереги`;
- method: `webSearch`;
- Russia region `225`;
- mobile / fixed PHONE User-Agent;
- page `0`;
- first 10 groups;
- `FORMAT_XML`;
- exactly one provider request;
- fresh official tariff check immediately before issuing the command;
- no automatic retry.

After a successful provider probe:

1. preserve raw result evidence;
2. append provider-acceptance entry to append-only documentation;
3. update `ACCEPTANCE_2026-08-12.md` from static-only to provider-accepted state;
4. continue the 10-query primary mobile SERP pass sequentially;
5. use HTML observations only where needed for rich/composition evidence;
6. then proceed to 04.3 desktop comparison;
7. then 04.4 consumer Alice + separate GenSearch layer.

## Evidence rules that must survive chat transfer

- Bing/Google/generic web search is never Yandex Top-10 evidence.
- GenSearch is never relabelled as consumer Alice UI.
- No inferred Alice source domains if they were not observed.
- Organic results, ads, product blocks, rich blocks and AI surfaces remain separate observation types.
- Mobile is primary; desktop is representative/decision-useful, not exhaustive.
- Secondary expansion is evidence-driven only.
- Raw/source refs and deterministic IDs must be retained in normalized artifacts.
- Query Evidence Ledger is updated only with observed facts.
- No final Page Job / IA verdict is made inside 04; final synthesis belongs to roadmap 05.

## Parallel-track warning

This branch also contains active Ozon / marketplace work. Do not infer roadmap-04 state from the branch HEAD commit message alone. Always reread the roadmap-04 and R2 authority files after fetching live HEAD.

Do not restart or rebuild Ozon Bridge as part of this R2 task. Ozon/03A is a separate parallel track.
