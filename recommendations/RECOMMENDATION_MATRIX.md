# Матрица рекомендаций: Чертог × пол × marketplace → оберег

Статус: **V2 SALES-WEIGHTED — current authority**  
Matrix version: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Calendar version: `KIP_CHERTOG_CALENDAR_V1`  
Product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`  
Revision: **2026-08-31 owner update — Волк female → Алатырь; Змей female → Жива**

Подробное коммерческое обоснование и customer-copy: `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

## 1. Главный принцип V2

V2 даёт фактическим продажам высокий вес после отсечения явно неподходящих или визуально противоречивых вариантов.

Порядок решения:

1. отбросить явно чужие по смыслу товары;
2. сформировать небольшой набор вариантов, которые можно естественно объяснить клиенту;
3. среди приемлемых вариантов сильно учитывать реальные продажи;
4. учитывать пол и воспринимаемый характер символа;
5. если разница продаж невелика, более чистая смысловая связь имеет приоритет;
6. если прямой символ воспринимается слишком мужским для женской ветки, допускается owner-approved gender substitute с естественным объяснением;
7. не разносить bestseller по чужим Чертогам только ради продаж;
8. marketplace-specific результат разрешён только явным override.

Продажи, остатки, ranking и внутренние причины выбора клиенту не сообщаются.

## 2. Выдача

Каждый `Чертог × пол × marketplace` возвращает **ровно один товар**. Secondary recommendation в V2 нет.

## 3. Календарь `KIP_CHERTOG_CALENDAR_V1`

Граничный день принадлежит новому Чертогу. Год рождения на подбор не влияет. 29 февраля относится к Волку.

| Период | Чертог | Покровитель |
|---|---|---|
| 27.08–19.09 | Дева | Жива |
| 20.09–10.10 | Вепрь | Рамхат |
| 11.10–02.11 | Щука | Рожана |
| 03.11–23.11 | Лебедь | Макошь |
| 24.11–15.12 | Змей | Семаргл |
| 16.12–06.01 | Ворон | Коляда |
| 07.01–30.01 | Медведь | Сварог |
| 31.01–24.02 | Бусел | Род |
| 25.02–21.03 | Волк | Велес |
| 22.03–13.04 | Лиса | Марена |
| 14.04–05.05 | Тур | Крышень |
| 06.05–28.05 | Лось | Лада |
| 29.05–19.06 | Финист | Вышень |
| 20.06–12.07 | Конь | Купала |
| 13.07–03.08 | Орёл | Перун |
| 04.08–26.08 | Раса | Даждьбог |

## 4. Финальная клиентская матрица V2

| Чертог | Ozon: мужчина | Ozon: женщина | Wildberries: мужчина | Wildberries: женщина |
|---|---|---|---|---|
| Дева | **Сварог** | **Жива** | **Сварог** | **Жива** |
| Вепрь | **Алатырь** | **Алатырь** | **Алатырь** | **Алатырь** |
| Щука | **Родимич** | **Звезда Лады** | **Родимич** | **Звезда Лады** |
| Лебедь | **Родимич** | **Макошь** | **Родимич** | **Макошь** |
| Змей | **Семаргл** | **Жива** | **Семаргл** | **Жива** |
| Ворон | **Колядник** | **Алатырь** | **Алатырь** | **Алатырь** |
| Медведь | **Печать Велеса** | **Печать Велеса** | **Печать Велеса** | **Печать Велеса** |
| Бусел | **Родимич** | **Звезда Лады** | **Родимич** | **Звезда Лады** |
| Волк | **Велес** | **Алатырь** | **Велес** | **Алатырь** |
| Лиса | **Чернобог** | **Мара** | **Чернобог** | **Мара** |
| Тур | **Чур** | **Чур** | **Чур** | **Чур** |
| Лось | **Родимич** | **Звезда Лады** | **Родимич** | **Звезда Лады** |
| Финист | **Алатырь** | **Алатырь** | **Алатырь** | **Алатырь** |
| Конь | **Сварог** | **Жива** | **Сварог** | **Жива** |
| Орёл | **Перун** | **Звезда Лады** | **Перун** | **Звезда Лады** |
| Раса | **Даждьбог** | **Даждьбог** | **Даждьбог** | **Даждьбог** |

