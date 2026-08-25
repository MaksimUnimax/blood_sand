# Ozon Seller API coverage — frozen 2026-08-25

This directory is the source of truth for the 2026-08-25 Seller API read-surface coverage milestone.

## Frozen inputs

- live `POST /v1/roles` from the configured Seller credentials: **303 unique permitted paths**;
- current Ozon Seller OpenAPI source: `https://docs.ozon.ru/api/seller/swagger.json`;
- pinned current snapshot used for this review: `MissiaL/ozon-api@1953152c36955225b459cf55963a2c3a7a234661`, **463 operations / 57 sections**;
- exact Bridge production baseline: `fix/ozon-work-resume-provider-status-separation-2026-08-24@9ebc673c2e0dd9dc24f6cbab90455396328f0aad`.

No Seller credentials, API-key value, Client-Id, account identifiers, or key-expiry value are stored in these documents.

## Frozen result

- permitted by current key: **303** paths;
- target AI-callable read surface: **231** paths;
  - already enabled in Bridge: **8**;
  - new read methods/workflows to implement: **223**;
- not directly exposed to AI: **72** paths;
  - old/deprecated/removed addresses: **62**;
  - changes Ozon data/state: **8**;
  - causes an external side effect rather than a pure read: **1**;
  - internal-only provider capability route: **1**.

## Documents

- `OZON_KEY_PERMITTED_PATHS_2026-08-25.txt` — all 303 unique paths exactly as observed from the live key roles, deduplicated.
- `OZON_TARGET_AI_CALLABLE_READ_SURFACE_2026-08-25.md` — all 231 target AI-callable read methods, grouped by guidance cluster and mapped to fixed symbolic aliases; marks personal-data, confidential-business, report/file-workflow and Premium-sensitive operations.
- `OZON_METHODS_NOT_EXPOSED_TO_AI_2026-08-25.md` — all 72 excluded/directly-unavailable paths with plain-language reasons and current replacements where known.
- `OZON_GUIDANCE_CLUSTER_TAXONOMY_V2_2026-08-25.json` — Guidance v2 cluster registry and compatibility rules.
- `../OZON_BRIDGE_COMPLETE_READ_SURFACE_IMPLEMENTATION_PLAN_2026-08-25.md` — phased production implementation, capability/Premium handling, privacy, files/reports, pagination/retry rules, testing and change control.

## Policy

A path being returned by `/v1/roles` does **not** by itself make it safe for a read-only AI bridge. The current Ozon OpenAPI contract and operation purpose are checked as well. Methods that modify stocks, supply state, cargo bindings or pricing strategy state remain unavailable even when Ozon places them inside a role whose name contains `read-only`.

Conversely, a read-only method is not discarded merely because it can return personal or confidential business data. Such methods are planned with safe default projection and explicit user-controlled access modes; assistant text cannot enable those modes.

Report/label creation operations are allowed only when their documented purpose is to generate a read-only export/file from existing data. They remain explicit one-request workflow steps; there is no hidden polling, pagination loop or retry.

## Change control

This snapshot is intentionally frozen so implementation does not repeatedly re-filter endpoints. Reclassification requires a dated coverage delta caused by a new official Ozon API contract, changed `/v1/roles`, an explicit product-scope change, or a demonstrated security/privacy side effect.
