# Ozon Bridge — mandatory full Codex gate before operator handoff

Status: `MANDATORY_PRE_OPERATOR_HANDOFF_GATE`
Scope: `tooling/llm-api-bridges/ozon-seller/`

## Purpose

This is the permanent project-wide regression gate that must be passed immediately before ChatGPT hands an installable/testable Ozon Bridge build to the operator.

It is deliberately NOT the normal development test loop.

During implementation and repair work, test only the production code being changed and the dependencies directly traversed by that change. Do not repeatedly run the entire historical regression matrix after every edit.

Immediately before operator handoff, freeze one exact candidate and run this entire gate as ONE consolidated Codex execution against that exact candidate. The extension must not be handed to the operator unless the consolidated gate passes.

## Living-gate rule

This document is a maintained executable acceptance contract, not historical evidence.

Whenever production functionality is added or materially changed:

- add the corresponding Codex-testable behavior and regression assertions to this gate before the next operator handoff;
- include dependencies and invariants that the new behavior can affect;
- keep tests at the behavioral/system boundary where practical, not only source-text assertions.

Whenever production functionality is intentionally removed:

- remove tests that require the removed behavior;
- preserve tests for remaining invariants and neighboring functionality;
- document the removal in the normal project history/changelog.

Do not keep obsolete tests merely because they once existed. Do not weaken still-valid tests merely to make a new candidate pass.

## Separation of test stages

### Development / repair stage

Before the final handoff gate:

- run syntax/static checks needed for the changed files;
- run targeted unit/VM/browser tests for the changed behavior;
- run targeted dependency tests for code paths directly affected by the change;
- reproduce a reported defect with a RED test when practical before changing production;
- after the fix, make the targeted tests GREEN;
- do not require the entire project-wide gate after every implementation edit.

### Pre-operator handoff stage

Only when the candidate is believed complete:

1. freeze an exact candidate commit;
2. record the exact production inventory and hashes;
3. prepare one standalone Codex prompt pinned to that exact candidate;
4. Codex runs the FULL gate below in ONE consolidated execution;
5. Codex does not edit production;
6. Codex publishes a report-only validation branch/commit;
7. ChatGPT reads the full report from GitHub, not only the short Codex summary;
8. if every mandatory block passes, package exactly the tested production tree;
9. fresh-extract the package and verify byte identity/hashes;
10. only then hand the build to the operator for real manual/live testing.

Any production change after the full gate invalidates that gate and requires a new full consolidated run before handoff.

## Codex execution constraints

The final validation prompt must require:

- live GitHub as source of truth;
- one exact candidate commit SHA;
- exact expected production file inventory and hashes;
- accepted Windows QA environment unless explicitly superseded by a newer accepted harness;
- Chrome for Testing / Puppeteer extension runtime path for browser assertions;
- mocked/intercepted provider behavior;
- no normal operator Chrome profile;
- no real Seller credentials;
- no real Performance credentials;
- `REAL_OZON_REQUESTS=0`;
- `REAL_PERFORMANCE_REQUESTS=0`;
- no production edits by Codex;
- no test weakening, skipped mandatory blocks, or replacement of behavioral assertions with source-text-only checks;
- failure classification as production behavior, harness fixture, harness error, or environment error;
- report-only validation branch;
- STOP after reporting.

## One consolidated execution requirement

The complete gate must be invoked as one top-level runner/command. The runner may internally execute multiple worker/browser/static/package blocks, but the final validation is one consolidated run with one terminal PASS/FAIL result.

The consolidated runner must fail if any mandatory block fails, is skipped unexpectedly, cannot verify its target candidate, observes unauthorized network activity, or detects production drift.

Required terminal umbrella marker:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

No operator package handoff is allowed without that marker plus a reviewed full GitHub report.

# Full functional regression inventory

This inventory describes all functionality currently expected to be Codex-testable. Keep it synchronized with production as the bridge evolves.

## 1. Candidate integrity and reconstruction

Required assertions:

