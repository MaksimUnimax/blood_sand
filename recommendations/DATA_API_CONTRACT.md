# Data & API Contract — система рекомендаций

Версия: 0.1  
Статус: проект до реализации

## 1. Назначение

Зафиксировать машинные контракты, которые связывают:

- versioned recommendation data;
- Recommendation Core;
- VK Bot Adapter;
- VK Mini App;
- будущий product availability/destination layer.

Документ не меняет бизнес-матрицу из `RECOMMENDATION_MATRIX.md`.

## 2. Version identifiers

```text
calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V1
matrix_version = KIP_RECOMMENDATION_MATRIX_V1
copy_version = KIP_REASON_COPY_V1
api_version = v1
```

Каждый recommendation response обязан возвращать версии, использованные для решения.

## 3. Machine-readable configuration

### 3.1. `chertog_calendar.v1.json`

Пример записи:

```json
{
  "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
  "entries": [
    {
      "chertog_id": "rasa",
      "chertog_name": "Раса",
      "patron_name": "Даждьбог",
      "start": { "month": 8, "day": 4 },
      "end": { "month": 8, "day": 26 }
    }
  ]
}
```

Инварианты:

- ровно 16 Чертогов;
- все валидные `MM-DD` покрыты ровно один раз;
- 29.02 покрывается Волком;
- диапазоны могут пересекать границу года;
- gaps и overlaps запрещены.

### 3.2. `product_policy.v1.json`

Пример:

```json
{
  "product_policy_version": "KIP_PRODUCT_POLICY_V1",
  "products": [
    {
      "product_key": "bear_paw",
      "product_id": "1119965443",
      "sku": "1636048691",
      "marketplace_name": "Печать Велеса",
      "recommendation_identity": "Медвежья лапа",
      "gender_policy": "male",
      "active_for_recommendation": true
    }
  ]
}
```

`product_key` — стабильный внутренний ключ. UI-name и marketplace-name могут меняться без смены ключа.

Допустимые `gender_policy`:

```text
male
female
any
any_male_coded
```

### 3.3. `recommendation_matrix.v1.json`

Пример:

```json
{
  "matrix_version": "KIP_RECOMMENDATION_MATRIX_V1",
  "entries": [
    {
      "chertog_id": "medved",
      "gender": "male",
      "rank": 1,
      "product_key": "svarog",
      "relation_type": "DIRECT_PATRON",
      "reason_code": "PATRON_EXACT",
      "active": true
    },
    {
      "chertog_id": "medved",
      "gender": "male",
      "rank": 2,
      "product_key": "bear_paw",
      "relation_type": "DIRECT_CHERTOG_SYMBOL",
      "reason_code": "CHERTOG_SYMBOL_EXACT",
      "active": true
    }
  ]
}
```

Инварианты:

- для каждого `16 × 2 = 32` сочетания есть rank=1;
- rank может быть только 1 или 2;
- rank=2 разрешён только явно внесённой строкой;
- на момент V1 rank=2 есть только `medved + male`;
- product_key обязан существовать в product policy;
- gender policy товара не может конфликтовать со строкой матрицы;
- `bear_paw` запрещён для `volk`.

### 3.4. `reason_copy.v1.json`

Recommendation matrix не хранит длинный клиентский текст.

Пример:

```json
{
  "copy_version": "KIP_REASON_COPY_V1",
  "templates": {
    "PATRON_EXACT": {
      "short": "Эта дата относится к Чертогу {chertog_name}, покровителем которого считается {patron_name}."
    }
  }
}
```

Финальные тексты будут утверждены отдельно.

## 4. Domain request

```ts
type ResolveRecommendationInput = {
  birthDay: number;
  birthMonth: number;
  gender: "male" | "female";
};
```

Год рождения в domain input не существует.

Парсер Bot Adapter может принять полный год, но обязан преобразовать его в `birthDay + birthMonth` до вызова core.

## 5. Domain response

```ts
type RecommendationResult = {
  calendarVersion: string;
  productPolicyVersion: string;
  matrixVersion: string;
  chertog: {
    id: string;
    name: string;
    patronName: string;
  };
  gender: "male" | "female";
  recommendations: Array<{
    rank: 1 | 2;
    productKey: string;
    productId: string;
    sku: string;
    recommendationIdentity: string;
    relationType:
      | "DIRECT_PATRON"
      | "DIRECT_DERIVED"
      | "DIRECT_CHERTOG_SYMBOL"
      | "CURATED_GENDER_SUBSTITUTE"
      | "CURATED_MEANING_SUBSTITUTE";
    reasonCode: string;
  }>;
};
```

`recommendations.length` обязана быть 1 или 2.

## 6. HTTP API

### 6.1. Resolve

```text
POST /v1/recommendations/resolve
Content-Type: application/json
```

Request:

```json
{
  "birth_day": 13,
  "birth_month": 8,
  "gender": "female",
  "channel": "vk_bot"
}
```

`channel` нужен только для telemetry и не имеет права менять результат.

Допустимые значения V1:

