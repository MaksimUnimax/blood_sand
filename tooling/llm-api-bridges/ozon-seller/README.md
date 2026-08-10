# Ozon Seller LLM Bridge

Статус: **read-only candidate 0.1.0; real seller-account acceptance pending**.

## Назначение

Локальный LLM↔Ozon Seller API bridge для controlled analytics/assortment collection без передачи `Client-Id`/`Api-Key` модели.

Командный протокол:

- `OZON_API_V1`
- `OZON_RESULT_V1`

Канонический общий lifecycle/security contract:

`../shared/LLM_API_BRIDGE_PROTOCOL.md`

## Текущие артефакты

- официальный capability audit: `OZON_API_CAPABILITY_AUDIT_2026-08-10.md`;
- machine-readable confirmed read allowlist: `OZON_READ_ONLY_ALLOWLIST_V1.json`;
- provider protocol core: `provider/ozon_protocol.js`;
- current acceptance evidence: `ACCEPTANCE_CANDIDATE_0.1.0.md`;
- installable tested candidate: `artifacts/ozon-bridge-v0.1.0-candidate.zip`.

Current tested ZIP SHA-256:

`c4bb7969de1d42782a074be0f014851ade2fd5ee146bd88baeb69c997bc4c015`

## Текущий acceptance status

Проверено в local/mock environment:

- read-only symbolic operation allowlist;
- one command → at most one external request;
- Manual exactly-once;
- two sequential Autorun operations;
- delivery back into ChatGPT mock;
- Pause / Resume / Finish;
- fresh ZIP extraction 14/14 byte-identical;
- full real Chromium MV3 lifecycle repeated from clean extracted ZIP.

Не проверено пока: реальные Ozon Seller credentials/account, account permissions, current real response schemas, rate limits/pagination and still-pending official API sections. Поэтому 03A.4 остаётся `[~]`.