- exact candidate commit is the requested candidate;
- exact baseline/reconstruction authority is correct;
- production inventory is exact;
- expected changed files match the authorized scope;
- protected files are byte-identical where the scope declares them protected;
- all production JavaScript passes `node --check`;
- `manifest.json` parses;
- no unintended host-permission or extension-permission expansion;
- reconstruction/fresh materialization produces the expected production hashes;
- no test/evidence/dev files are mixed into the production extension tree.

## 2. Command discovery and strict contract

Required assertions include current supported command surfaces:

- literal Ozon protocol discovery works in supported ChatGPT/Alice code-block/message forms;
- arbitrary surrounding prose/Markdown does not create unrelated commands;
- supported separators retained by the current contract continue working;
- malformed JSON remains malformed and is not silently repaired;
- invalid/unsupported command values fail before provider execution;
- malformed/pre-execution failures execute zero provider requests;
- `analytics_data` date/dimension/metric/filter/sort/limit/offset validation remains strict;
- product-query date/SKU/sort/page constraints remain strict;
- removed/blocked operations remain unavailable;
- `posting_fbs_get` remains blocked due to customer-PII boundary.

## 3. Provider/security boundary

Required assertions:

- fixed Seller/Performance hosts only;
- assistant text cannot choose arbitrary URL, host, method, headers or credentials;
- mutation/write operations remain unavailable unless explicitly added by a future accepted design;
- raw Seller/Performance credentials never enter AI-visible output;
- raw provider error bodies/unsafe fields remain sanitized;
- customer PII is not exposed;
- no hidden retry;
- no hidden pagination loop;
- no hidden fan-out;
- no hidden report polling;
- no invented generic data caps or silent truncation;
- wrong tab/conversation/binding fails closed.

## 4. Seller capability / entitlement

Required assertions:

- internal seller capability probe is not AI-callable;
- internal seller-info path/host/method/auth cannot be supplied by assistant text;
- raw seller-info company/identity fields are not returned to AI;
- universal analytics paths require zero capability probes;
- capability-sensitive logical batch performs at most one fresh probe for the whole relevant batch;
- many capability-sensitive commands do not produce one probe per command;
- worker-restart/in-flight capability state does not cause blind probe replay;
- entitlement states remain explicit;
- universal/restricted mixed analytics is filtered only according to reviewed semantics and reports partial omission explicitly;
- all-restricted/no-executable scope performs zero analytics business calls;
- restricted dimension/filter/sort/history semantics fail closed instead of silently changing query meaning;
- Performance-only flow performs zero Seller capability probes.

## 5. Query planner / coalescing / projection

Required assertions:

- only contiguous compatible analytics commands coalesce;
- differing dates/dimensions/filters/sort/limit/offset/other normalized semantics do not merge;
- ordered metric union is deterministic;
- metric union respects the provider maximum currently encoded by the contract;
- duplicate/ambiguous metric cases fail or remain uncoalesced according to current reviewed behavior;
- compatible logical commands can map to one physical provider request;
- each original logical command receives its own logical result/provenance;
- response projection uses verified physical metric order;
- unprovable projection fails closed;
- a failed projection does not replay the provider request;
- provider HTTP errors fan out safely to logical members without retry;
- worker restart after an already-started physical group does not blindly replay it.

## 6. Global Seller quota scheduler

Required assertions:

- reviewed quota family remains `seller.analytics_data.v1` unless intentionally changed later;
- current reviewed provider minimum remains 60000 ms unless intentionally changed later;
- current bridge launch safety remains 5000 ms unless intentionally changed later;
- current effective guarded interval remains 65000 ms unless intentionally changed later;
- same Seller account shares quota across tabs, conversations and supported AIs;
- different Seller accounts have independent buckets;
- Api-Key rotation for the same Seller account preserves account-scoped quota identity while credential revision changes;
- raw credentials are absent from quota persistence;
- concurrent acquisition grants only one permit;
- cache miss cannot bypass quota;
- coalesced one-physical-request group consumes one permit;
- durable `quota_waiting` survives MV3 worker restart before provider attempt;
- due wake produces exactly one provider call;
- no provider call starts before `next_allowed_at`/effective guard;
- already-attempted/requesting work is not replayed on startup/alarm;
- no immediate retry exists;
- Retry-After can only extend, never shorten, the persisted next-allowed time;
- public quota state contains safe timing metadata but no account/credential secrets.

