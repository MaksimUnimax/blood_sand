# Проверка связанных механизмов report-file

Executable: `3f543bde2f8b4c0a561ecb50aeba111ff108751a`. Tree: `eac9f8849e2b73dcee6e6cc5b795e879a481ee9f`. Финальный CI: `34687477934`.

| ID | Источник | Все затронутые потребители / правило | Состояние и срок | Доказательство | Статус |
|---|---|---|---|---|---|
| D01 | Reportinfo.file + expires_at | same result record; no nested additional_data source | one explicit metadata response | expiry: SOURCE_REPORT_RECORD_NOT_ADDITIONAL_DATA_IS_AUTHORITY | PASS |
| D02 | Report status | success may authorize a URL; waiting/processing/failed may not | response-local | matrix: NONREADY_STATUS_* | PASS |
| D03 | Date validation | RFC3339, actual calendar, offset, fractional seconds | pure local calculation | expiry: MALFORMED_DATE_*; RFC3339_PRECISION_OFFSET_* | PASS |
| D04 | Legacy empty/null/absent expiry | existing bounded local retention, not an invented provider guarantee | 30-minute ref retention | expiry: LEGACY_* | PASS |
| D05 | Provider expiry + local retention | earliest absolute deadline; no renewal by reads | persisted expires_at_ms | expiry: EARLIEST_DEADLINE_*; matrix: INFO_REPEATS_CANNOT_RENEW_PROVIDER_DEADLINE | PASS |
| D06 | SELLER_RETURNS URL | documented five-minute cap from explicit request start | min(provider, five minutes, local retention) | expiry: RETURNS_FIVE_MINUTE_LIMIT | PASS |
| D07 | URL ref creation | expired/invalid URL never becomes an actionable fresh ref | registration and safe file_availability | expiry: EXPIRED_REPORT_NEVER_MINTS_REF; INVALID_EXPIRY_NOT_TREATED_AS_UNBOUNDED | PASS |
| D08 | Async lock/storage delay | check after lock and after write; deadline never rebased | serialized session-state writes | expiry: READINESS_RECHECK_AFTER_STORAGE_WAIT; matrix: EXPIRY_DURING_STATE_WRITE_NO_READY_REF | PASS |
| D09 | Session schema migration | v1 URL refs rejected; valid independent facts and inline bytes retained | schema2, same storage key | expiry: V1_URL_REFS_REQUIRE_FRESH_RESOLUTION; matrix: V1_INLINE_PDF_MIGRATES_WITHOUT_URL_EXPIRY | PASS |
| D10 | Provenance and rpf_s/rpf_p | known create facts only; unknown/expired history stays personal | existing 30-minute facts; cap256 unchanged | expiry: UNKNOWN_AND_EXPIRED_PROVENANCE_REMAIN_PERSONAL; worker: UNKNOWN_PROVENANCE_PERSONAL_POLICY_OFF_BLOCKS | PASS |
| D11 | Two inline PDF producers | already obtained bytes: no provider URL lifetime inference | existing session bytes retention | matrix: INLINE_PDF_RECREATE_ZERO_GET_* | PASS |
| D12 | Storage failures/caps/concurrency | failed persistence does not invent success or repeat request | session cap128, serialized writes | expiry: STATE_WRITE_FAILURE_*; matrix: REF_CAP_128_*; CONCURRENT_REF_WRITES_* | PASS |
| D13 | MV3 state restoration | absolute expiry survives complete module and actual worker replacement | real chrome.storage.session | expiry: DEADLINE_SURVIVES_*; browser: ACTUAL_MV3_STOP_AND_NEW_WORKER_ACTIVATION | PASS |
| D14 | Final file GET admission | expired ref stops before one transport call, HTTP0 external=false | last synchronous pre-transport check | worker: EXPIRED_GET_HTTP0_ZERO_REQUEST_ACTUAL_WORKER; browser: EXPIRED_GET_AFTER_REAL_SW_RESTART_ZERO_NETWORK_CALLS | PASS |
| D15 | Trusted URL/credentials | HTTPS, host allowlist, redirect=error, credentials=omit unchanged | existing transport implementation | matrix: TRUSTED_HOST_UNCHANGED_*; 31 prior regressions | PASS |
| D16 | Valid-URL provider failures | real 403 stays provider403, no fake expiry classification | one physical request; no retry | worker: REAL403_PRESERVED_ONE_REQUEST_NO_RETRY | PASS |
| D17 | Logical/physical accounting | metadata read1; expired/local policy rejection0; valid download1 | actual worker queue and response metadata | all worker cases, prior provider taxonomy tests | PASS |
| D18 | Outgoing continuation | safe absolute deadline rechecked; expired next_command=null | delivery-time result formatting | expiry: DELAYED_OUTPUT_CANNOT_OFFER_EXPIRED_REF; negative: ignore-delayed-output | PASS |
| D19 | Seven generated URL consumers | use shared registration without assuming report-specific fields | same local lifetime; safe metadata added | matrix: GENERATED_URL_RECREATE_GET_* | PASS |
| D20 | Captured downloaded artifacts | successful single fetch stores exact bytes; URL expiry cannot delete them | separate existing one-hour IndexedDB TTL | browser: REAL_CAPTURE_WRAPPER_STORES_EXACT_BYTES_IN_INDEXEDDB; URL_EXPIRY_DOES_NOT_DELETE_VALID_DOWNLOADED_ARTIFACT | PASS |
| D21 | HELP/API ingress and parsers | no alternative parser or provider fan-out added | unchanged production bytes | HELP39; prior mixed-help, envelopes, entitlement tests | PASS |
| D22 | AI adapters, DnD, XLSX, send and restart | unchanged code, reused full regression and browser fixtures | existing DOM and delivery lifetimes | 31 prior tests; five browser fixtures; attachment primitive; entry smoke | PASS |
| D23 | Manual admission/output/deduplication | real worker; text insertion acknowledgements; successful file attachment plan | recreated workers with shared durable stores | worker: MANUAL_CHAIN_RECREATION_TEXT_ACKS_FILE_PLAN_NO_DUPLICATES | PASS |
| D24 | Exact installed code/manifest | two changed files only, other30 identical; same ZIP on all platforms | frozen Git tree and deterministic ZIP | all identity/production-members proofs, final canonical readback | PASS |

В `source-inventory.json` сохранены все найденные ссылки на report-file механизм: восемь production-файлов, номера строк и хеши. Изменены только provider и формирование продолжения.

{
  "checked_paths": 24,
  "classified_consumer_files": 8,
  "unaccounted_pre_handoff_dependencies": 0,
  "stale_active_assumptions": 0,
  "available_but_unverified_pre_handoff_dependencies": 0,
  "live_gates_pending": 5
}

LIVE-GATE-01..05: PENDING POST-INSTALL. Настоящий пользовательский AI DOM, Ozon и установленная владельцем сборка не заменяются тестовыми ответами.
