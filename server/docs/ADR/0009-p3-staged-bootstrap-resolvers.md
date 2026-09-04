# ADR-0009 — P3 Staged Bootstrap Resolvers

Date: 2026-09-04
Status: Accepted

## Decision

P3 owns client protocol compatibility, browser/extension compatibility, config
version, signed snapshots, expiry/offline-grace metadata, and later-P3
feature/rollout primitives.

P4 owns real plan entitlements. P5 owns the real subscription lifecycle. P7/P8
own real AI profile and health resolution. P3 must not fabricate future-stage
database rows.

The truthful pre-commercial snapshot baseline is:

```json
{"subscription":{"state":"NONE","planRevision":null},"entitlements":{},"features":{},"ai":{"status":"UNCONFIGURED"}}
```

`NONE` is a bootstrap absence state, not a persisted P5 FSM state. The future
subscription FSM remains `TRIAL`, `ACTIVE`, `GRACE`, `PAST_DUE`, `CANCELED`,
`EXPIRED`, and `SUSPENDED`. P3 creates neither fake active subscriptions nor
plans, entitlement rows, AI adapters, surfaces, profiles, or health state.

When P3.4 adds HTTP, request `deviceId` must equal the authenticated
access-token principal device ID; no caller-selected account ID is accepted.

## Consequences

P3.1 can freeze and test the protocol without creating P4/P5/P7/P8 persistence
or an HTTP route. Later stages may add explicitly typed AI variants and rollout
metadata without replacing this protocol family.
