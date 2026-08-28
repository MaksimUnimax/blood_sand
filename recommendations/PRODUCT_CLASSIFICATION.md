# Классификация славянских оберегов для рекомендательной системы

Статус: **V2 SALES-WEIGHTED — current authority**  
Product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`

Источник ассортимента: нормализованный Ozon/Wildberries ассортимент проекта `blood_sand`. В семейство `slavic_symbols_oberegs` входят 25 SKU.

Коммерческая доказательная база и полные причины изменений: `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

## 1. Принципы V2

1. Классификация остаётся **продуктовой curated-политикой**, а не заявлением о доказанной древней исторической системе.
2. V2 даёт фактическим продажам высокий вес **после отсечения явно неподходящих по смыслу и визуально противоречивых вариантов**.
3. Сильный seller может быть выбран вместо слабого curated SKU, если клиентское объяснение остаётся естественным и не требует сообщать про продажи.
4. Marketplace-specific выбор разрешён только явным versioned override.
5. В customer-facing тексте продажи, остатки, отсутствие карточек и внутренние причины ranking не упоминаются.
6. В V2 каждый `Чертог × пол × marketplace` возвращает ровно один товар.

## 2. Gender policy V2

Допустимые значения:

- `male` — автоматическая выдача только мужчине;
- `female` — автоматическая выдача только женщине;
- `any` — можно использовать для обоих полов.

V1-значение `any_male_coded` больше не требуется для активных V2-строк: если продукт сознательно считается мужским в V2, фиксируем `male`.

Owner decisions:

- `Сварог` → `male`;
- `Печать Велеса / Медвежья лапа` → `any`, но разрешена **только для Медведя**;
- `Жива`, `Макошь`, `Звезда Лады` → `female`;
- `Родимич`, `Колядник` → `male`;
- `Перун` → `any`;
- `Алатырь`, `Велес`, `Мара`, `Чур`, `Семаргл`, `Даждьбог`, `Молвинец` → `any` на уровне товара; конкретные matrix rows могут быть gender-specific.

## 3. Полная классификация 25 SKU

| SKU / товар | recommendation identity | gender_policy | Роль в V2 | Автоматические Чертоги V2 | Комментарий |
|---|---|---|---|---|---|
| Белобог | Белобог | any | inactive_auto / reserve | — | Удалён из automatic V2; женский Ворон переведён на Алатырь |
| Чернобог | Чернобог | any | reserve | — | Продажи заметные, но нет утверждённой строки без большой натяжки |
| Велес | Велес | any | direct | Волк / оба | Прямой покровитель Волка; остаётся вместо bear-paw Печати Велеса |
| Печать Велеса | Медвежья лапа | any | direct_symbol / core_bestseller | Медведь / оба | Customer label: «Печать Велеса — Медвежья лапа»; только Медведь |
| Алатырь (Крест Сварога) | Алатырь | any | sales_weighted_fallback | Вепрь / оба; Ворон / female; Ворон / male WB; Финист / оба | Один из главных коммерческих SKU V2 |
| Триглав | Триглав | any | reserve | — | Продажи выше части старых V1 SKU, но automatic row не утверждён |
| Ратиборец | Ратиборец | male | reserve | — | Мужской резерв; automatic row не утверждён |
| Молвинец | Молвинец | any | sales_weighted_fallback | Бусел / мужчина | Повышен из reserve в active V2 |
| Колядник | Колядник | male | direct_derived | Ворон / мужчина / Ozon | Производное соответствие линии Коляды; Ozon commercial signal сильный |
| Знич | Знич | male | inactive_auto / reserve | — | Удалён из Коня; заменён на Сварог |
| Громовик | Громовик | male | reserve | — | Не подмешивается в Орла при наличии Перуна |
| Всеславец | Всеславец | male | inactive_auto / reserve | — | Удалён из Лебедя и Лося из-за слабого commercial signal и наличия Родимича |
| Боговник | Боговник | any | inactive_auto / reserve | — | Удалён из Финиста; заменён на Алатырь |
| Родимич | Родимич | male | sales_weighted_fallback | Щука / мужчина; Лебедь / мужчина; Лось / мужчина | Активная мужская родовая/семейная линия |
| Жива | Жива | female | direct/fallback | Дева / женщина; Конь / женщина | Прямая Дева; жизненная линия Коня |
| Сварог | Сварог | male | sales_weighted_fallback | Дева / мужчина; Конь / мужчина | В V2 не выдаётся Медведю; трактуется как мужской символ |
| Перун | Перун | any | direct | Орёл / оба | Прямой покровитель Орла |
| Стрибог | Стрибог | any | reserve | — | Automatic row не утверждён |
| Макошь | Макошь | female | direct | Лебедь / женщина | В Щуке заменена на более продаваемую Звезду Лады; остаётся там, где она прямая |
| Семаргл | Семаргл | any | direct | Змей / оба | Прямой покровитель Змея; сохраняется несмотря на более низкие продажи |
| Хорс | Хорс | any | reserve | — | Automatic row не утверждён |
| Мара | Мара | any | direct_derived | Лиса / оба | Прямое производное соответствие Марене |
| Звезда Лады | Звезда Лады | female | direct_derived / sales_weighted_fallback | Щука / женщина; Бусел / женщина; Лось / женщина | Расширена в Щуку; сильный commercial signal |
| Даждьбог | Даждьбог | any | direct | Раса / оба | **Только две matrix rows: Раса male + female** |
| Чур | Чур | any | sales_weighted_fallback | Тур / оба | Сильный seller и приемлемая защитная линия |

