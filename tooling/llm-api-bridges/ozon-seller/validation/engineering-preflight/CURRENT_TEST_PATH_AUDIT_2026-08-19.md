# Ozon v0.1.19 — engineering pre-Codex current-path audit

Trigger commit: `ed2d2edfbe47ff6c818819917b8a473a040f4df6`

This is engineering preflight evidence only. It is not a Codex PASS and does not authorize packaging.

## Non-browser current-hash path execution
```text
trigger_sha=ed2d2edfbe47ff6c818819917b8a473a040f4df6
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
file:///home/runner/work/_temp/ozon-path-audit/tests/B02_B03_CONTRACT_CURRENT.mjs:12
const assert=(v,m)=>{if(!v)throw new Error(m)};
                                 ^

Error: blocked/unsupported operation posting_fbs_get was accepted
    at assert (file:///home/runner/work/_temp/ozon-path-audit/tests/B02_B03_CONTRACT_CURRENT.mjs:12:34)
    at expectReject (file:///home/runner/work/_temp/ozon-path-audit/tests/B02_B03_CONTRACT_CURRENT.mjs:25:141)
    at file:///home/runner/work/_temp/ozon-path-audit/tests/B02_B03_CONTRACT_CURRENT.mjs:77:3
    at ModuleJob.run (node:internal/modules/esm/module_job:413:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:660:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.12.0
EXIT_CODE[B02_B03_CONTRACT_CURRENT.mjs]=1
===== B04_CAPABILITY_CURRENT.mjs =====
/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:40
    const error = new Error(message);
                  ^

Error: params: разрешены только JSON-значения.
    at fail (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:40:19)
    at sanitizeJsonValue (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:78:7)
    at Object.normalizeCommand (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:626:22)
    at file:///home/runner/work/_temp/ozon-path-audit/tests/B04_CAPABILITY_CURRENT.mjs:27:19 {
  code: 'INVALID_PARAMS_VALUE'
}

Node.js v24.12.0
EXIT_CODE[B04_CAPABILITY_CURRENT.mjs]=1
===== B05_B07_B08_ANALYTICS_CURRENT.mjs =====
/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:40
    const error = new Error(message);
                  ^

Error: params: разрешены только JSON-значения.
    at fail (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:40:19)
    at sanitizeJsonValue (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:78:7)
    at Object.normalizeCommand (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_contract.js:626:22)
    at cmd (file:///home/runner/work/_temp/ozon-path-audit/tests/B05_B07_B08_ANALYTICS_CURRENT.mjs:37:45)
    at file:///home/runner/work/_temp/ozon-path-audit/tests/B05_B07_B08_ANALYTICS_CURRENT.mjs:38:15
    at ModuleJob.run (node:internal/modules/esm/module_job:413:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:660:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  code: 'INVALID_PARAMS_VALUE'
}

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
/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_credentials.js:4
    const error = new Error(message);
                  ^

Error: performance_client_id не сохранён.
    at fail (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_credentials.js:4:19)
    at normalizeHeaderCredential (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_credentials.js:12:21)
    at Object.normalizePerformanceCredentials (/home/runner/work/_temp/ozon-path-audit/candidate/shared/ozon_credentials.js:34:22)
    at file:///home/runner/work/_temp/ozon-path-audit/tests/B14_PERFORMANCE_CURRENT.mjs:41:22
    at ModuleJob.run (node:internal/modules/esm/module_job:413:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:660:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  code: 'MISSING_PERFORMANCE_CLIENT_ID'
}

Node.js v24.12.0
EXIT_CODE[B14_PERFORMANCE_CURRENT.mjs]=1
NON_BROWSER_FAILURE_COUNT=6
CURRENT_NON_BROWSER_PATHS_EXECUTE_FAIL
```

## Windows/CFT browser current-hash path execution
```text
trigger_sha=ed2d2edfbe47ff6c818819917b8a473a040f4df6
node=v24.12.0
reconstruct=failure
dependencies=skipped
materialize=skipped
execute=skipped
frozen_zip_sha256=d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c
patch_sha256=bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d
final_worker_sha256=dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac
final_content_sha256=ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda

```
