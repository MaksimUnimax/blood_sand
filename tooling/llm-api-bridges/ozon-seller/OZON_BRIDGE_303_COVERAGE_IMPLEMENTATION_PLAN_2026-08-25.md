# Ozon Bridge — 303-role implementation plan (SUPERSEDED)

Date: 2026-08-25  
Status: **SUPERSEDED AS IMPLEMENTATION AUTHORITY**

This document originally treated the current account's 303 `/v1/roles` grants as the target implementation surface. That is too narrow for the agreed full-read architecture because `/v1/roles` describes the methods granted to one current API key/account, while the Bridge must also implement safe current Seller API reads that may belong to other subscription/account states.

Use instead:

`OZON_BRIDGE_FULL_READ_DYNAMIC_ENTITLEMENTS_AND_CLUSTERS_SPEC_2026-08-25.md`

and the machine target:

`OZON_BRIDGE_TARGET_READ_SURFACE_2026-08-25.json` (`OZON_BRIDGE_TARGET_READ_SURFACE_V2`).

The 303-role files remain valid **account/key evidence** and retain value for regression/current-account comparison, but they no longer define the global read implementation universe.

## Fixed replacement decisions

- Global operation inventory comes from the complete current Ozon Seller Swagger/OpenAPI.
- `/v1/roles` is current API-key capability metadata only.
- `/v1/seller/info` remains the seller-subscription detector.
- Premium endpoint/feature rules are refreshable metadata compiled from current Ozon Swagger, not permanent hard-coded tier arrays.
- Entitlement rules use explicit allowed subscription sets, not a guessed numeric tier hierarchy.
- Unknown/stale entitlement is not guessed; an otherwise-safe exact request may reach Ozon.
- No silent removal of requested metrics/dimensions/sorts/history.
- One unified operation registry owns cluster, section, guidance, privacy, entitlement reference and workflow role.
- Guidance is generated from that registry; no separate static operation catalog.
- 12 Seller business clusters are used, with sections inside large clusters.
- Reports belong to their business clusters; generic report helpers live in hidden `_workflow` guidance scope.
- Old V1 cluster IDs remain compatibility aliases into the same registry-backed guidance engine.
- Mutation/write methods remain excluded.
- Raw PII-bearing reads remain excluded until positive safe projections exist.
- Autorun is outside this coverage work.

This file is retained only so old links do not silently point at obsolete design assumptions.