```text
vk_bot
vk_mini_app
internal_test
```

Success `200`:

```json
{
  "result_id": "opaque-generated-id",
  "versions": {
    "calendar": "KIP_CHERTOG_CALENDAR_V1",
    "product_policy": "KIP_PRODUCT_POLICY_V1",
    "matrix": "KIP_RECOMMENDATION_MATRIX_V1",
    "copy": "KIP_REASON_COPY_V1"
  },
  "input": {
    "birth_day": 13,
    "birth_month": 8,
    "gender": "female"
  },
  "chertog": {
    "id": "rasa",
    "name": "Раса",
    "patron_name": "Даждьбог"
  },
  "recommendations": [
    {
      "rank": 1,
      "product_key": "dazhdbog",
      "product_id": "1832435919",
      "sku": "2184932293",
      "recommendation_identity": "Даждьбог",
      "relation_type": "DIRECT_PATRON",
      "reason_code": "PATRON_EXACT",
      "availability": "UNKNOWN",
      "destination": null
    }
  ]
}
```

### 6.2. Error format

```json
{
  "error": {
    "code": "INVALID_DATE",
    "message": "Invalid birth day/month"
  }
}
```

HTTP mapping:

```text
400 INVALID_DATE
400 INVALID_GENDER
409 CONFIG_VERSION_MISMATCH
500 MATRIX_ENTRY_MISSING
500 PRODUCT_POLICY_MISSING
500 INTERNAL_ERROR
```

## 7. Availability overlay

Availability — отдельный post-processing adapter.

```ts
type Availability = "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
```

Важно:

```text
semantic recommendation
        ↓
availability enrichment
        ↓
UI
```

а не:

```text
availability
        ↓
пересчёт semantic recommendation
```

### V1 policy

- `AVAILABLE` → обычная карточка;
- `UNKNOWN` → обычная рекомендация без обещания наличия;
- `UNAVAILABLE` → рекомендация сохраняется, покупатель получает unavailable UX и действие `Написать продавцу`;
- автоматической замены нет.

## 8. Product destination contract

```ts
type ProductDestination = {
  productKey: string;
  vk?: {
    marketItemId?: string;
    marketUrl?: string;
  };
  communityMessage?: {
    enabled: boolean;
  };
  external?: {
    ozonUrl?: string;
    wbUrl?: string;
  };
};
```

Destination не должен быть частью matrix rank.

## 9. Bot session contract

```ts
type BotSession = {
  peerId: string;
  state: "WAITING_DATE" | "WAITING_GENDER" | "RESOLVED" | "HUMAN_HANDOFF";
  birthDay?: number;
  birthMonth?: number;
  gender?: "male" | "female";
  lastResultId?: string;
  updatedAt: string;
  expiresAt: string;
};
```

Нельзя хранить client answer как единственную source-of-truth для будущего повторного показа. `lastResultId` и версии результата позволяют восстановить, что именно было показано.

## 10. Idempotency

### Bot inbound

Каждое входное VK-событие должно иметь deduplication key.

Повторное получение одного события не должно:

- дважды отправлять ответ;
- дважды создавать analytics event;
- дважды менять state.

### Resolve API

Сам resolve stateless и детерминирован. Клиент может повторить запрос безопасно.

## 11. Analytics contract

Event envelope:

```json
{
  "event_name": "recommendation_result_shown",
  "event_time": "2026-08-27T10:00:00Z",
  "channel": "vk_bot",
  "anonymous_session_id": "...",
  "result_id": "...",
  "chertog_id": "rasa",
  "gender": "female",
  "product_keys": ["dazhdbog"],
  "matrix_version": "KIP_RECOMMENDATION_MATRIX_V1"
}
```

Не писать в analytics payload:

- ФИО;
- год рождения;
- свободный текст пользователя без отдельной причины;
- лишние данные VK-профиля.

## 12. Configuration validation gates

CI обязан падать если:

1. календарь не покрывает год без gap/overlap;
2. нет одной из 32 обязательных primary-строк;
3. есть больше двух активных строк на `chertog + gender`;
4. есть неизвестный product_key;
5. gender policy конфликтует с matrix;
6. `bear_paw` попал в `volk`;
7. rank=2 существует вне approved exception;
8. duplicate `(chertog, gender, rank)`;
9. неизвестный `relation_type` или `reason_code`;
10. версия файла не совпадает с ожидаемой schema/version.

## 13. Contract tests

Минимальный набор:

```text
13.08 + male   → rasa / Даждьбог
13.08 + female → rasa / Даждьбог
13.10 + male   → shchuka / Родимич
13.10 + female → shchuka / Макошь
15.01 + male   → medved / Сварог + Медвежья лапа
15.01 + female → medved / Сварог
15.03 + male   → volk / Велес
15.03 + female → volk / Велес
19.09          → deva
20.09          → vepr
10.10          → vepr
11.10          → shchuka
26.08          → rasa
27.08          → deva
29.02          → volk
```

Каждый тест выполняется для domain core и через HTTP API.
