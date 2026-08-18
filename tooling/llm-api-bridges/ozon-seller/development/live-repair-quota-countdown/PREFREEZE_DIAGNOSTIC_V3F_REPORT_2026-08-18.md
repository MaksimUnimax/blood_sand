# Ozon live-repair V3F diagnostic report

Date: 2026-08-18
Scope: diagnostic engineering gate only; not acceptance, live-provider testing, or release promotion.

## Authority and safety

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- Exact repaired tree: 17 production files; protected fifteen byte-identical.
- Node: `v24.12.0`; Puppeteer: `25.4.0`; CFT: `151.0.7922.47`.
- `REAL_OZON_REQUESTS = 0`; `REAL_PERFORMANCE_REQUESTS = 0`.
- No V4, production, V3 patch, dependency, credential, or normal-profile changes.

## Git object integrity

Each source and runner blob was materialized separately and individually verified with `git hash-object`:

| file | Git object result |
|---|---|
| worker source | `0da73bdd1bb1608074781bb0c594c7875a4fe3ce` |
| browser source | `841429741d5ff9144a8a40506e657dc4392fe37c` |
| regression source | `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5` |
| worker runner | `3f08db7056e76eeff0f0a101083c869475b81c65` |
| browser runner | `3f0348c2e3541bd8dc70d25e5768c5c7913d3778` |

All five mappings passed. All five materialized files passed `node --check`.

## Worker exact command and result

Command:

```text
node inputs/worker-runner.mjs inputs/worker-source.mjs D:\\codex\\Test\\qa-live-repair-diagnostic-v3f\\v3-exact
```

Exit code: `1`.

The test-only transform passed and the actual public-state/privacy markers passed. The required complete diagnostic dump is preserved verbatim below.

```text
V3F_WORKER_SOURCE_GIT_BLOB=0da73bdd1bb1608074781bb0c594c7875a4fe3ce
V3F_WORKER_SOURCE_SHA256=10d6f1a9c71ed36054b25f4155806b40fcfa5d04f2cd5ff25ae6d9ac13521ef0
V3F_WORKER_DIAGNOSTIC_SHA256=b044d3c95c1d0de3d6f93400bda715cbac001e09bdfb7bf68bd4eb91ac5248be
V3F_WORKER_TEST_ONLY_TRANSFORM=PASS
V3B_ACTUAL_MANUAL_PUBLIC_STATE_PASS
V3B_ACTUAL_AUTORUN_PUBLIC_STATE_PASS
V3B_ACTUAL_PUBLIC_STATE_PRIVACY_PASS
V3F_DEBUG_MANUAL_OPERATION={"operation_id":"ozmanual-530bbc53-2bb2-445d-9d5b-427135d86c32","manual_request_id":"guarded-miss","conversation_key":"https://chatgpt.com|33333333-3333-4333-8333-333333333333","origin":"https://chatgpt.com","conversation_id":"33333333-3333-4333-8333-333333333333","binding_snapshot":{"binding_id":"bind-33333333-3333-4333-8333-333333333333","binding_revision":1,"origin":"https://chatgpt.com","ai_id":"chatgpt","conversation_id":"33333333-3333-4333-8333-333333333333","conversation_key":"https://chatgpt.com|33333333-3333-4333-8333-333333333333"},"tab_id":3,"status":"failed","operation":null,"last_operation":null,"command_summary":"1 queued OZON_API_V1 item(s)","request_id":null,"request_worker_session_id":null,"delivery_id":null,"outgoing_text":null,"auto_send":true,"report_prefix_applied":false,"delivery_confirmed":false,"delivery":null,"batch":{"phase":"collecting","source":"manual_copy","entries":[{"kind":"command","status":"pending","operation":"analytics_data","command_text":"OZON_API_V1 {\"operation\":\"analytics_data\",\"params\":{\"date_from\":\"2026-08-17\",\"date_to\":\"2026-08-17\",\"dimension\":[\"day\"],\"metrics\":[\"revenue\"],\"limit\":1}}","command":{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}},"command_fingerprint":"a9cb88e5","request_id":null,"http_status":null,"external_request_executed":null,"report_text":null}],"next_index":0,"request_state":"idle","request_worker_session_id":null,"planning_state":"pending","capability_resolution":{"state":"not_needed","probe_performed":false,"profile":{"status":"not_needed","subscription_type":"UNKNOWN","is_premium":null,"probe_performed":false,"probe_http_status":0,"probe_error_code":null},"resolved_at":"2026-08-18T07:23:58.127Z"},"query_planning_state":"pending","query_plan":null,"quota_wait":null,"request_quota":null,"created_at":"2026-08-18T07:23:58.124Z"},"created_at":"2026-08-18T07:23:58.124Z","completed_at":"2026-08-18T07:23:58.128Z","last_error":{"code":"INVALID_PARAMS_VALUE","message":"params: разрешены только JSON-значения.","at":"2026-08-18T07:23:58.128Z"},"updated_at":"2026-08-18T07:23:58.128Z"}
V3F_DEBUG_QUOTA_STATE={"schema_version":1,"accounts":{"aa2c7e8b4bc2ba398b46c070f1bbba4b1bc82ea3293c84778401e8702936034c":{"credential_revision":"b9218e5eaca7d140b4a5edbd78d86c8ab9324878b9ead30649e5f86087f5a5db","families":{"seller.analytics_data.v1":{"min_interval_ms":60000,"last_provider_request_at":1787037781121,"next_allowed_at":1787037841121,"credential_revision":"b9218e5eaca7d140b4a5edbd78d86c8ab9324878b9ead30649e5f86087f5a5db","updated_at":"2026-08-18T07:23:01.121Z"}}}}}
V3F_DEBUG_CACHE_STATE={"schema_version":1,"accounts":{}}
V3F_DEBUG_PROVIDER_CALLS=[]
V3F_DEBUG_DIAGNOSTICS=[{"sequence":1,"event_id":"event-1-c81594df-81aa-436d-a7b2-bd6afaf52d01","at":"2026-08-18T07:23:58.125Z","runtime_version":"0.1.19","source":"service_worker","level":"info","event":"MANUAL_BATCH_ACCEPTED","operation_id":"ozmanual-530bbc53-2bb2-445d-9d5b-427135d86c32","manual_request_id":"guarded-miss","conversation_id":"33333333-3333-4333-8333-333333333333","tab_id":3,"item_count":1,"command_count":1,"pre_execution_error_count":0,"source_stage":"command_discovery"},{"sequence":2,"event_id":"event-2-84f3e51c-df50-46ae-8668-a746ff5532c7","at":"2026-08-18T07:23:58.128Z","runtime_version":"0.1.19","source":"service_worker","level":"error","event":"MANUAL_BATCH_FAILED","operation_id":"ozmanual-530bbc53-2bb2-445d-9d5b-427135d86c32","code":"INVALID_PARAMS_VALUE"}]
Error: waitFor timeout
    at waitFor (file:///C:/Users/unyma/AppData/Local/Temp/ozon-v3f-worker-UkXGjt/V3F_WORKER_STATE_DIAGNOSTIC_HARNESS.mjs:101:9)
    at async file:///C:/Users/unyma/AppData/Local/Temp/ozon-v3f-worker-UkXGjt/V3F_WORKER_STATE_DIAGNOSTIC_HARNESS.mjs:165:11
Node.js v24.12.0
```

