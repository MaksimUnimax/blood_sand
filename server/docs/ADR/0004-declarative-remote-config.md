# ADR-0004 — Remote Configuration Is Declarative and Non-Executable

Date: 2026-09-03  
Status: Accepted

## Context

AI websites change frequently. The product needs to update selectors/profiles without waiting for an extension-store release, but remote code would weaken security and browser-store compliance.

## Decision

The server distributes signed, versioned declarative adapter/profile configuration understood by packaged extension logic.

Allowed examples:

- selector strategies;
- semantic role/name strategies;
- packaged observation modes;
- bounded timeouts;
- packaged feature toggles;
- compatibility constraints.

Forbidden:

- JavaScript source/eval;
- remote modules/WASM intended as executable extension logic;
- arbitrary URL/method/header/auth instructions;
- new provider capabilities not packaged locally.

Published revisions are immutable, testable, stageable and rollbackable.

## Consequences

Most ordinary DOM selector drift can be repaired server-side. New interaction primitives still require an extension release.
