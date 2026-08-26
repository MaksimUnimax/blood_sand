# Direct browser SERP observation — `вегвизир`

Observed: 2026-08-26; exact clock time not independently captured  
Surface: Yandex Search desktop browser UI  
Evidence mode: direct user-provided copied SERP text  
Exact query: `вегвизир`  
Device: DESKTOP

## Provenance / localization

Copied Search URLs contain `lr=11202`. This numeric browser localization parameter is directly observed. Its human-readable geography is not resolved here and must not be silently relabeled as Search API region `225`.

## Directly observed SERP composition

The copied browser page directly contains all of the following surface types:

- `Промо` result from `logovo-volka.ru` for `Вегвизир в футарке`;
- dedicated `Картинки` block with 10 visible image entries plus `Ещё картинки`;
- marketplace/shopping results from `ozon.ru`, `market.yandex.ru`, `wildberries.ru`, `livemaster.ru`;
- reference/informational result from English Wikipedia;
- specialist informational/commercial-content results including `ruyan-master.ru`, `zevira.ru`, `runarium.ru`;
- community/media results including Pikabu and YouTube;
- an embedded `Быстрый ответ Алисы AI` with 11 displayed sources;
- additional `Промо` results farther down the copied page.

Because this evidence is copied full-page text rather than an above-the-fold screenshot, exact visual viewport placement is not inferred beyond the directly preserved page order/labels.

## `Люди ищут` — direct UI observation

1. `вегвизир тату`
2. `вегвизир это`
3. `вегвизир ударение`
4. `вегвизир это что значит`
5. `вегвизир значение`
6. `вегвизир значение символа`
7. `вегвизир что это`
8. `вигвизир`
9. `вегвизир яглута вальхейм где найти`
10. `вегвизирь`

This confirms strong entity/meaning demand around the root, with one visible gaming-contamination branch (`Valheim`).

## Image block

The copied `Картинки` block visibly mixes symbolic/reference imagery and commerce/user-generated origins. One visible image URL is from Ozon image CDN; others include Pinterest, Pikabu and YouTube origins. This is recorded as a visual-discovery surface, not ordinary organic ranking.

## Embedded Alice

The copied page contains an embedded `Быстрый ответ Алисы AI` for the exact query. Its 11-source answer is stored separately in:

`marketing/data/raw/alice/20260826__vegvizir__embedded.md`

A separate consumer Alice chat observation for the same exact input was also directly captured and is stored in:

`marketing/data/raw/alice/20260826__vegvizir__consumer_chat.md`

## Evidence-safe interpretation

- Ordinary Search is mixed: commerce/marketplaces + entity/reference + specialist explanation.
- The root query has strong informational expansion (`это`, `значение`, `что это`) in direct `Люди ищут` evidence.
- Marketplace presence in Search does not imply marketplace dominance in Alice.
- No final Page Job or IA decision is assigned at this stage.
