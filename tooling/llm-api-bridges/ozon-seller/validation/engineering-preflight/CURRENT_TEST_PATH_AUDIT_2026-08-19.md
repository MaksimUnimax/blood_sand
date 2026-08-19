# Ozon v0.1.19 — engineering pre-Codex current-path audit

Trigger commit: `3601f8d0139544d3c6612827b95fd8b6677a0a19`

This is engineering preflight evidence only. It is not a Codex PASS and does not authorize packaging.

## Non-browser current-hash path execution
```text
trigger_sha=3601f8d0139544d3c6612827b95fd8b6677a0a19
node=v24.12.0
reconstruct=success
materialize=success
execute=failure
frozen_zip_sha256=d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
patch_sha256=bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
final_worker_sha256=dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
final_content_sha256=ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda

===== B02_B03_CONTRACT_CURRENT.mjs =====
B02_VALID_COMMAND_CONTRACT_PASS
B02_SURROUNDING_PROSE_NOT_COMMAND_PASS
B02_UNICODE_SEPARATOR_PASS
B02_MALFORMED_JSON_FAIL_CLOSED_PASS
B02_ANALYTICS_STRICT_PARAMS_PASS
B03_TRANSPORT_FIELD_INJECTION_REJECTED_PASS
B02_PRODUCT_QUERY_STRICT_PARAMS_PASS
B02_POSTING_FBS_GET_EXECUTION_BLOCKED_PASS
B02_INTERNAL_AND_BLOCKED_OPERATIONS_PASS
B03_NO_MUTATION_OPERATION_SURFACE_PASS
B03_PREEXEC_REDACTION_AND_ZERO_REQUEST_PROVENANCE_PASS
B03_CONTRACT_NO_ARBITRARY_TRANSPORT_SURFACE_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B02_B03_CONTRACT_CURRENT_PASS
EXIT_CODE[B02_B03_CONTRACT_CURRENT.mjs]=0
===== B04_CAPABILITY_CURRENT.mjs =====
B04_UNIVERSAL_ZERO_CAPABILITY_PROBE_PASS
B04_ONE_PROBE_PER_RELEVANT_BATCH_PASS
B04_ALL_RESTRICTED_ZERO_EXECUTABLE_BUSINESS_PASS
B04_SELLER_INFO_PRIVACY_PASS
B04_MIXED_UNIVERSAL_RESTRICTED_PARTIAL_PASS
B04_RESTRICTED_DIMENSION_FAIL_CLOSED_PASS
B04_STALE_PROBE_NO_REPLAY_PASS
B04_PREMIUM_FULL_SCOPE_AND_UNKNOWN_FAIL_CLOSED_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B04_CAPABILITY_CURRENT_PASS
EXIT_CODE[B04_CAPABILITY_CURRENT.mjs]=0
===== B05_B07_B08_ANALYTICS_CURRENT.mjs =====
B05_COMPATIBLE_COALESCE_PASS
B05_NONMETRIC_MISMATCH_NO_COALESCE_PASS
B05_DETERMINISTIC_UNION_AND_PROJECTION_PASS
B05_UNPROJECTABLE_FAIL_CLOSED_PASS
B07_VALID_RESPONSE_VERIFIED_PASS
B07_INVALID_200_FAILS_CLOSED_PASS
B07_429_SAFE_NO_RETRY_PASS
B07_TRANSPORT_AND_PREFETCH_PROVENANCE_PASS
file:///home/runner/work/_temp/ozon-path-audit/tests/B05_B07_B08_ANALYTICS_CURRENT.mjs:12
const assert=(v,m)=>{if(!v)throw new Error(m)};
                                 ^

Error: same Seller compatible safe superset cache miss
    at assert (file:///home/runner/work/_temp/ozon-path-audit/tests/B05_B07_B08_ANALYTICS_CURRENT.mjs:12:34)
    at file:///home/runner/work/_temp/ozon-path-audit/tests/B05_B07_B08_ANALYTICS_CURRENT.mjs:96:1

Node.js v24.12.0
EXIT_CODE[B05_B07_B08_ANALYTICS_CURRENT.mjs]=1
===== B06_WORKER_QUOTA_CURRENT.mjs =====
file:///home/runner/work/_temp/ozon-path-audit/tests/B06_WORKER_QUOTA_CURRENT.mjs:26
async function waitFor(fn,timeout=10000,step=25){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step))}throw new Error('waitFor timeout')}
                                                                                                                                                                                        ^

Error: waitFor timeout
    at waitFor (file:///home/runner/work/_temp/ozon-path-audit/tests/B06_WORKER_QUOTA_CURRENT.mjs:26:185)
    at async file:///home/runner/work/_temp/ozon-path-audit/tests/B06_WORKER_QUOTA_CURRENT.mjs:36:252

Node.js v24.12.0
EXIT_CODE[B06_WORKER_QUOTA_CURRENT.mjs]=1
===== B09_COMMON_BATCH_CURRENT.mjs =====
file:///home/runner/work/_temp/ozon-path-audit/tests/B09_COMMON_BATCH_CURRENT.mjs:40
async function waitFor(fn,timeout=10000,step=30){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await new Promise(r=>setTimeout(r,step))}throw new Error('waitFor timeout')}
                                                                                                                                                                                        ^

Error: waitFor timeout
    at waitFor (file:///home/runner/work/_temp/ozon-path-audit/tests/B09_COMMON_BATCH_CURRENT.mjs:40:185)
    at async file:///home/runner/work/_temp/ozon-path-audit/tests/B09_COMMON_BATCH_CURRENT.mjs:48:268

Node.js v24.12.0
EXIT_CODE[B09_COMMON_BATCH_CURRENT.mjs]=1
===== B11_B12_COMPOSER_WAIT_CURRENT.mjs =====
TARGETED_MANUAL_OFF_ON_READY_WITH_QUOTA_PRESERVED_PASS
TARGETED_MANUAL_OFF_PENDING_ONLY_RESET_PASS
TARGETED_QUOTA_CACHE_PRESERVED_PASS
TARGETED_OTHER_OWNER_PRESERVED_PASS
TARGETED_ZERO_PROVIDER_CALLS_ON_TOGGLE_PASS
TARGETED_MANUAL_OFF_NARROW_SCOPE_PASS
TARGETED_MANUAL_OFF_LATE_INSERT_COMMIT_BLOCKED_PASS
TARGETED_OCCUPIED_COMPOSER_ENTERS_WAIT_PASS
TARGETED_COMPOSER_WAIT_CLEAR_INSERT_ONCE_PASS
TARGETED_COMPOSER_WAIT_RESTART_RESTORE_PASS
TARGETED_MANUAL_OFF_STOPS_COMPOSER_WAIT_PASS
TARGETED_MANUAL_COMPOSER_WAIT_HELPER_PRESENT_PASS
TARGETED_COMPOSER_WAIT_REGRESSION_PASS
TARGETED_MISSING_COMPOSER_ENTERS_WAIT_PASS
TARGETED_COMPOSER_WAIT_REGRESSION_PASS
EXIT_CODE[B11_B12_COMPOSER_WAIT_CURRENT.mjs]=0
===== B14_PERFORMANCE_CURRENT.mjs =====
B14_FIXED_PERFORMANCE_HOST_AND_EXECUTION_PATH_PASS
B14_PERFORMANCE_AUTH_SEPARATION_PASS
B14_PERFORMANCE_ZERO_SELLER_CAPABILITY_BOUNDARY_PASS
B14_NO_SELLER_QUOTA_OR_CACHE_FOR_PERFORMANCE_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B14_PERFORMANCE_CURRENT_PASS
EXIT_CODE[B14_PERFORMANCE_CURRENT.mjs]=0
NON_BROWSER_FAILURE_COUNT=3
CURRENT_NON_BROWSER_PATHS_EXECUTE_FAIL
```

