# VK Platform M3 Final Gate ADR

Decision: `KIP_VK_M3_FINAL_STAGING_GATE_V1`
Status: **PASS — PLAIN_TEXT_RUNTIME_SLICE AUTHORIZED**
Date: 2026-08-29

## Authority and evidence

```text
VK API version = 5.199
VK schema commit = 333481bd082ad747d4873ef4a77f9247097eeef0
project Callback server id = 4
Callback status = ok
Callback confirmation = PASS
message_new enabled = yes
real nested message_new = PASS
event persistence = PASS
dedup persistence = PASS
real messages.send = PASS
one logical message / one persisted random_id = PASS
```

The four sanitized real-staging fixtures are the evidence record. No secret,
identifier, raw private message, or Callback payload is recorded here.

## Credential and runtime authority

```text
FINAL_REQUIRED_PERMISSION_NAMES = messages, manage
FINAL_REQUIRED_PERMISSION_POLICY = TESTED_OPERATIONAL_PROFILE
PROVISIONING_TOKEN_POLICY = tested token carrying messages, manage
RUNTIME_TOKEN_POLICY = same tested credential permitted initially; runtime method allowlist restricts authority
RUNTIME_MINIMAL_NAMED_PERMISSION_SET = UNRESOLVED_NON_BLOCKING_HARDENING
RUNTIME_MINIMUM_PERMISSION_HARDENING_BLOCKS_M3 = no
M3_V1_RUNTIME_VK_METHOD_ALLOWLIST = messages.send
```

This is the tested V1 operational profile, not a claim of mathematical minimum.
Runtime code must not call `groups.setSettings`, `groups.setCallbackSettings`,
`groups.addCallbackServer`, `groups.editCallbackServer`, or
`groups.deleteCallbackServer`; provisioning is operator/preflight work only.

## Retry policy

```text
PERMANENT_USER_STATE = 900, 901, 902, 917, 936, 945, 946, 950, 985, 987, 988, 1012
AUTH_CONFIGURATION = 5, 7, 15, 925, 103
INVALID_REQUEST_OR_CODE_BUG = 8, 100, 911, 914, 921, 943, 944
TRANSIENT_RATE_OR_SERVICE = 6, 10, 36
NO_AUTOMATIC_RETRY_BUT_TRANSIENT_OR_THROTTLING = 9, 940
UNKNOWN_FAIL_CLOSED = every explicit VK API error outside the retry allowlist
AUTOMATIC_VK_API_ERROR_RETRY_ALLOWLIST = 6, 10, 36
VK_API_AUTOMATIC_RETRY_MAX = 1
TRANSPORT_UNKNOWN_RETRY_MAX = 1
```

An outbound logical message has at most two attempts. Every retry, including
one transport-unknown retry, reuses the same persisted `random_id`. Explicit
success is terminal; every parsed error outside the allowlist is terminal for
automatic processing. The classification is based on the official schema
commit above; no transport failure was staged.

## Scope decision

```text
FIRST M3 RUNTIME SLICE = PLAIN_TEXT_ONLY
TEXT_KEYBOARD_FIXTURE = PENDING
TEXT_KEYBOARD_FIXTURE_BLOCKS_PLAIN_TEXT_M3 = no
M3_KEYBOARD_CODE_GATE = BLOCKED_PENDING_REAL_TEXT_KEYBOARD_STAGING_FIXTURE
PERMANENT_ERROR_FIXTURE = PENDING_NON_BLOCKING
M3_CODE_GATE = PASS
M3_CODE_GATE_SCOPE = PLAIN_TEXT_RUNTIME_SLICE
```

The first runtime slice emits no VK keyboard and accepts ordinary text choices
such as `Мужчине` and `Женщине`. Keyboard sending remains prohibited until a
controlled real staging send captures its exact sanitized evidence. The
permanent-error fixture remains pending because safe reproducibility is
conditional under the original gate.
