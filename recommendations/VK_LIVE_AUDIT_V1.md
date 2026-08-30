# VK durable live audit boundary (V1)

`LIVE_AUDIT_SCHEMA = V1`. Runtime audit is observability only: it is never
read for recommendation decisions, Mini App authentication, handoff validation,
session CAS, or outbox retry identity.

`RAW_OPEN_APP_CAPABILITY_AFTER_TERMINAL = SCRUBBED` and
`SAFE_OPEN_APP_AUDIT_AFTER_TERMINAL = RETAINED`. The retained summary is
allowlisted to keyboard presentation plus action type/label and, for
`open_app`, app id, owner id, and `hash_present`; it never contains hashes,
payloads, launch parameters, signatures, identities, bearers, or secrets.

`TRANSITION_FROM_TO_AUDIT = RETAINED`; rows use only an internal inbound row
id and before/after bot state/version. `AUDIT_CONTAINS_REAL_VK_IDENTITY = no`,
`AUDIT_CONTAINS_HANDOFF_TOKEN = no`, `AUDIT_CONTAINS_SESSION_BEARER = no`, and
`AUDIT_IS_BUSINESS_AUTHORITY = no`.

This was introduced because post-delivery terminal scrubbing intentionally
removes transient open-app capability material, so live acceptance needs a
durable safe record. Pre-v4 events have no reconstructed audit and remain
ineligible as audit acceptance evidence.
