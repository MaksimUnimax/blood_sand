# Ozon Bridge — mandatory full Codex gate before operator handoff

Status: `MANDATORY_PRE_OPERATOR_HANDOFF_GATE`
Scope: `tooling/llm-api-bridges/ozon-seller/`

## Purpose

This is the permanent living project-wide regression gate. It is run only immediately before ChatGPT hands an installable/testable Ozon Bridge build to the operator.

During implementation/repair work, run only targeted tests for changed code and dependencies directly traversed by that change. Do not repeatedly run this full historical matrix after every edit.

Immediately before operator handoff:

`freeze exact candidate -> one consolidated full Codex run -> full GitHub report review -> package exact tested tree -> fresh extraction/hash verification -> operator handoff`

Any production change after a PASS invalidates that PASS and requires a new consolidated run.

## Living-gate maintenance rule

Whenever production functionality is added or materially changed:

- add its Codex-testable behavior and affected invariants here before the next operator handoff;
- prefer behavioral/system assertions over source-text-only checks;
- include direct dependencies that the behavior can affect.

Whenever functionality is intentionally removed:

- remove tests that require the removed behavior;
- preserve tests for remaining neighboring/invariant behavior;
- record the product removal in normal project history.

Do not retain obsolete tests merely because they once existed. Do not weaken still-valid tests merely to make a candidate pass.

## Final validator rules

Codex is the independent validator for this gate, not the implementation agent.

The standalone final prompt must pin:

- live GitHub as source of truth;
- one exact deterministic candidate authority/commit;
- exact frozen base/artifact authority;
- exact production patch/candidate hashes;
- exact production inventory;
- accepted Windows QA environment unless explicitly superseded;
- Chrome for Testing / Puppeteer runtime installation path;
- mocked/intercepted provider behavior;
- no normal operator Chrome profile;
- no real Seller credentials;
- no real Performance credentials;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- no production edits by validator;
- no mandatory-test weakening/skipping;
- report-only validation branch;
- failure classification as production behavior, harness fixture, harness error or environment error;
- STOP after report publication.

## One consolidated execution

All currently applicable blocks below must be invoked by one top-level runner/command. Internal worker/browser/static/package blocks are allowed, but there is one terminal PASS/FAIL result.

The consolidated runner fails if any applicable mandatory block fails, is unexpectedly skipped, cannot verify the target candidate, observes unauthorized network activity, or detects production drift.

Required umbrella marker:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

No operator package handoff is allowed without that marker and review of the full GitHub report.

# Full functional regression inventory

## 1. Candidate integrity / reconstruction

Assert:

- requested candidate authority is exact and immutable for the run;
- frozen base/artifact and reconstruction inputs are exact;
- patch/part byte hashes are exact before application;
- patch applies without fuzz/manual repair;
- production inventory is exact;
- changed files match authorized scope;
- protected files remain byte-identical where declared protected;
- all production JavaScript passes `node --check`;
- `manifest.json` parses;
- no unintended permissions/host-permission expansion;
- no tests/reports/credentials/dev artifacts enter the production tree.

## 2. Command discovery / strict contract

Assert current supported command discovery and contract behavior including:

- supported ChatGPT/Alice code-block/message discovery;
- arbitrary surrounding prose/Markdown cannot create unrelated commands;
- supported Unicode/separator behavior remains accepted;
- malformed JSON is never silently repaired;
- malformed/pre-execution failures perform zero provider requests;
- analytics date/dimension/metric/filter/sort/limit/offset validation remains strict;
- product-query date/SKU/sort/page constraints remain strict;
- blocked/removed operations remain unavailable;
- `posting_fbs_get` remains blocked by the customer-PII boundary.

## 3. Provider / security boundary

Assert:

- fixed Seller/Performance hosts only;
- assistant text cannot select arbitrary URL/host/method/headers/auth/credentials;
- no mutation/write operation is exposed unless explicitly added by later accepted design;
- credentials never enter AI-visible output;
- unsafe raw provider bodies/fields are sanitized;
- customer PII is not exposed;
- no hidden retry, pagination, fan-out or report polling;
- no invented generic caps/silent truncation;
- wrong tab/conversation/binding fails closed.

## 4. Seller capability / entitlement

Assert:

- seller capability probe remains internal and non-AI-callable;
- raw seller-info identity/company fields never reach AI;
- universal analytics requires zero capability probes;
- one relevant logical batch performs at most one fresh capability probe;
- worker restart does not blindly replay in-flight capability probing;
- entitlement states remain explicit;
- mixed universal/restricted analytics follows reviewed partial semantics;
- all-restricted/no-executable analytics performs zero business requests;
- restricted dimension/filter/sort/history semantics fail closed instead of changing query meaning;
- Performance-only flow performs zero Seller capability probes.