## 7. Provider response verifier and errors

Required assertions:

- successful analytics response shape/cardinality is verified before logical projection/cache storage;
- invalid successful response becomes a safe contract-mismatch result after the one provider attempt;
- verifier failure causes no retry;
- HTTP 429 is represented safely and may extend Retry-After state without retry;
- transport failure records provider-attempt provenance correctly;
- pre-fetch credential/storage failures record zero provider requests;
- `automatic_retry:false` remains truthful throughout provider/bridge errors.

## 8. Verified analytics cache and prefetch

Required assertions:

- only successful verified analytics responses are cacheable;
- cache lookup happens before quota acquisition because a hit performs no provider request;
- current TTL remains 60000 ms unless intentionally changed later;
- same Seller + exact non-metric semantics + verified metric superset may hit;
- different Seller misses;
- incompatible dates/dimensions/filters/sort/limit/offset/window semantics miss;
- expired entry misses;
- provider errors do not cache;
- malformed/unverified responses do not cache;
- raw credentials are absent from serialized cache state;
- safe superset projection is deterministic;
- cache hit has `external_request_executed:false` and truthful cache provenance;
- fixed `analytics_basic_metrics_v1` prefetch applies only to its reviewed universal metric subset;
- prefetch may request the current reviewed physical universal superset while preserving all other query semantics;
- restricted metrics are never added by the universal prefetch profile;
- following compatible request may be served from verified cache with zero second provider call and zero second quota acquisition;
- cache lookup/hit does not corrupt quota state.

## 9. Manual/Autorun common batch engine

Required assertions:

- one logical command is handled as a one-entry batch;
- multi-command discovery preserves logical order;
- provider execution remains strictly serial where multiple physical requests are required;
- malformed/validation entries do not prevent safe handling of later entries where current semantics allow continuation;
- completed entries are not replayed after recovery;
- old-worker `requesting` ambiguity fails closed without blind replay;
- no intermediate chat delivery is created when current batch semantics require one final batch report;
- one final `OZON_BATCH_RESULT_V1` preserves logical result count/order and truthful physical request count;
- Manual and Autorun ownership rules remain separated while sharing the intended common worker batch engine.

## 10. Delivery FSM — normal empty-composer path

Required assertions:

- report-ready on an empty correct target composer enters the existing insertion path;
- report is inserted into the correct owner/conversation only;
- delivery commit remains the irreversible browser-send permission boundary;
- recognized active Send is clicked at most once for the staged delivery;
- later ordinary user Send controls are not accidentally clicked by the same delivery;
- disabled Send, Stop, Unknown and Microphone are never clicked as Send;
- Microphone remains the current success marker unless a later accepted architecture explicitly changes it;
- successful confirmation clears transient delivery state and returns Manual readiness;
- delivery recovery does not replay provider execution.

## 11. Delivery FSM — occupied composer / pending report

This block is mandatory once the occupied-composer repair is implemented and becomes part of the candidate under test.

Required assertions:

- report-ready + unrelated non-empty target composer never overwrites or clears operator text;
- pending report remains durable/recoverable;
- a persistent operator-visible plate says `Очистите поле ввода, чтобы получить отчёт.`;
- plate does not auto-expire while the report is pending and not inserted;
- event-driven composer observation/reacquisition is used, with only bounded fallback polling for resilience;
- clearing the correct composer causes exactly one report insertion;
- wrong conversation/owner composer is never used;
- plate is removed only after successful insertion or explicit cancellation;
- content-script/page recovery restores pending wait without duplicate insertion or Send;
- the existing downstream one-Send/Microphone delivery semantics remain intact.