## Windows/CFT browser current-hash path execution
```text
trigger_sha=3601f8d0139544d3c6612827b95fd8b6677a0a19
node=v24.12.0
reconstruct=success
dependencies=success
materialize=success
execute=failure
frozen_zip_sha256=d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
patch_sha256=bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
final_worker_sha256=dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
final_content_sha256=ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda

node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'puppeteer-core' imported from D:\a\_temp\B10_B13_B15_BROWSER_CURRENT.mjs
Did you mean to import "puppeteer-core/lib/puppeteer/puppeteer-core.js"?
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:316:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:858:18)
    at defaultResolve (node:internal/modules/esm/resolve:990:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:718:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:735:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:764:52)
    at #resolve (node:internal/modules/esm/loader:700:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:620:35)
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:649:32) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.12.0
BROWSER_EXIT_CODE=1
CURRENT_BROWSER_PATH_EXECUTE_FAIL
```

## Engineering follow-up R2 — corrected fixture execution

Trigger commit: `1ad50e23601c769e462b99482569d595de3be44a`

### Remaining VM paths
```text
trigger_sha=1ad50e23601c769e462b99482569d595de3be44a
execute=success
===== B05.mjs =====
B05_COMPATIBLE_COALESCE_PASS
B05_NONMETRIC_MISMATCH_NO_COALESCE_PASS
B05_DETERMINISTIC_UNION_AND_PROJECTION_PASS
B05_UNPROJECTABLE_FAIL_CLOSED_PASS
B07_VALID_RESPONSE_VERIFIED_PASS
B07_INVALID_200_FAILS_CLOSED_PASS
B07_429_SAFE_NO_RETRY_PASS
B07_TRANSPORT_AND_PREFETCH_PROVENANCE_PASS
B08_CACHE_HIT_DEBUG={"hit":true,"result":{"result":{"data":[{"dimensions":[{"id":"2026-08-17","name":"2026-08-17"}],"metrics":[100]}],"totals":[100]}},"http_status":200,"cache":{"hit":true,"profile_id":"analytics_basic_metrics_v1","stored_at":100000,"expires_at":160000,"age_ms":500,"source_request_id":"cache-source-1","source_physical_command_fingerprint":"5db16a8c","cached_metrics":["revenue","ordered_units"],"requested_metrics":["revenue"]}}
B08_BASIC_METRICS_PREFETCH_SAFE_PASS
B08_VERIFIED_SUPERSET_CACHE_PROJECTION_PASS
B08_SELLER_ISOLATION_AND_KEY_ROTATION_PASS
B08_SEMANTIC_AND_TTL_MISS_PASS
B08_ERROR_MALFORMED_NOT_CACHED_PASS
B08_CACHE_CREDENTIAL_PRIVACY_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B05_B07_B08_ANALYTICS_CURRENT_PASS
EXIT_CODE[B05.mjs]=0
===== B06.mjs =====
B06_FIRST_COLD_REQUEST_EXECUTED_PASS
B06_SECOND_COLD_REQUEST_WAITS_PASS
B06_SAME_SELLER_CHATGPT_ALICE_SHARED_BUCKET_PASS
B06_KEY_ROTATION_SAME_ACCOUNT_PASS
B06_PUBLIC_QUOTA_STATE_PRIVACY_PASS
B06_DIFFERENT_SELLER_BUCKET_INDEPENDENT_PASS
B06_DUE_AUTO_RESUME_ONE_PROVIDER_CALL_PASS
B06_STARTUP_NO_REPLAY_PASS
B06_CONCURRENT_ACQUIRE_ONE_PERMIT_PASS
B06_COALESCED_ONE_PHYSICAL_PERMIT_PASS
B06_429_ONE_CALL_NO_RETRY_PASS
B06_RETRY_AFTER_EXTENSION_ONLY_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B06_WORKER_QUOTA_CURRENT_PASS
EXIT_CODE[B06.mjs]=0
===== B09.mjs =====
B09_ONE_COMMAND_ONE_ENTRY_PASS
B09_MULTI_COMMAND_ORDER_PASS
B09_STRICT_SERIAL_PHYSICAL_CALLS_PASS
B09_LOGICAL_RESULTS_REMAIN_SEPARATE_PASS
B09_PARTIAL_VALIDATION_SAFE_CONTINUATION_PASS
B09_VALIDATION_ENTRY_ZERO_PROVIDER_PASS
B09_COMPLETED_ENTRIES_NO_REPLAY_PASS
B09_OLD_REQUESTING_FAIL_CLOSED_PASS
REAL_OZON_REQUESTS=0
REAL_PERFORMANCE_REQUESTS=0
B09_COMMON_BATCH_CURRENT_PASS
EXIT_CODE[B09.mjs]=0
VM_R2_FAILURE_COUNT=0
```

### Browser path after exact-byte reconstruction/module-resolution correction
```text
trigger_sha=1ad50e23601c769e462b99482569d595de3be44a
execute=failure

DevTools listening on ws://127.0.0.1:50042/devtools/browser/6b9b8001-76bc-48dc-bf67-a5ef466d975b
file:///D:/a/_temp/r2-puppeteer/B10_B13_B15_BROWSER_CURRENT.mjs:15
const assert=(v,m)=>{if(!v)throw new Error(m)};
                                 ^

Error: countdown did not decrease: 7,7,5
    at assert (file:///D:/a/_temp/r2-puppeteer/B10_B13_B15_BROWSER_CURRENT.mjs:15:34)
    at file:///D:/a/_temp/r2-puppeteer/B10_B13_B15_BROWSER_CURRENT.mjs:155:3

Node.js v24.12.0
BROWSER_EXIT_CODE=1
```
