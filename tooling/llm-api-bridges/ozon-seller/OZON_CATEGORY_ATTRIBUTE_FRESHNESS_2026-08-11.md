# Ozon category / attribute freshness requirements — 2026-08-11

Статус: **RESEARCH REQUIREMENT — dynamic dictionary evidence confirmed; exact update-feed contract pending**

## 1. Почему category/attribute master нельзя считать статичным

Verified Ozon Seller API notification in June 2026 announced:

> `Уведомления об изменениях контента: автоматизируйте работу с категориями и атрибутами`

Ozon states that Seller API received **two new automated ways** to obtain information about critical updates and changes in the category tree and product attributes, allowing systems to react to content changes without frequent manual checks.

Official linked article:

- `https://dev.ozon.ru/start/524-Uvedomleniia-ob-izmeneniiakh-kontenta-avtomatiziruite-rabotu-s-kategoriiami-i-atributami/`

The current runtime cannot fetch the article body because the Ozon page enters a redirect loop. Therefore the exact two mechanisms are **not inferred** from context.

Engineering conclusion that is supported:

- category tree and attribute metadata are dynamic operational data;
- canonical Product/Category master must store evidence freshness/snapshot time;
- one initial dictionary import cannot be treated as permanently valid.

## 2. Independent 2026 evidence that attributes/categories change materially

Ozon notification stream also reports current operational changes such as:

- attribute `22232 — Код ТН ВЭД ЕАЭС` becoming mandatory for many more categories; without it SKU creation can fail;
- technical cleanup of around 55,000 obsolete `ТН ВЭД value — category` links announced for July 2026;
- validation changes for attribute `23536 — Нужен код маркировки`;
- guarantee attribute changing to a strict reference-value format from 2026-05-04.

These are mutation/content-management examples, not read-contract proof. Their relevance is that category↔attribute dictionaries and validation rules are not static metadata.

## 3. Candidate notification infrastructure — relation to category feed NOT YET PROVEN

Ozon separately added two relevant infrastructure contours in 2026:

### Seller API chat categories

Ozon announced new categories in `/v3/chat/list` for automated information about Seller API updates/changes.

### Push notifications

On 2026-04-08 Ozon added beta methods:

- `/v1/notification/set`;
- `/v1/notification/update`;
- `/v1/notification/check`;
- `/v1/notification/delete`;
- `/v1/notification/enable`;
- `/v1/notification/list`;
- `/v1/notification/push-type/list`.

These prove that automated notification infrastructure exists.

**Important boundary:** the accessible category-change announcement does not expose which exact chat category/push type/method constitutes each of its “two new ways”. Until the linked article or full current contracts are retrieved, do not wire category refresh to either mechanism by assumption.

## 4. Product Master data-model requirement

The future product-centric layer should preserve at minimum for category/attribute evidence:

- `description_category_id` where current product contract exposes it;
- `type_id` where current contract exposes it;
- attribute id;
- attribute value id/value;
- required/optional/reference semantics where current dictionary contract exposes them;
- source method/version;
- retrieved_at / snapshot timestamp;
- active/currentness status if exposed;
- update-notification evidence id/time if a verified feed is later implemented.

Do not overwrite historical snapshots in a way that makes it impossible to explain why a listing passed validation one week and failed later.

## 5. Future bridge behavior

Initial read-only bridge requirements:

- dictionary reads are explicit operations;
- automatic unbounded refresh/fan-out is prohibited;
- notification subscriptions/configuration are mutations and therefore **not part of initial read-only scope** unless separately governed later;
- receiving/reading an already-configured notification feed may be considered later only after the exact Ozon-owned contract is verified;
- product research/reporting should record dictionary freshness when attribute requirements influence listing diagnostics.

## 6. Remaining contract gaps

Need authoritative Ozon-owned evidence for:

1. current 2026 contracts of `/v1/description-category/tree`, `/attribute`, `/attribute/values`;
2. exact two automated category/attribute update mechanisms referenced by article 524;
3. relevant chat category and/or push type identifiers, if those are indeed the mechanisms;
4. whether update events contain changed category/attribute ids or only informational text;
5. retention/history and delivery guarantees;
6. rate/access restrictions.

Until these are known, category dictionary refresh remains a **research/operational requirement**, not implemented automation.