## 12. Manual OFF cancellation and re-enable

This block is mandatory once the occupied-composer repair is implemented.

Required assertions:

- Manual OFF cancels/deletes ONLY the current pending Manual request/result/delivery of that owner;
- only that operation's composer-wait watcher/plate is destroyed;
- only that owner operation is released;
- other Manual owners remain unchanged;
- unrelated Autorun owners remain unchanged;
- conversation binding remains intact;
- credentials/settings outside the explicit Manual mode flag remain intact;
- verified analytics cache remains unchanged;
- provider quota state remains unchanged;
- `last_provider_request_at` remains unchanged;
- `next_allowed_at` remains unchanged;
- 60000/5000/65000 timing semantics remain unchanged;
- Retry-After extension state remains unchanged;
- cancellation/re-enable performs zero provider requests and no replay;
- after OFF -> ON the owner can accept a new Manual operation;
- a new cold-cache operation after OFF -> ON still obeys the previously persisted quota deadline rather than receiving a fresh/reset timer.

## 13. UI / bindings / owner isolation

Required assertions:

- Ozon controls bind structurally to supported ChatGPT code blocks/messages according to current architecture;
- native ChatGPT Copy remains independent and usable;
- bridge controls do not mutate state when native Copy is clicked;
- busy/ready button state follows worker-owned operation state;
- two ChatGPT owners do not overwrite each other's status/delivery;
- ChatGPT and Alice ownership/binding remain isolated;
- one owner reaching quota due/delivery state does not clear another owner's wait;
- content-script restart restores only the correct owner's durable state;
- no global current-conversation assumption is introduced.

## 14. Performance API regression boundary

Required assertions where current package contains Performance support:

- Seller changes do not alter Performance host/auth semantics;
- Performance-only paths do not invoke Seller capability probes;
- Seller quota/cache state is not incorrectly applied to unrelated Performance requests;
- no real Performance network request occurs during automated gate.

## 15. Browser/runtime robustness

Required assertions:

- MV3 service worker loads successfully in the accepted test browser;
- extension installs through the accepted runtime install path;
- content script initializes on supported synthetic pages;
- page/content-script lifecycle restart does not duplicate owner state, provider execution, report insertion or Send;
- network interception records zero real Seller/Performance requests;
- no unexpected extension/runtime console error invalidates a tested behavior;
- test fixture failures are distinguished from actual production assertion failures.

## 16. Packaging gate

After the full functional candidate passes and before operator handoff:

- build the production ZIP from exactly the tested production tree;
- exclude tests, reports, credentials and development artifacts from the ZIP;
- record package SHA-256;
- fresh-extract ZIP;
- compare every production file byte-for-byte against the independently tested candidate;
- rerun at minimum package integrity/syntax/manifest checks against fresh extraction;
- if package bytes do not correspond to the tested tree, handoff is forbidden.

# Final report contract

The final Codex report must identify at minimum:

- tested candidate SHA;
- expected/actual production inventory;
- expected/actual changed and protected files;
- each functional block above as PASS/FAIL/NOT_APPLICABLE only when genuinely removed/not yet part of production;
- terminal consolidated result;
- real Ozon request count;
- real Performance request count;
- production modifications by validator: 0;
- failure classification if not PASS;
- report-only branch and report commit.

A mandatory behavior that exists in the candidate may not be marked NOT_APPLICABLE merely because the harness did not test it.

## Handoff decision

Operator handoff is authorized only if all currently applicable mandatory blocks PASS and the umbrella marker is:

`OZON_FULL_PRE_OPERATOR_HANDOFF_GATE_PASS`

This is an automated/synthetic/browser-QA gate. It does not claim logged-in live acceptance. Operator live testing remains a separate final field gate.

## Current v0.1.19 live status

As of 2026-08-18, the complete v0.1.19 live suite is still pending. Today's partial live work must not be treated as a full v0.1.19 live PASS. After the occupied-composer delivery defect is repaired, independently gated, packaged and handed off, the complete live suite must be resumed separately.