## 5. Marketplace override

Единственное marketplace-различие:

```text
Ворон + мужчина:
Ozon         → Колядник
Wildberries  → Алатырь
```

Все остальные строки совпадают между Ozon и Wildberries.

## 6. Owner-locked правила

### 6.1. Даждьбог

```text
Раса + мужчина → Даждьбог
Раса + женщина → Даждьбог
```

Даждьбог больше нигде автоматически не используется.

### 6.2. Медведь и Печать Велеса

```text
Медведь + мужчина → Печать Велеса
Медведь + женщина → Печать Велеса
```

Customer-facing название всегда ровно `Печать Велеса`, без второго имени, alias, скобок или пояснения через тире.

Конкретный SKU визуально относится к образу Медведя, поэтому `Печать Велеса` запрещена для Волка, Орла и любого другого Чертога.

### 6.3. Сварог

Сварог трактуется как мужской и используется только:

```text
Дева + мужчина → Сварог
Конь + мужчина → Сварог
```

### 6.4. Лиса

```text
Лиса + мужчина → Чернобог
Лиса + женщина → Мара
```

Чернобог выбран для мужской ветки по gender fit и естественной линии стойкости, перемен и преодоления трудных периодов.

### 6.5. Орёл

```text
Орёл + мужчина → Перун
Орёл + женщина → Звезда Лады
```

Перун остаётся прямым мужским выбором. Для женщины используется Звезда Лады как женский вариант с хорошим commercial signal и естественной связью через женскую силу, ответственность за близких, семейную защиту и сохранение опоры.

### 6.6. Бусел

```text
Бусел + мужчина → Родимич
Бусел + женщина → Звезда Лады
```

Для мужской ветки `Родимич` восстановлен вместо `Молвинца`. Покровитель Чертога Бусла — Род, а Родимич естественно продолжает именно родовую линию: память предков, преемственность поколений и ответственность перед семьёй.

### 6.7. Волк

```text
Волк + мужчина → Велес
Волк + женщина → Алатырь
```

Велес остаётся прямым мужским выбором как покровитель Чертога Волка. Для женской ветки owner-approved `Алатырь`: он не воспринимается выраженно мужским и естественно продолжает темы Волка через внутренний центр, равновесие, самостоятельность и прочную внутреннюю опору. Коммерческий сигнал также сильный: исторический snapshot — Алатырь WB 69 / Ozon 83, Велес WB 66 / Ozon 48.

### 6.8. Змей

```text
Змей + мужчина → Семаргл
Змей + женщина → Жива
```

Семаргл остаётся прямым мужским выбором как покровитель Чертога Змея. Для женской ветки owner-approved `Жива`: она сохраняет ключевую линию жизненной силы и энергии, но воспринимается как более естественный женский символ. Это gender-fit решение, а не sales uplift: исторический snapshot — Семаргл WB 16 / Ozon 7, Жива WB 9 / Ozon 7.

## 7. Нормализованные типы связи

`relation_type`:

- `DIRECT_PATRON`;
- `DIRECT_DERIVED`;
- `DIRECT_CHERTOG_SYMBOL`;
- `CURATED_GENDER_SUBSTITUTE`;
- `CURATED_MEANING_SUBSTITUTE`.

`selection_basis`:

- `SEMANTIC_DIRECT`;
- `SEMANTIC_DIRECT_SALES_PRIORITIZED`;
- `SEMANTIC_CURATED_SALES_WEIGHTED`;
- `SEMANTIC_CURATED_GENDER_FIT`;
- `MARKETPLACE_OVERRIDE_SALES_WEIGHTED`.