## 5. Query planner / coalescing / projection

Assert:

- only contiguous compatible analytics commands coalesce;
- differing non-metric query semantics do not merge;
- metric union is deterministic and within contract maximum;
- logical identities/results remain separate after one physical request;
- verified physical metric order drives projection;
- unprovable projection fails closed;
- projection failure/provider error does not replay provider request;
- restart after already-started physical group does not blindly replay it.

## 6. Global Seller quota scheduler

Assert current reviewed quota behavior:

- family `seller.analytics_data.v1`;
- provider minimum `60000` ms;
- bridge launch safety `5000` ms;
- effective guarded interval `65000` ms;
- same Seller shares bucket across tabs/conversations/supported AIs;
- different Seller accounts remain independent;
- same Seller Client-Id with rotated Api-Key preserves account scope while credential revision changes;
- raw credentials are absent from quota persistence;
- concurrent acquisition grants only one permit;
- cache miss cannot bypass quota;
- one coalesced physical request consumes one permit;
- pre-provider `quota_waiting` survives MV3 restart;
- due wake creates exactly one provider call;
- no provider call begins before effective `next_allowed_at`;
- already-attempted/requesting work is not replayed on startup/alarm;
- no immediate retry;
- Retry-After only extends and never shortens persisted due time;
- public quota state contains safe timing metadata only.

## 7. Response verifier / safe errors

Assert:

- successful analytics cardinality/shape is verified before projection/cache storage;
- invalid HTTP-200 provider payload becomes a safe mismatch after the one provider attempt;
- verifier failure causes no retry;
- HTTP 429 is safe and may extend Retry-After state without retry;
- transport errors record truthful attempted-request provenance;
- pre-fetch storage/credential failures record zero provider requests;
- `automatic_retry:false` remains truthful.

## 8. Verified analytics cache / prefetch

Assert:

- only successful verified analytics responses cache;
- cache lookup precedes quota because cache hit performs no provider request;
- TTL remains `60000` ms unless intentionally changed;
- same Seller + exact non-metric semantics + safe metric superset may hit;
- different Seller/incompatible semantics/expired entries miss;
- provider errors/malformed responses do not cache;
- credentials are absent from serialized cache;
- projection from metric superset is deterministic;
- hit reports `external_request_executed:false` with truthful provenance;
- `analytics_basic_metrics_v1` prefetch only widens the reviewed universal metric subset;
- prefetch never adds restricted metrics or changes other query semantics;
- compatible following request may use cache with zero second provider call and zero second quota acquisition;
- cache hit/lookup does not corrupt quota state.

## 9. Manual / Autorun common batch engine

Assert:

- one command remains a one-entry batch;
- multi-command order is preserved;
- physical requests remain strictly serial where multiple calls are required;
- malformed/validation entries follow current safe continuation semantics;
- completed entries are not replayed after recovery;
- old-worker `requesting` ambiguity fails closed;
- no unintended intermediate chat delivery;
- final batch report preserves logical order/count and truthful physical count;
- Manual and Autorun ownership remain separate while using intended common worker batch machinery.

## 10. Delivery FSM — normal empty-composer path

Assert:

- ready report + empty correct composer enters the existing insertion path;
- correct owner/conversation only;
- worker insert commit remains the irreversible insertion permission boundary;
- report insertion occurs exactly once;
- staged recognized Send is clicked at most once;
- later ordinary user Send controls are not clicked by that delivery;
- disabled Send, Stop, Unknown and Microphone are not clicked as Send;
- Microphone/current accepted AI-ready marker remains success authority;
- confirmed completion clears transient delivery and restores Manual readiness;
- delivery recovery does not replay provider work.

## 11. Manual delivery — occupied or temporarily missing composer

Mandatory for the current occupied-composer repair.

Assert:

- unrelated non-empty composer text is never cleared, replaced, selected or submitted;
- a temporarily missing composer is treated as recoverable pre-insert state, not terminal `COMPOSER_NOT_FOUND`;
- neither occupied nor missing composer requests worker insert commit;
- pending report remains worker-owned in recoverable pre-insert delivery state;
- when a target composer exists but is occupied, persistent plate text is exactly `Очистите поле ввода, чтобы получить отчёт.`;
- plate does not auto-expire while report is pending/not inserted;
- event-driven DOM observation/reacquisition is used with only bounded fallback polling;
- when correct composer becomes available and empty, exactly one insert commit and one report insertion occur;
- wrong owner/conversation composer is never used;
- plate disappears only after successful insertion or explicit cancellation;
- content-script/page restart recreates wait from worker-owned delivery without duplicate insert/Send;
- downstream existing one-Send/Microphone semantics remain intact;
- occupied/missing-composer waiting performs zero provider replay.