Diagnostic conclusion: `request_state=idle`, `query_planning_state=pending`, entry `status=pending`, `planning_state` absent, `last_error.code=INVALID_PARAMS_VALUE`, `quota_wait=null`, quota state unchanged, provider calls empty, and the last diagnostic event is `MANUAL_BATCH_FAILED` with `INVALID_PARAMS_VALUE`. This proves the supplied test fixture failed during parameter parsing before quota acquisition; it does not prove a production quota-contract violation. Classification: `HARNESS_FIXTURE_FAILURE`.

## Browser exact command and result

Command:

```text
node inputs/browser-runner.mjs inputs/browser-source.mjs D:\\codex\\Test\\qa-live-repair-diagnostic-v3f\\v3-exact D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa\\chrome\\win64-151.0.7922.47\\chrome-win64\\chrome.exe D:\\codex\\Test\\qa-harness\\puppeteer-extension-qa
```

Exit code: `1`.

stdout/stderr:

```text
V3F_BROWSER_SOURCE_GIT_BLOB=841429741d5ff9144a8a40506e657dc4392fe37c
V3F_BROWSER_RELOCATED_BYTES_IDENTICAL=PASS
V3F_BROWSER_NODE_MODULES_LINK=C:\\Users\\unyma\\AppData\\Local\\Temp\\ozon-v3f-browser-4e29DF\\node_modules
TargetCloseError: Protocol error (Extensions.loadUnpacked): Target closed
    at CdpBrowser.installExtension (file:///D:/codex/Test/qa-harness/puppeteer-extension-qa/node_modules/puppeteer-core/lib/puppeteer/cdp/Browser.js:268:47)
    at file:///C:/Users/unyma/AppData/Local/Temp/ozon-v3f-browser-4e29DF/V3_BROWSER_COUNTDOWN_HARNESS.mjs:34:35
Node.js v24.12.0
```

The junction and relocated Git blob passed; CFT/Puppeteer then closed the target during extension loading before browser assertions. Classification: `ENVIRONMENT_ERROR`.

## Regression exact command and result

Command:

```text
node inputs/regression-source.mjs D:\\codex\\Test\\qa-live-repair-diagnostic-v3f\\step4-exact D:\\codex\\Test\\qa-live-repair-diagnostic-v3f\\v3-exact
```

Exit code: `0`; stderr empty. stdout:

```text
V3B_PROTECTED_15_BYTE_IDENTICAL_PASS
V3B_STEP1_SECURITY_CARRY_FORWARD_PASS
V3B_STEP2_PLANNER_PROJECTION_CARRY_FORWARD_PASS
V3B_STEP4_CACHE_PREFETCH_CARRY_FORWARD_PASS
V3B_DELIVERY_FSM_CARRY_FORWARD_PASS
V3B_STEP3_INTEGRATION_SURFACE_PASS
V3B_CONTRACT_PROTECTED_FUNCTIONS_PRESENT_PASS
V3_REGRESSION_CARRY_FORWARD_HARNESS_PASS
```

## Verdict

V3F fails with multiple classifications: `HARNESS_FIXTURE_FAILURE` for the worker diagnostic fixture and `ENVIRONMENT_ERROR` for CFT extension loading. No real Ozon/Performance request occurred.
