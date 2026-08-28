# Классификация славянских оберегов для рекомендательной системы

Статус: **V2 SALES-WEIGHTED — current authority**  
Product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Revision: **2026-08-28 owner update**

Источник ассортимента: нормализованный Ozon/Wildberries ассортимент проекта `blood_sand`. В семейство `slavic_symbols_oberegs` входят 25 SKU.

## 1. Принципы V2

1. Классификация — продуктовая curated-политика, а не утверждение о доказанной древней системе.
2. Продажи имеют высокий вес после отсечения явно неподходящих вариантов.
3. Пол и воспринимаемый характер символа могут менять активную строку.
4. Каждый `Чертог × пол × marketplace` возвращает один товар.
5. Customer-facing copy не раскрывает продажи, ranking, остатки или внутренние причины выбора.

## 2. Gender policy V2

Допустимые значения:

- `male` — только мужчина;
- `female` — только женщина;
- `any` — оба пола.

Owner decisions:

- `Сварог` → `male`;
- `Печать Велеса` → `any`, но только для Медведя;
- `Чернобог` → `male`, active только для Лисы-мужчины;
- `Мара` → `female`, active только для Лисы-женщины;
- `Жива`, `Макошь`, `Звезда Лады` → `female`;
- `Родимич`, `Колядник` → `male`;
- `Перун`, `Алатырь`, `Велес`, `Чур`, `Семаргл`, `Даждьбог`, `Молвинец` → `any` на уровне товара.

## 3. Полная классификация 25 SKU

| SKU / товар | recommendation identity | gender_policy | Роль в V2 | Автоматические Чертоги V2 | Комментарий |
|---|---|---|---|---|---|
| Белобог | Белобог | any | inactive_auto / reserve | — | Удалён из automatic V2 |
| Чернобог | Чернобог | male | active_gender_curated | Лиса / мужчина | Owner-approved мужская замена Мары; стойкость, перемены, преодоление |
| Велес | Велес | any | direct | Волк / оба | Прямой покровитель Волка |
| Печать Велеса | Печать Велеса | any | direct_symbol / core_bestseller | Медведь / оба | Customer label всегда ровно «Печать Велеса»; только Медведь |
| Алатырь (Крест Сварога) | Алатырь | any | sales_weighted_fallback | Вепрь / оба; Ворон / female; Ворон / male WB; Финист / оба | Один из главных commercial SKU V2 |
| Триглав | Триглав | any | reserve | — | Automatic row не утверждён |
| Ратиборец | Ратиборец | male | reserve | — | Automatic row не утверждён |
| Молвинец | Молвинец | any | sales_weighted_fallback | Бусел / мужчина | Active V2 |
| Колядник | Колядник | male | direct_derived | Ворон / мужчина / Ozon | Производное соответствие линии Коляды |
| Знич | Знич | male | inactive_auto / reserve | — | Удалён из Коня |
| Громовик | Громовик | male | reserve | — | Automatic row не утверждён |
| Всеславец | Всеславец | male | inactive_auto / reserve | — | Удалён из Лебедя и Лося |
| Боговник | Боговник | any | inactive_auto / reserve | — | Удалён из Финиста |
| Родимич | Родимич | male | sales_weighted_fallback | Щука / мужчина; Лебедь / мужчина; Лось / мужчина | Активная мужская родовая линия |
| Жива | Жива | female | direct/fallback | Дева / женщина; Конь / женщина | Прямая Дева; жизненная линия Коня |
| Сварог | Сварог | male | sales_weighted_fallback | Дева / мужчина; Конь / мужчина | Не выдаётся Медведю |
| Перун | Перун | any | direct | Орёл / оба | Прямой покровитель Орла |
| Стрибог | Стрибог | any | reserve | — | Automatic row не утверждён |
| Макошь | Макошь | female | direct | Лебедь / женщина | Прямой покровитель Лебедя |
| Семаргл | Семаргл | any | direct | Змей / оба | Прямой покровитель Змея |
| Хорс | Хорс | any | reserve | — | Automatic row не утверждён |
| Мара | Мара | female | direct_derived | Лиса / женщина | Женская ветка Лисы; мужчина переведён на Чернобога |
| Звезда Лады | Звезда Лады | female | direct_derived / sales_weighted_fallback | Щука / женщина; Бусел / женщина; Лось / женщина | Активная женская семейная линия |
| Даждьбог | Даждьбог | any | direct | Раса / оба | Только две base rows: Раса male + female |
| Чур | Чур | any | sales_weighted_fallback | Тур / оба | Сильный seller и приемлемая защитная линия |

## 4. Печать Велеса — critical customer naming rule

Marketplace name, recommendation identity и customer-facing label в V2 нормализуются к одному имени:

```text
Печать Велеса
```

В готовом клиентском ответе запрещено добавлять к этому названию любые aliases, вторые названия, пояснения через тире или скобки.

Внутренний технический ключ может оставаться `bear_paw`, но он никогда не рендерится клиенту.

Разрешено:

```text
Медведь + male   → Печать Велеса
Медведь + female → Печать Велеса
```

Запрещено:

```text
Волк → Печать Велеса
любой другой Чертог → Печать Велеса
```

Для Волка используется отдельный товар `Велес`.

## 5. Лиса — gender split

```text
Лиса + мужчина → Чернобог
Лиса + женщина → Мара
```

Чернобог повышен из reserve в active V2. Причина решения — более мужской характер относительно Мары и естественная смысловая линия стойкости, перемен и преодоления сложных периодов.

Мара теперь `female` и остаётся direct-derived женской веткой Лисы.

## 6. Даждьбог — owner-locked cap

Automatic V2:

```text
Раса + мужчина → Даждьбог
Раса + женщина → Даждьбог
```

Других строк с Даждьбогом нет.

## 7. Active V2 inventory by role

### Direct / direct-derived / direct-symbol

- Жива — Дева female;
- Макошь — Лебедь female;
- Семаргл — Змей both;
- Колядник — Ворон male Ozon;
- Печать Велеса — Медведь both;
- Велес — Волк both;
- Мара — Лиса female;
- Звезда Лады — Лось female;
- Перун — Орёл both;
- Даждьбог — Раса both.

### Curated / sales-weighted active

- Чернобог — Лиса male;
- Сварог — Дева male; Конь male;
- Алатырь — Вепрь both; Ворон female; Ворон male WB; Финист both;
- Родимич — Щука male; Лебедь male; Лось male;
- Звезда Лады — Щука female; Бусел female;
- Молвинец — Бусел male;
- Чур — Тур both;
- Жива — Конь female.

## 8. Removed / reserve V2

Inactive automatic:

- Белобог;
- Всеславец;
- Боговник;
- Знич.

Reserve:

- Триглав;
- Ратиборец;
- Громовик;
- Стрибог;
- Хорс.

Чернобог больше не reserve.

## 9. Hard validation rules

- exactly one effective product per `chertog + gender + marketplace`;
- Даждьбог только Раса, ровно две base rows;
- `bear_paw` только Медведь;
- customer-facing label `bear_paw` product = ровно `Печать Велеса`;
- Печать Велеса + Волк = FORBIDDEN;
- Сварог + female = FORBIDDEN;
- Чернобог + female = FORBIDDEN;
- Мара + male = FORBIDDEN;
- Жива, Макошь, Звезда Лады не выдаются мужчинам;
- Родимич, Колядник не выдаются женщинам;
- reserve SKU не появляются автоматически без нового owner decision.

Decision marker:

```text
KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED_APPROVED
```