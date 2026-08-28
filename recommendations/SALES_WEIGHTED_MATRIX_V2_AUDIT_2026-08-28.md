# Sales-weighted Recommendation Matrix V2 — audit and decision authority

Date: 2026-08-28  
Status: **APPROVED WORKING AUTHORITY**  
Matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`  
Calendar: `KIP_CHERTOG_CALENDAR_V1`

## 1. Authority and supersession

This document records the owner-approved rebuild of the recommendation matrix with a materially stronger commercial-sales priority.

It supersedes the V1 rule that sales, popularity and marketplace behavior cannot influence semantic recommendation. V1 documents remain useful as historical context, but where they conflict with this file or with the current `RECOMMENDATION_MATRIX.md`, V2 wins.

The V2 decision is not “recommend the bestseller everywhere”. The new ordering is:

1. reject clearly unrelated products;
2. preserve hard visual/product contradictions;
3. among products that can be explained naturally for the Chertog, give **strong weight to actual sales**;
4. a much stronger seller may replace a weaker curated or even another strong relation when the customer-facing explanation remains natural;
5. marketplace-specific selection is allowed when the approved semantic candidate set is valid but actual commercial performance differs by marketplace.

## 2. Commercial evidence used

Two independent sales signals are used.

### Wildberries

Supplier report period: `2026-01-01 — 2026-08-28`.  
Primary metric: `Выкупили, шт.` for subject `Обереги`.

### Ozon

Seller Analytics period: `2026-06-01 — 2026-08-28`.  
Operation: `analytics_data`.  
Dimension: `sku`.  
Metric: `ordered_units`.  
Result: HTTP 200, one physical provider request, universal analytics scope.

The periods are different, so the WB and Ozon numbers are **not added into one formal YTD metric**. They are used as two independent ranking signals. Agreement between the two marketplaces is especially strong evidence.

## 3. Sales snapshot for Slavic-symbol products

| Product | WB bought | Ozon ordered units | V2 role |
|---|---:|---:|---|
| Печать Велеса | 1003 | 382 | core bestseller; Медведь only |
| Чур | 84 | 80 | active |
| Алатырь | 69 | 83 | active, expanded |
| Велес | 66 | 48 | active |
| Сварог | 36 | 39 | active male curated |
| Звезда Лады | 41 | 33 | active, expanded |
| Мара | 41 | 29 | active |
| Колядник | no WB card in sales report | 67 | Ozon Ворон male |
| Перун | 39 | 22 | active |
| Молвинец | 28 | 23 | promoted to active |
| Чернобог | 36 | 15 | reserve |
| Триглав | 32 | 16 | reserve |
| Родимич | 23 | 16 | active |
| Белобог | 32 | 4 | removed from automatic V2 |
| Громовик | no WB row | 34 | reserve |
| Даждьбог | 20 | 10 | active only for Раса |
| Ратиборец | 13 | 10 | reserve |
| Семаргл | 16 | 7 | active direct |
| Макошь | 18 | 3 | active only for direct Лебедь female |
| Жива | 9 | 7 | active |
| Боговник | 10 | 5 | removed from automatic V2 |
| Всеславец | 7 | 1 | removed from automatic V2 |
| Стрибог | 3 | 5 | reserve |
| Знич | 4 | 3 | removed from automatic V2 |
| Хорс | 3 | 1 | reserve |

## 4. Final effective matrix

Every V2 case returns exactly **one** product. There are no secondary recommendations.

| Chertog | Ozon male | Ozon female | Wildberries male | Wildberries female |
|---|---|---|---|---|
| Дева | Сварог | Жива | Сварог | Жива |
| Вепрь | Алатырь | Алатырь | Алатырь | Алатырь |
| Щука | Родимич | Звезда Лады | Родимич | Звезда Лады |
| Лебедь | Родимич | Макошь | Родимич | Макошь |
| Змей | Семаргл | Семаргл | Семаргл | Семаргл |
| Ворон | Колядник | Алатырь | Алатырь | Алатырь |
| Медведь | Печать Велеса — Медвежья лапа | Печать Велеса — Медвежья лапа | Печать Велеса — Медвежья лапа | Печать Велеса — Медвежья лапа |
| Бусел | Молвинец | Звезда Лады | Молвинец | Звезда Лады |
| Волк | Велес | Велес | Велес | Велес |
| Лиса | Мара | Мара | Мара | Мара |
| Тур | Чур | Чур | Чур | Чур |
| Лось | Родимич | Звезда Лады | Родимич | Звезда Лады |
| Финист | Алатырь | Алатырь | Алатырь | Алатырь |
| Конь | Сварог | Жива | Сварог | Жива |
| Орёл | Перун | Перун | Перун | Перун |
| Раса | Даждьбог | Даждьбог | Даждьбог | Даждьбог |

The only marketplace-specific difference is `Ворон + мужчина`:

- Ozon → `Колядник`;
- Wildberries → `Алатырь`.

## 5. Hard owner decisions

### 5.1. Даждьбог exactly two matrix rows

`Даждьбог` remains only:

- Раса + мужчина;
- Раса + женщина.

It must not be used for Дева, Ворон, Конь or any other Chertog in automatic V2.

### 5.2. Медведь only Печать Велеса

For both sexes:

```text
Медведь → Печать Велеса — Медвежья лапа
```

`Сварог` is removed from Медведь completely.

### 5.3. Печать Велеса is not used for Волк

The actual sold product is the **bear-paw visual form**. Using this card for `Волк` creates customer-visible confusion even though the marketplace title contains “Велеса”. Therefore:

```text
Медведь → Печать Велеса — Медвежья лапа
Волк → Велес
```

`bear_paw` / marketplace `Печать Велеса` is forbidden outside Медведь in automatic V2.

### 5.4. Сварог is treated as male-coded in V2

The owner decision is that Сварог reads more masculine than the bear-paw Печать Велеса. V2 therefore uses Сварог only in male curated rows:

- Дева + мужчина;
- Конь + мужчина.

## 6. Replacement audit with customer-facing justification

The text below is the approved **type of explanation that may appear in the recommendation itself**. Sales numbers are internal and must never be shown to the customer as the reason for selection.

### 6.1. Дева + мужчина: Даждьбог → Сварог

Commercial signal:

- Даждьбог: WB 20 / Ozon 10;
- Сварог: WB 36 / Ozon 39.

Why acceptable: the old male row was already curated around life/creative force. Svarog keeps the active, creative, constructive line while being substantially stronger commercially.

Customer copy:

> Дата относится к Чертогу Девы. Этот Чертог связывают с жизненной силой, развитием, созиданием и стремлением воплощать задуманное. Мужчине рекомендуем оберег «Сварог». Его связывают с созидательным трудом, мастерством, порядком и умением создавать прочную основу своими руками, поэтому смысл этого символа хорошо соответствует деятельной и созидательной стороне Чертога Девы.

### 6.2. Щука + женщина: Макошь → Звезда Лады

Commercial signal:

- Макошь: WB 18 / Ozon 3;
- Звезда Лады: WB 41 / Ozon 33.

Why acceptable: both belong to a female family/lineage/harmony semantic zone for this curated row; the sales difference is large on both marketplaces.

Customer copy:

> Дата относится к Чертогу Щуки. Этот Чертог связывают с продолжением рода, заботой о близких, семейными связями и сохранением преемственности. Женщине рекомендуем оберег «Звезда Лады». Этот символ связывают с женской силой, семейным благополучием, гармонией между близкими и сохранением домашнего очага, поэтому он хорошо продолжает родовую линию Чертога Щуки.

### 6.3. Лебедь + мужчина: Всеславец → Родимич

Commercial signal:

- Всеславец: WB 7 / Ozon 1;
- Родимич: WB 23 / Ozon 16.

Why acceptable: the male Лебедь row is curated, not direct. Family, lineage and responsibility toward relatives remain a natural explanation while moving away from an extremely weak seller.

Customer copy:

> Дата относится к Чертогу Лебедя. Этот Чертог связывают с гармонией, семьёй, внутренним равновесием и сохранением связи с близкими. Мужчине рекомендуем оберег «Родимич». Его связывают с родовой памятью, преемственностью поколений и ответственностью перед своей семьёй, поэтому смысл символа хорошо соответствует семейной линии Чертога Лебедя.

### 6.4. Ворон + женщина: Белобог → Алатырь

Commercial signal:

- Белобог: WB 32 / Ozon 4;
- Алатырь: WB 69 / Ozon 83.

Why acceptable: the old female row was already weak curated. V2 moves to a stronger universal symbol that can be explained through inner balance, support and the ability to pass through change/new cycles.

Customer copy:

> Дата относится к Чертогу Ворона. Этот Чертог связывают с мудростью, переменами, новым жизненным циклом и способностью видеть направление дальнейшего пути. Рекомендуем оберег «Алатырь». Его связывают с внутренним центром, равновесием и прочной опорой, поэтому этот символ хорошо подходит человеку, которому важно уверенно проходить перемены и начинать новый этап.

### 6.5. Ворон + мужчина on Wildberries: previous WB Даждьбог override → Алатырь

Owner constraint: Даждьбог must exist in exactly two rows, both Раса. Therefore the old WB-only Ворон male override is removed.

Customer copy:

> Дата относится к Чертогу Ворона. Этот Чертог связывают с мудростью, переменами, обновлением и умением видеть дальнейший путь. Мужчине рекомендуем оберег «Алатырь». Его связывают с внутренней опорой, равновесием и устойчивым центром, поэтому символ хорошо соответствует теме уверенного прохождения перемен и нового жизненного этапа.

Ozon keeps `Колядник` for male Ворон because it has a direct derived Kolyada relation and 67 ordered units in the Ozon period.

### 6.6. Медведь + мужчина: Сварог + Медвежья лапа → only Печать Велеса

Commercial signal:

- Печать Велеса: WB 1003 / Ozon 382;
- Сварог: WB 36 / Ozon 39.

Why acceptable: this is not a random bestseller substitution. The actual card is the bear-paw form, which directly matches the Chertog symbol. Owner decision is to keep only this product.

Customer copy:

> Дата относится к Чертогу Медведя. Этот Чертог связывают с внутренней силой, стойкостью, ответственностью, защитой близких и умением твёрдо стоять на своём. Рекомендуем «Печать Велеса — Медвежью лапу». Образ медвежьей лапы непосредственно перекликается с символом самого Чертога Медведя; этот знак связывают с силой, уверенностью, защитой и способностью преодолевать трудности.

### 6.7. Медведь + женщина: Сварог → Печать Велеса

Same owner decision and same direct Chertog-symbol logic as the male row. The product policy changes from male-only to `any`, but **only inside Медведь**.

Customer copy is the same shared Медведь copy above; do not add a separate “female version” unless the interface needs gender-specific grammar.

### 6.8. Бусел + мужчина: Родимич → Молвинец

Commercial signal:

- Родимич: WB 23 / Ozon 16;
- Молвинец: WB 28 / Ozon 23.

Why acceptable: both can be explained in a family/lineage space, while Молвинец has the stronger commercial signal and supports a distinct protection-of-word/good-name angle.

Customer copy:

> Дата относится к Чертогу Бусла. Этот Чертог связывают с родом, преемственностью поколений, семейной ответственностью и сохранением связи с предками. Мужчине рекомендуем оберег «Молвинец». Этот символ связывают с защитой человека и его рода, силой слова и сохранением доброго имени семьи, поэтому он хорошо соответствует родовой линии Чертога Бусла.

### 6.9. Лось + мужчина: Всеславец → Родимич

Commercial signal:

- Всеславец: WB 7 / Ozon 1;
- Родимич: WB 23 / Ozon 16.

Why acceptable: the row is a male family/harmony substitute. Родимич keeps family continuity and responsibility while removing an extremely weak seller.

Customer copy:

> Дата относится к Чертогу Лося. Этот Чертог связывают с трудолюбием, заботой о близких, семейным единством и умением создавать прочные отношения. Мужчине рекомендуем оберег «Родимич». Его связывают с родовой преемственностью, уважением к предкам и ответственностью за продолжение рода, поэтому символ хорошо соответствует семейной основе Чертога Лося.

### 6.10. Финист + мужчина/женщина: Боговник → Алатырь

Commercial signal:

- Боговник: WB 10 / Ozon 5;
- Алатырь: WB 69 / Ozon 83.

Why acceptable: the old row was a curated spiritual-path substitute. Aлатырь keeps a natural “inner center / support / direction” explanation and has a dramatically stronger sales signal.

Customer copy:

> Дата относится к Чертогу Финиста. Этот Чертог связывают с целеустремлённостью, развитием своих способностей, внутренним ростом и поиском собственного пути. Рекомендуем оберег «Алатырь». Его связывают с внутренним центром, равновесием и прочной духовной опорой, поэтому символ хорошо соответствует стремлению Финиста развиваться, сохранять направление и уверенно двигаться к выбранной цели.

### 6.11. Конь + мужчина: Знич → Сварог

Commercial signal:

- Знич: WB 4 / Ozon 3;
- Сварог: WB 36 / Ozon 39.

Why acceptable: both can be explained through an active fire/life/creative-energy line, but Svarog has a much stronger commercial signal.

Customer copy:

> Дата относится к Чертогу Коня. Этот Чертог связывают с жизненной энергией, огнём, активностью, внутренней силой и стремлением жить ярко и деятельно. Мужчине рекомендуем оберег «Сварог». Его связывают с огнём, силой созидания, мастерством и деятельностью, поэтому этот символ хорошо соответствует активной и огненной природе Чертога Коня.

## 7. Protected rows that remain despite lower sales

Sales priority is high, but not unlimited.

- `Дева + female → Жива` remains because it is direct patron and the female line is clean.
- `Лебедь + female → Макошь` remains because it is direct patron.
- `Змей → Семаргл` remains direct for both sexes.
- `Волк → Велес` remains direct and avoids the bear-paw visual contradiction.
- `Лиса → Мара` remains direct derived and sells adequately.
- `Орёл → Перун` remains direct.
- `Раса → Даждьбог` remains direct and is the only place Dazhdbog may appear.
- `Тур → Чур` remains because it is already a strong seller on both marketplaces.

## 8. Automatic-V2 removals

The following products no longer appear in automatic V2 recommendations:

- Белобог;
- Всеславец;
- Боговник;
- Знич.

They may remain in the assortment but are not automatic matrix outputs.

The following remain reserve and are not promoted merely because of sales:

- Чернобог;
- Триглав;
- Ратиборец;
- Громовик;
- Стрибог;
- Хорс.

## 9. Customer-copy rules

Never tell a customer that a product, symbol, card, link or stock is missing. Never explain a recommendation as a fallback caused by absence.

Never mention sales, ordered units, conversion, stock, matrix rank, internal relation types or commercial optimization in customer-facing recommendation copy.

Explain only the positive reason the selected symbol fits the Chertog.

No magical guarantee language such as “точно защитит”, “гарантированно принесёт деньги” or “обязательно изменит судьбу”.

## 10. V2 gate

The rebuild is considered documented when:

- `RECOMMENDATION_MATRIX.md` matches section 4;
- `PRODUCT_CLASSIFICATION.md` matches the new active/reserve roles and gender policy;
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` contains the V2 copy rules and the new Медведь rule;
- no automatic row contains more than one product;
- Даждьбог occurs exactly twice, both in Раса;
- Печать Велеса occurs only in Медведь, for both sexes;
- Волк uses Велес, never the bear-paw Печать Велеса;
- Ozon/WB difference is limited to approved marketplace overrides, currently `Ворон + male`.

Decision marker:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