## 4. Печать Велеса / Медвежья лапа — критическая нормализация

Marketplace card:

```text
Печать Велеса
```

Стабильная recommendation identity для destination compatibility:

```text
Медвежья лапа
```

Customer-facing label V2:

```text
Печать Велеса — Медвежья лапа
```

Фактическая продаваемая визуальная форма — **медвежья лапа**. Это критично для матрицы.

Разрешено:

```text
Медведь + male   → Медвежья лапа
Медведь + female → Медвежья лапа
```

Запрещено:

```text
Волк → Медвежья лапа
любой другой Чертог → Медвежья лапа
```

Наличие слова `Велеса` в marketplace title не делает bear-paw SKU подходящим для Чертога Волка. Для Волка используется отдельный товар `Велес`.

## 5. Даждьбог — owner-locked cap

В automatic V2 он используется ровно два раза:

```text
Раса + мужчина → Даждьбог
Раса + женщина → Даждьбог
```

Запрещены прежние/обсуждавшиеся автоматические placements:

- Дева + мужчина;
- Ворон + мужчина WB;
- Конь + мужчина;
- любые другие Chertogs.

## 6. Active V2 inventory by role

### Direct / direct-derived / direct-symbol

- Жива — Дева female;
- Макошь — Лебедь female;
- Семаргл — Змей both;
- Колядник — Ворон male Ozon;
- Печать Велеса / Медвежья лапа — Медведь both;
- Велес — Волк both;
- Мара — Лиса both;
- Звезда Лады — Лось female;
- Перун — Орёл both;
- Даждьбог — Раса both.

### Sales-weighted curated active

- Сварог — Дева male; Конь male;
- Алатырь — Вепрь both; Ворон female; Ворон male WB; Финист both;
- Родимич — Щука male; Лебедь male; Лось male;
- Звезда Лады — Щука female; Бусел female;
- Молвинец — Бусел male;
- Чур — Тур both;
- Жива — Конь female.

## 7. Removed from automatic V2

These products remain sellable assortment but no longer appear automatically:

- Белобог;
- Всеславец;
- Боговник;
- Знич.

## 8. Reserve V2

Reserve SKU cannot enter automatic output without a new explicit policy/audit decision:

- Чернобог;
- Триглав;
- Ратиборец;
- Громовик;
- Стрибог;
- Хорс.

High sales alone are not sufficient if no natural Chertog explanation has been approved.

## 9. Hard validation rules

- exactly one effective product per `chertog + gender + marketplace`;
- `Даждьбог` appears only in `Раса`, exactly two base gender rows;
- `bear_paw` appears only in `Медведь`;
- `bear_paw + Волк = FORBIDDEN`;
- `Сварог + female = FORBIDDEN` in V2;
- `Жива`, `Макошь`, `Звезда Лады` cannot be issued to male rows;
- `Родимич`, `Колядник` cannot be issued to female rows;
- reserve SKU never auto-appear;
- marketplace override must be explicitly listed in `RECOMMENDATION_MATRIX.md`.

Decision marker:

```text
KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED_APPROVED
```