## 12. Manual OFF cancellation / OFF -> ON readiness

Mandatory for the current repair.

Cancellation scope MUST remain narrow.

Manual OFF may delete the current owner operation only when it is the pending pre-insert report state:

- operation `status === delivering`;
- `delivery.mode === batch_watch_v1`;
- `delivery.phase === claimed`;
- worker insertion permission has not been committed.

Assert:

- eligible claimed pending report is deleted only for that owner;
- only that operation's composer waiter/plate is stopped;
- the cancelled report never reappears after re-enable;
- Manual OFF does NOT delete `requesting`/`quota_waiting` work;
- Manual OFF does NOT delete `insert_committed` delivery;
- Manual OFF does NOT delete `inserted` delivery;
- OFF flag is persisted before claimed-delivery cancellation;
- stale content runtime cannot obtain insert permission after OFF (`MANUAL_MODE_DISABLED` or equivalent fail-closed cancellation boundary);
- another Manual owner remains unchanged;
- unrelated Autorun owner remains unchanged;
- binding remains intact;
- credentials/settings outside the explicit Manual mode flag remain intact;
- verified analytics cache remains byte/structurally unchanged;
- quota state remains byte/structurally unchanged;
- `last_provider_request_at` remains unchanged;
- `next_allowed_at` remains unchanged;
- 60000/5000/65000 timing semantics remain unchanged;
- Retry-After extension state remains unchanged;
- cancellation/re-enable performs zero provider requests/replay;
- after OFF -> ON, worker public state reports Manual ready when no new operation is active;
- content UI state-sync makes new Ozon controls usable again rather than retaining old busy/disabled state;
- a new cold-cache request after OFF -> ON still obeys the previously persisted same-Seller deadline.

## 13. UI / bindings / owner isolation

Assert:

- Ozon controls bind structurally according to current ChatGPT/Alice architecture;
- native ChatGPT Copy remains independent;
- native Copy does not mutate bridge operation state;
- busy/ready button state follows worker-owned operation state;
- Manual toggle remains available for cancelling an active Manual pending report when Autorun itself is not the blocking owner;
- two ChatGPT owners do not overwrite each other's state/delivery;
- ChatGPT/Alice ownership remains isolated;
- one owner reaching quota due/delivery does not clear another owner's wait;
- content restart restores only the correct owner's durable state;
- no global current-conversation assumption.

## 14. Performance regression boundary

Where Performance support exists, assert:

- Seller changes do not alter Performance host/auth semantics;
- Performance-only requests do not invoke Seller capability probing;
- Seller quota/cache is not wrongly applied to unrelated Performance requests;
- no real Performance request occurs in the automated gate.

## 15. Browser/runtime robustness

Assert:

- MV3 service worker loads in accepted test browser;
- extension installs through accepted Puppeteer runtime path;
- content script initializes on supported synthetic pages;
- page/content lifecycle restart does not duplicate owner state, provider execution, insertion or Send;
- network interception proves zero real Seller/Performance calls;
- unexpected runtime/console failures invalidate the affected test;
- harness/environment failures are distinguished from production assertion failures.

## 16. Packaging gate

Only after every applicable functional block passes:

- build ZIP from exactly the tested production tree;
- exclude tests/reports/credentials/development artifacts;
- record ZIP SHA-256;
- fresh-extract;
- compare every production file byte-for-byte with tested candidate;
- rerun package integrity/syntax/manifest checks on fresh extraction;
- forbid handoff if package bytes differ from tested tree.

# Final Codex report contract

Report at minimum:

- tested deterministic candidate authority/commit;
- frozen base/artifact authority;
- exact patch/candidate hashes;
- expected/actual production inventory;
- expected/actual changed/protected files;
- each functional block above as `PASS|FAIL|NOT_APPLICABLE` only when genuinely absent/removed;
- terminal consolidated result;
- real Ozon request count;
- real Performance request count;
- validator production modifications: `0`;
- failure classification when not PASS;
- report-only branch and report commit.

A behavior present in the candidate may not be marked NOT_APPLICABLE merely because the harness failed to test it.

## Handoff decision

Operator handoff is authorized only when every applicable mandatory block passes and terminal marker is:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

This is automated/synthetic/browser QA, not logged-in live acceptance.

## Current v0.1.19 live status

As of 2026-08-18 the complete v0.1.19 logged-in live suite is still pending. Today's partial live work must not be treated as a full v0.1.19 live PASS. After this repair is fully gated, packaged and handed off, the complete live suite must be resumed separately.