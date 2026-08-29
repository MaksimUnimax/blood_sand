# VK M3 local acceptance coverage

Status: **BLOCKED — incomplete mandatory acceptance matrix**.

The following local evidence was added in `test_vk_callback.py`,
`test_vk_acceptance.py`, and `test_vk_runtime.py`.  This document deliberately
does not turn untested requirements into a PASS.

```text
CALLBACK_HTTP_MATRIX = PASS (test_vk_callback.py)
NORMALIZATION_MATRIX = PASS (test_vk_acceptance.py)
DATE_PARSER_MATRIX = PASS (test_vk_acceptance.py)
STATE_MACHINE_MATRIX = BLOCKED (representative flow only)
BUSINESS_PARITY_MATRIX = BLOCKED
CUSTOMER_COPY_MATRIX = PASS (test_vk_acceptance.py)
STORAGE_TRANSACTION_MATRIX = BLOCKED (failure injection incomplete)
INBOUND_CONCURRENCY_MATRIX = PASS (test_vk_acceptance.py)
OUTBOX_CONCURRENCY_MATRIX = BLOCKED (two-connection proof incomplete)
PROCESS_RESTART_MATRIX = BLOCKED
STALE_CLAIM_RECOVERY_MATRIX = PASS (test_vk_acceptance.py)
RAW_RETENTION_MATRIX = PASS (test_vk_acceptance.py)
VK_SUCCESS_SHAPE_MATRIX = PASS (test_vk_acceptance.py)
VK_ERROR_CLASS_MATRIX = BLOCKED (full HTTP error envelope matrix incomplete)
VK_RETRY_MATRIX = BLOCKED (6/10/36 and transport matrix incomplete)
TRANSPORT_UNKNOWN_MATRIX = BLOCKED
RUNTIME_METHOD_ALLOWLIST = PASS (static audit: vk_api.py only)
KEYBOARD_PROHIBITION = PASS (static audit)
M2_REGRESSION = PASS (full unittest discovery)
CONFIG_VALIDATION = BLOCKED (new enabled-policy matrix incomplete)
```

Local repairs proven by the current tests:

```text
MULTIPLE_DATE_CANDIDATE_GUESSING = FIXED_NOT_PRESENT
MALFORMED_VK_RESPONSE_FALSE_SUCCESS = FIXED_NOT_PRESENT
RAW_CALLBACK_RETENTION = BOUNDED_CONFIGURABLE
STALE_CLAIM_RECOVERY = PASS
```

Session retention remains
`PENDING_CONTROLLED_STAGING_DEPLOYMENT_CONFIGURATION`; no production duration
is asserted by this local slice.
