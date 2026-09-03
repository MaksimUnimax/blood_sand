# ADR-0002 — Separate Commercial Control Plane from Seller Data Plane

Date: 2026-09-03  
Status: Accepted

## Context

The product needs central licensing/configuration while its current value and privacy model depend on the extension talking directly to Ozon and the user's AI.

## Decision

The commercial server is a control plane. Ozon credentials and normal raw seller payloads remain in the browser/extension data plane.

The server owns account/device/subscription/entitlement/configuration/health/diagnostic metadata but does not become the default Ozon proxy or analytics cloud.

## Security corollary

Remote server policy may restrict packaged client capabilities but cannot expand them. The extension retains local trusted-host/method/operation/auth validation.

## Consequences

- low marginal infrastructure cost;
- smaller privacy/security blast radius;
- no server-side Ozon credential lifecycle at baseline;
- diagnostics must be metadata-first;
- future features requiring server-side seller data require a new ADR/privacy architecture, not accidental scope creep.
