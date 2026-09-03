# ADR-0003 — Browser Family Is an Independent Product Dimension

Date: 2026-09-03  
Status: Accepted

## Context

Chrome is likely the first commercial acceptance target, followed by Yandex Browser. The order can change and must not force a product rewrite.

## Decision

Model browser family explicitly in client metadata, compatibility policy, adapter/profile compatibility and health matrix.

Chrome-first is a roadmap priority only.

Browser-specific behavior belongs behind client/health `BrowserDriver` or capability abstractions. Account, billing, subscription, entitlement and AI registry logic remains browser-independent.

## Consequences

- Yandex Browser can be added as `yandex_chromium` without forking the product;
- health results can differ by browser;
- one browser failure does not automatically disable another;
- future Chromium browsers can reuse the same contract if justified.
