# Матрица рекомендаций: Чертог × пол × marketplace → оберег

Статус: **V2 SALES-WEIGHTED — current authority**  
Matrix version: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Calendar version: `KIP_CHERTOG_CALENDAR_V1`  
Product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`

Подробное коммерческое обоснование и customer-copy для всех замен: `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

## 1. Главный принцип V2

V2 сознательно даёт продажам существенно больший вес, чем V1.

Алгоритм принятия продуктового решения:

1. явно неподходящие по смыслу или визуально противоречивые товары отбрасываются;
2. формируется небольшой набор вариантов, которые можно естественно объяснить клиенту через темы Чертога;
3. **среди приемлемых вариантов продажи являются сильным фактором выбора**;
4. сильный продаваемый товар может заменить слабый curated-товар, если клиентское объяснение остаётся естественным;
5. direct-отношение не является абсолютным коммерческим запретом на замену, если другой вариант имеет самостоятельную сильную связь с Чертогом — пример: Медведь → Печать Велеса / медвежья лапа;
6. нельзя разносить bestseller по семантически чужим Чертогам только ради продаж;
7. marketplace-specific override разрешён только явно утверждённой строкой.

Клиенту продажи, остатки, внутренний ranking и причина коммерческой оптимизации **не сообщаются**.

## 2. Выдача

В V2 каждый сценарий возвращает **ровно один оберег**.

- `primary` — единственный результат;
- `secondary` в V2 отсутствует;
- 2 и более товара в автоматической выдаче запрещены.

Это отменяет V1-исключение `Медведь + мужчина → Сварог + Медвежья лапа`.

## 3. Календарная конвенция `KIP_CHERTOG_CALENDAR_V1`

Граничный день принадлежит **новому** Чертогу. Например, 19.09 — Дева, 20.09 — Вепрь.

| Период | Чертог | Покровитель в продуктовой конвенции |
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

Год рождения не используется. 29 февраля относится к Чертогу Волка.

## 4. Финальная клиентская матрица V2

| Чертог | Ozon: мужчина | Ozon: женщина | Wildberries: мужчина | Wildberries: женщина |
|---|---|---|---|---|
| Дева | **Сварог** | **Жива** | **Сварог** | **Жива** |
| Вепрь | **Алатырь** | **Алатырь** | **Алатырь** | **Алатырь** |
| Щука | **Родимич** | **Звезда Лады** | **Родимич** | **Звезда Лады** |
| Лебедь | **Родимич** | **Макошь** | **Родимич** | **Макошь** |
| Змей | **Семаргл** | **Семаргл** | **Семаргл** | **Семаргл** |
| Ворон | **Колядник** | **Алатырь** | **Алатырь** | **Алатырь** |
| Медведь | **Печать Велеса — Медвежья лапа** | **Печать Велеса — Медвежья лапа** | **Печать Велеса — Медвежья лапа** | **Печать Велеса — Медвежья лапа** |
| Бусел | **Молвинец** | **Звезда Лады** | **Молвинец** | **Звезда Лады** |
| Волк | **Велес** | **Велес** | **Велес** | **Велес** |
| Лиса | **Мара** | **Мара** | **Мара** | **Мара** |
| Тур | **Чур** | **Чур** | **Чур** | **Чур** |
| Лось | **Родимич** | **Звезда Лады** | **Родимич** | **Звезда Лады** |
| Финист | **Алатырь** | **Алатырь** | **Алатырь** | **Алатырь** |
| Конь | **Сварог** | **Жива** | **Сварог** | **Жива** |
| Орёл | **Перун** | **Перун** | **Перун** | **Перун** |
| Раса | **Даждьбог** | **Даждьбог** | **Даждьбог** | **Даждьбог** |

### Единственный marketplace override

В текущей V2 только одна строка меняется по marketplace:

```text
Ворон + мужчина:
Ozon         → Колядник
Wildberries  → Алатырь
```

Для всех остальных строк Ozon и Wildberries совпадают.

## 5. Owner-locked ограничения

### 5.1. Даждьбог

Даждьбог должен встречаться **ровно в двух** gender-cases:

```text
Раса + мужчина → Даждьбог
Раса + женщина → Даждьбог
```

Никаких других автоматических строк с Даждьбогом в V2 нет.

### 5.2. Медведь

Для Медведя оставляется **только Печать Велеса — Медвежья лапа**:

```text
Медведь + мужчина → Печать Велеса — Медвежья лапа
Медведь + женщина → Печать Велеса — Медвежья лапа
```

Сварог для Медведя из V2 удалён полностью.

### 5.3. Волк и визуальная форма Печати Велеса

Конкретный продаваемый SKU `Печать Велеса` выполнен в форме **медвежьей лапы**. Поэтому он не используется для Чертога Волка, даже несмотря на слово `Велеса` в marketplace-названии.

```text
Медведь → Печать Велеса — Медвежья лапа
Волк    → Велес
```

`bear_paw` для `volk` и для любого другого Чертога, кроме Медведя, = `FORBIDDEN`.