## 8. Машинная base-матрица

| chertog | gender | product_identity | relation_type | selection_basis |
|---|---|---|---|---|
| deva | male | Сварог | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| deva | female | Жива | DIRECT_PATRON | SEMANTIC_DIRECT |
| vepr | male | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| vepr | female | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| shchuka | male | Родимич | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| shchuka | female | Звезда Лады | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| lebed | male | Родимич | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| lebed | female | Макошь | DIRECT_PATRON | SEMANTIC_DIRECT |
| zmei | male | Семаргл | DIRECT_PATRON | SEMANTIC_DIRECT |
| zmei | female | Жива | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_GENDER_FIT |
| voron | male | Колядник | DIRECT_DERIVED | SEMANTIC_DIRECT |
| voron | female | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| medved | male | Печать Велеса | DIRECT_CHERTOG_SYMBOL | SEMANTIC_DIRECT_SALES_PRIORITIZED |
| medved | female | Печать Велеса | DIRECT_CHERTOG_SYMBOL | SEMANTIC_DIRECT_SALES_PRIORITIZED |
| busel | male | Родимич | DIRECT_DERIVED | SEMANTIC_DIRECT |
| busel | female | Звезда Лады | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| volk | male | Велес | DIRECT_PATRON | SEMANTIC_DIRECT |
| volk | female | Алатырь | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_GENDER_FIT |
| lisa | male | Чернобог | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_GENDER_FIT |
| lisa | female | Мара | DIRECT_DERIVED | SEMANTIC_DIRECT |
| tur | male | Чур | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| tur | female | Чур | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| los | male | Родимич | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| los | female | Звезда Лады | DIRECT_DERIVED | SEMANTIC_DIRECT |
| finist | male | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| finist | female | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| kon | male | Сварог | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| kon | female | Жива | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| orel | male | Перун | DIRECT_PATRON | SEMANTIC_DIRECT |
| orel | female | Звезда Лады | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| rasa | male | Даждьбог | DIRECT_PATRON | SEMANTIC_DIRECT |
| rasa | female | Даждьбог | DIRECT_PATRON | SEMANTIC_DIRECT |

Marketplace override:

| marketplace | chertog | gender | base_identity | effective_identity | relation_type | selection_basis |
|---|---|---|---|---|---|---|
| wildberries | voron | male | Колядник | Алатырь | CURATED_MEANING_SUBSTITUTE | MARKETPLACE_OVERRIDE_SALES_WEIGHTED |

## 9. Changed rows relative to previous revision

| Case | Previous | Current |
|---|---|---|
| Волк female | Велес | **Алатырь** |
| Змей female | Семаргл | **Жива** |
| Бусел male | Молвинец | **Родимич** |
| Орёл female | Перун | **Звезда Лады** |
| Лиса male | Мара | **Чернобог** |
| Медведь customer label | extended label | **Печать Велеса** |

## 10. Automatic / reserve inventory

Removed/inactive automatic:

- Белобог;
- Всеславец;
- Боговник;
- Знич.

Reserve:

- Молвинец;
- Триглав;
- Ратиборец;
- Громовик;
- Стрибог;
- Хорс.

Чернобог active только для `Лиса + мужчина`.

## 11. V2 invariants

- 16 Чертогов × 2 пола = 32 base rows;
- один effective product на case;
- Даждьбог = ровно две строки, обе Раса;
- Печать Велеса = только Медведь, оба пола;
- customer-facing label этого SKU = ровно `Печать Велеса`;
- Волк male = Велес; female = Алатырь;
- Змей male = Семаргл; female = Жива;
- Лиса male = Чернобог; female = Мара;
- Орёл male = Перун; female = Звезда Лады;
- Бусел male = Родимич; female = Звезда Лады;
- Сварог не используется для женщин;
- Молвинец не используется автоматически;
- reserve SKU не попадают в automatic output без нового owner decision.

Decision marker:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
