# ТЗ — система рекомендаций славянских оберегов по дате рождения

Статус: **SUPERSEDED_BY_V2**  
Original version: 0.1 / V1  
Superseded: 2026-08-29

Этот документ был исходным V1-ТЗ и больше **не является текущим источником бизнес-логики**. Его прежние положения сохранены в Git history.

## Current authority

Использовать только актуальные V2-документы:

1. `RECOMMENDATION_MATRIX.md` — текущая матрица;
2. `PRODUCT_CLASSIFICATION.md` — current gender/product policy;
3. `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md` — продажи и обоснование owner-approved замен;
4. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — обязательный клиентский текст;
5. `DATA_API_CONTRACT.md` — current domain/API contract;
6. `ARCHITECTURE.md` — current V2 architecture.

## Retired V1 assumptions

Следующие положения старого ТЗ больше не действуют:

- максимум два результата и secondary recommendation;
- `Медведь + мужчина → Сварог + второй товар`;
- `Медведь + женщина → Сварог`;
- запрет учитывать реальные продажи при утверждении матрицы;
- V1 gender assumptions для ряда товаров;
- старые строки Щуки, Лебедя, Ворона, Лисы, Финиста, Коня и других Чертогов;
- старое marketplace-independent правило без explicit override;
- вывод даты без обязательного сохранения указанного года.

## Current V2 core invariants

- 16 Чертогов × 2 пола = 32 base rows;
- каждый case возвращает ровно один товар;
- продажи сильно учитываются **офлайн при owner approval**, но не являются live runtime input;
- `Даждьбог` используется только для Раса male + female;
- `Печать Велеса` используется только для Медведя male + female и customer-facing всегда называется ровно `Печать Велеса`;
- Волк получает `Велес`;
- Лиса: male → `Чернобог`, female → `Мара`;
- Орёл: male → `Перун`, female → `Звезда Лады`;
- Сварог не используется в female rows;
- current marketplace override: Ворон male — Ozon `Колядник`, Wildberries `Алатырь`.

## Birth-date rendering rule

Год рождения **не влияет на Чертог и выбор товара**, но если покупатель указал полную дату рождения, год нельзя терять в готовом ответе.

```text
Input: 19.11.1988
Correct: "Дата 19.11.1988 относится к Чертогу Лебедя."
Forbidden: "Дата 19.11 относится к Чертогу Лебедя."
```

Если год не указан, его не придумывать.

## Current decision marker

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