### 5.4. Сварог

В V2 Сварог считается мужским по характеру и используется только:

```text
Дева + мужчина → Сварог
Конь + мужчина → Сварог
```

## 6. Нормализованные типы связи

Semantic relation и коммерческий selection basis — разные поля.

Допустимые `relation_type`:

- `DIRECT_PATRON` — совпадает с покровителем;
- `DIRECT_DERIVED` — близкое производное покровителя;
- `DIRECT_CHERTOG_SYMBOL` — прямой символ/тотем Чертога;
- `CURATED_GENDER_SUBSTITUTE` — гендерно ориентированная смысловая замена;
- `CURATED_MEANING_SUBSTITUTE` — смысловая curated-замена.

Допустимые `selection_basis` V2:

- `SEMANTIC_DIRECT`;
- `SEMANTIC_DIRECT_SALES_PRIORITIZED`;
- `SEMANTIC_CURATED_SALES_WEIGHTED`;
- `MARKETPLACE_OVERRIDE_SALES_WEIGHTED`.

Продажи никогда не меняют `relation_type`; они объясняют, почему из нескольких допустимых semantic candidates выбран именно этот.

## 7. Машинная форма — base + override

Base-матрица соответствует Ozon/default semantic case. Wildberries применяет один утверждённый override.

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
| zmei | female | Семаргл | DIRECT_PATRON | SEMANTIC_DIRECT |
| voron | male | Колядник | DIRECT_DERIVED | SEMANTIC_DIRECT |
| voron | female | Алатырь | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| medved | male | Медвежья лапа | DIRECT_CHERTOG_SYMBOL | SEMANTIC_DIRECT_SALES_PRIORITIZED |
| medved | female | Медвежья лапа | DIRECT_CHERTOG_SYMBOL | SEMANTIC_DIRECT_SALES_PRIORITIZED |
| busel | male | Молвинец | CURATED_MEANING_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| busel | female | Звезда Лады | CURATED_GENDER_SUBSTITUTE | SEMANTIC_CURATED_SALES_WEIGHTED |
| volk | male | Велес | DIRECT_PATRON | SEMANTIC_DIRECT |
| volk | female | Велес | DIRECT_PATRON | SEMANTIC_DIRECT |
| lisa | male | Мара | DIRECT_DERIVED | SEMANTIC_DIRECT |
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
| orel | female | Перун | DIRECT_PATRON | SEMANTIC_DIRECT |
| rasa | male | Даждьбог | DIRECT_PATRON | SEMANTIC_DIRECT |
| rasa | female | Даждьбог | DIRECT_PATRON | SEMANTIC_DIRECT |

Marketplace override:

| marketplace | chertog | gender | base_identity | effective_identity | relation_type | selection_basis |
|---|---|---|---|---|---|---|
| wildberries | voron | male | Колядник | Алатырь | CURATED_MEANING_SUBSTITUTE | MARKETPLACE_OVERRIDE_SALES_WEIGHTED |

## 8. V1 → V2 changed rows

| Case | V1 | V2 |
|---|---|---|
| Дева male | Даждьбог | Сварог |
| Щука female | Макошь | Звезда Лады |
| Лебедь male | Всеславец | Родимич |
| Ворон female | Белобог | Алатырь |
| Ворон male WB | Даждьбог override | Алатырь override |
| Медведь male | Сварог + Медвежья лапа | Печать Велеса — Медвежья лапа only |
| Медведь female | Сварог | Печать Велеса — Медвежья лапа |
| Бусел male | Родимич | Молвинец |
| Лось male | Всеславец | Родимич |
| Финист male | Боговник | Алатырь |
| Финист female | Боговник | Алатырь |
| Конь male | Знич | Сварог |

## 9. Автоматически не используемые позиции V2

Removed from automatic matrix:

- Белобог;
- Всеславец;
- Боговник;
- Знич.

Reserve remains reserve:

- Чернобог;
- Триглав;
- Ратиборец;
- Громовик;
- Стрибог;
- Хорс.

## 10. Клиентский текст

Точный customer-copy для каждой изменённой строки зафиксирован в:

- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
- `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

Клиенту нельзя говорить:

- что выбранный товар продаётся лучше;
- что другой товар продаётся хуже;
- что чего-то нет в ассортименте, наличии, карточках или ссылках;
- что алгоритм сделал substitution из-за продаж;
- внутренние термины `matrix`, `fallback`, `selection_basis`, `relation_type`.

## 11. V2 invariants

- 16 Чертогов × 2 пола = 32 base primary-case;
- для каждого marketplace эффективный результат всегда один;
- Даждьбог = ровно 2 base rows, обе Раса;
- Печать Велеса / Медвежья лапа = только Медведь, оба пола;
- Печать Велеса / Медвежья лапа никогда не используется для Волка;
- Волк = Велес для обоих полов и обоих marketplaces;
- Сварог не используется для женщин в V2;
- marketplace override не может появиться без отдельной явной записи;
- reserve SKU не могут попасть в automatic output без изменения product policy и audit.

Decision marker:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
