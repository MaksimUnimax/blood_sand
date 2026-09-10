# Alice ↔ Ozon Bridge — hardening ledger (CURRENT)

Status: ACTIVE / OPEN ISSUES  
Purpose: single current tracker for every defect, confusion, missing LLM instruction, Bridge-response problem and architecture change discovered while testing Alice against Ozon Bridge.  
Repository: `MaksimUnimax/blood_sand`  
Working branch at creation: `feature/product-control-plane-server-2026-09-04`  
Branch HEAD observed before creation: `d5c5095a95b91b6b455902b677fab9351efd7e2e`  
Created: 2026-09-10

## Working rule

This file is the current Alice hardening authority. Do not create parallel `FINAL`, `CORRECTED`, `V2`, or chat-only issue lists. Update this file as issues are investigated and fixed.

Allowed issue states:

- `OPEN` — observed and not fixed;
- `DESIGN_APPROVED` — target correction agreed, not implemented;
- `IMPLEMENTED_UNVERIFIED` — code/text changed, live regression not yet passed;
- `REGRESSION_PASS` — the exact failure class passed a clean repeat test;
- `CLOSED` — correction accepted after regression;
- `WONT_FIX` — intentionally preserved with documented reason.

Never mark an issue fixed from reasoning alone. A fix requires implementation plus a clean regression of the same failure class.

The goal of Alice testing is not to hand-hold Alice manually. When possible, missing operational knowledge must be supplied by Bridge service responses (`OZON_GUIDANCE_RESULT_V2`, `OZON_RESULT_V1`, recovery/refinement metadata), so the same hardened Bridge can guide other weak or unfamiliar LLMs later.

## Current issue index

| ID | Status | Class | Short description |
|---|---|---|---|
| ALICE-001 | OPEN | startup contract | AI may interpret Ozon Bridge as a native AI tool/API integration and refuse because it has no direct Ozon access |
| ALICE-002 | OPEN | operation discovery | Alice invents operation aliases instead of using guidance |
| ALICE-003 | OPEN | command grammar | Alice confuses HELP/API envelopes, bare JSON, batch markers and top-level fields |
| ALICE-004 | OPEN | UX / command rendering | Alice needed operator instruction to render Ozon commands as click-to-copy code blocks |
| ALICE-005 | OPEN | entitlement / minimal evidence | Alice added unnecessary restricted analytics metrics and converted an otherwise usable request into a Premium-only request |
| ALICE-006 | OPEN | fulfillment coverage | Alice treated FBS as the sales fallback and initially omitted FBO |
| ALICE-007 | OPEN | evidence scope | Alice risked treating one fulfillment surface as store-wide sales |
| ALICE-008 | OPEN | finance semantics | Alice mixed posting, finance-accrual and advertising cohorts/denominators |
| ALICE-009 | OPEN | arithmetic / denominator | Alice produced inconsistent counts and introduced an unexplained denominator of 25 sales |
| ALICE-010 | OPEN | Bridge response guidance | Current error/guidance reports are not deterministic enough for weak-model recovery |
| ALICE-011 | DESIGN_APPROVED | mixed command architecture | Current HELP/API mixing restriction conflicts with desired one-turn multi-surface collection |
| ALICE-012 | OPEN | provider/network recovery | European/VPN egress repeatedly produced provider 429 while later Russian egress produced successful Ozon responses; exact same-operation A/B still needs preservation |
| ALICE-013 | DESIGN_APPROVED | 429 recovery | Provider-side retryable 429 should be handled inside Bridge rather than immediately handed back to the LLM, subject to bounded/audited recovery rules |

---

## ALICE-001 — AI thinks Bridge must be its own native integration

**Status:** OPEN

### Observed

Alice previously responded that it had no access to Ozon/API tools and therefore could not act as the requested intermediary.

### Root cause

The startup wording did not separate clearly enough:

`AI writes a text command`  
from  
`the user's browser extension executes the Ozon request`.

### Required correction

The startup contract must state explicitly that:

- the AI does not need native Ozon API access;
- the AI does not need a browser/plugin/API tool of its own;
- the AI only emits canonical text markers and JSON;
- the external user-side Bridge executes requests and inserts results back into the chat;
- lack of native Ozon access is not a valid reason to refuse Bridge work.

### Regression

Fresh Alice chat → startup prompt → Alice must accept the external-executor model and proceed without checking for its own Ozon tool.

---

## ALICE-002 — invented operation aliases

**Status:** OPEN

### Observed examples

Alice invented aliases including:

- `sales_last_24h`;
- `campaign_stats_last_24h`;
- `campaign_statistics_list`.

These are not valid evidence of Bridge capability and caused local `UNSUPPORTED_OPERATION` recovery instead of direct use of the known guidance mechanism.

### Required correction

For unknown operations, Bridge guidance/error output should not merely say that the operation is unsupported. It should tell the LLM deterministically:

1. do not rename or guess another operation;
2. use the suggested cluster/section;
3. when a precise next HELP command is known, provide its exact canonical shape;
4. only use operation aliases returned by current guidance.

### Regression

Repeat the same natural-language task in a fresh Alice chat. No invented operation alias before a relevant `OZON_HELP_V2` result.

---

## ALICE-003 — command grammar confusion

**Status:** OPEN

### Observed

During one live session Alice variously:

- wrapped `OZON_HELP_V2` as an `OZON_API_V1` operation;
- emitted bare JSON that contained no canonical command marker;
- invented `OZON_BATCH_REQUEST_V1`;
- added `cluster` as an invalid top-level API field;
- emitted multiple HELP markers in one response despite the current HELP exact-object restriction;
- mixed HELP and API in one response and received `MIXED_HELP_AND_API`.

### Required correction

Every grammar error report should contain a short machine-directed correction block with:

- the exact accepted API form;
- the exact accepted HELP form;
- allowed top-level keys;
- forbidden form that was just observed;
- the single safest next action.

Do not rely on the weak model remembering the startup prompt after many long Ozon results.

### Regression

A grammar error must recover in one guidance turn without Alice inventing a new protocol marker or envelope.

---

## ALICE-004 — copyable command rendering not stable

**Status:** OPEN

### Observed

The operator had to say that Ozon commands must always be rendered in a click-to-copy code block.

### Required correction

The startup prompt should make presentation explicit but minimal: every Bridge command must be isolated in a copyable code block with no unrelated prose inside the block. The semantic parser must continue to depend on the marker+JSON contract, not Markdown formatting.

### Regression

Fresh Alice chat produces copyable Bridge command blocks without operator correction.

---

## ALICE-005 — unnecessary restricted analytics metrics

**Status:** OPEN

### Observed

For a task requiring sales revenue and ordered units, guidance exposed `analytics_data`, but Alice expanded the requested metrics to include additional values such as delivered units, returns and cancellations. The Bridge capability planner then correctly returned `SUBSCRIPTION_REQUIRED` for the restricted metric set and did not execute the business request.

The core task did not require those extra restricted metrics.

### Required correction

The `sales_analytics` guidance for `analytics_data` should provide explicit minimal recipes and metric-level entitlement semantics, including at least:

- `revenue` + `ordered_units` as the minimal recipe for yesterday sales/revenue;
- which optional metrics are subscription-sensitive;
- an LLM instruction: request only evidence needed for the user's task; do not add optional metrics speculatively because one restricted metric can block the whole request.

### Regression

The same sales task must produce the minimal available metric set without being upgraded to Premium by Alice.

---

## ALICE-006 — FBO omitted in sales fallback

**Status:** OPEN

### Observed

When `analytics_data` was blocked by the model's own over-broad metric choice, Alice fell back to postings. It chose FBS because that section had more operations and initially treated the FBS result as the useful sales result. The operator had to remind Alice that FBO also exists.

### Root cause

The guidance exposes separate `fbo_postings`, `fbp_postings`, and `fbs_postings` sections but does not teach the LLM the coverage relationship when it is using postings as a fallback for store-wide sales.

### Required correction

Add fulfillment coverage guidance:

- FBO, FBS and FBP are separate scopes;
- `operation_count` is not a relevance ranking;
- a store-wide sales fallback must determine which fulfillment schemes are relevant and collect all required schemes;
- one scheme must never be presented as all store sales;
- cancellations and posting/order duplication need explicit handling.

### Regression

A store-wide sales fallback must not require the operator to remind the model about FBO/FBS/FBP coverage.

---

## ALICE-007 — partial surface treated as complete sales evidence

**Status:** OPEN

### Observed

Alice was ready to use the two FBS postings as "sales" before full fulfillment coverage had been established.

### Required correction

Bridge result/guidance metadata should make scope explicit enough for the LLM to say what the result covers and what it does not cover. For posting lists used as a sales proxy, guidance must warn that created/in-process postings are not automatically equivalent to marketplace sales analytics or finance accruals.

### Regression

Alice explicitly states the scope before using postings in a store-wide total.

---

## ALICE-008 — finance cohort and denominator semantics mixed

**Status:** OPEN

### Observed

Alice combined:

- FBO/FBS posting-created cohorts;
- Performance advertising-attributed orders;
- finance accrual rows;
- account/day `NON_ITEM` charges;

as if they were one directly aligned population.

### Required correction

`finance_accrual_by_day` results/guidance should include LLM-facing evidence semantics such as:

- finance accrual date is a finance cohort and is not automatically the same as order creation date;
- POSTING row count is not automatically sales count;
- expose record count and stable unique business-key count separately where possible;
- `NON_ITEM` costs are not item-specific unless an allocation source exists;
- any per-unit allocation of account/day costs is an analyst calculation, not an Ozon fact;
- do not combine finance, postings and advertising denominators until the join/cohort relationship is proved.

### Regression

Alice must identify the denominator explicitly before reporting unit economics.

---

## ALICE-009 — inconsistent arithmetic and unexplained `25 sales`

**Status:** OPEN

### Observed

The live reasoning contained inconsistent interim arithmetic around cancelled FBO postings and finance ITEM totals. Most importantly, Alice later switched to a denominator of `25 sales` without evidence establishing that number and then used it to calculate per-unit finance, advertising cost and profit.

### Required correction

This is partly a model-quality defect, but Bridge can reduce the risk by returning bounded aggregate metadata when safe and mechanically derivable, for example:

- record count;
- unique posting/order/unit count;
- cancelled count;
- provider-supplied totals versus Bridge-calculated aggregates clearly labelled;
- explicit cohort/time basis.

The LLM must be told not to invent a denominator when counts disagree.

### Regression

Unit economics must use an evidenced denominator or explicitly remain unresolved.

---

## ALICE-010 — weak recovery text in Bridge reports

**Status:** OPEN

### Observed

Long error/guidance loops showed that generic fields such as `error`, `descriptor`, and `choices` are insufficient for a weak model after context becomes large. Alice repeatedly invented the next envelope or protocol despite receiving correct rejection codes.

### Required correction

Current Bridge response forms should gain bounded LLM-directed fields/text, without turning Ozon business data into instructions. Candidate structure:

```text
llm_instruction
next_valid_actions
canonical_command_examples
scope_warning
entitlement_warning
recovery_instruction
```

These must be Bridge-owned service instructions, clearly separated from Ozon-returned user/content data.

### Regression

Each known error class (`UNSUPPORTED_OPERATION`, `NO_OZON_COMMANDS`, `UNKNOWN_TOP_LEVEL_FIELD`, `MIXED_HELP_AND_API` or its replacement behavior, subscription/policy blocks) gets a deterministic one-turn recovery fixture in Alice.

---

## ALICE-011 — mixed HELP/API restriction conflicts with target workflow

**Status:** DESIGN_APPROVED

### Current historical rule

The guided-command design deliberately made HELP a local, stateless, zero-provider action and rejected a response that mixed HELP and API. The documented rationale was that help selection and business execution were treated as different intentions and that fail-closed separation simplified safety, quota isolation and weak-model compliance.

### New owner requirement — 2026-09-10

The restriction is no longer the desired product behavior.

The LLM must be able to issue, in one assistant response, a heterogeneous ordered batch such as:

```text
OZON_API_V1
{"operation":"KNOWN_SALES_OPERATION","params":{...}}

OZON_HELP_V2
{"cluster":"advertising_performance"}

OZON_API_V1
{"operation":"ANOTHER_ALREADY_KNOWN_OPERATION","params":{...}}
```

Target Bridge behavior:

1. scan the full assistant response in appearance order;
2. structurally discover both API and HELP entries;
3. validate each entry independently;
4. HELP entries are resolved locally with `external_request_executed=false` and consume no provider quota;
5. valid API entries execute sequentially through the existing provider queue;
6. one bad local/help/API entry must not automatically suppress unrelated valid entries unless a security boundary requires fail-closed rejection;
7. collect all entry results in original order;
8. deliver one combined `OZON_BATCH_RESULT_V1` after the batch completes;
9. preserve per-entry request counters and overall logical/physical counters.

### Important dependency boundary

A HELP result cannot magically make a later API command in the **same already-authored assistant message** valid if that later command depends on operation/IDs/parameters that the LLM did not know before seeing the HELP result.

Therefore mixed batches support this correctly:

- known sales API + advertising HELP in one turn;
- known sales API + known advertising API in one turn;
- multiple independent HELP selections in one turn, if V2 is extended to support them;

but a dependent flow remains two model turns:

`HELP → guidance result → LLM chooses returned operation → API command`.

The Bridge must not silently invent an operation on behalf of the LLM just to collapse that dependency.

### Regression target

One Alice response containing a known sales API command and an advertising HELP command must produce one combined batch report, with the sales request executed exactly once and the HELP result resolved locally, without `MIXED_HELP_AND_API`.

---

## ALICE-012 — provider 429 changes with egress/IP environment

**Status:** OPEN

### Observed

In the previous Alice session, real `analytics_data` requests through the European/VPN egress repeatedly returned provider HTTP 429. After switching to a Russian IP, the subsequent live session produced successful HTTP 200 Ozon responses for multiple real Seller/Performance operations, with no 429 in that session.

### Current conclusion

Egress/IP/geography is a demonstrated environmental factor in this test setup, but the cleanest exact-operation A/B is still pending because the Russian-IP session did not repeat the exact same minimal `analytics_data` request that previously returned 429.

### Required follow-up

Preserve a controlled same-command/same-account/same-body A/B where the only intended difference is egress. Do not generalize the finding to every Ozon endpoint or account until tested.

---

## ALICE-013 — provider-side 429 should be recovered inside Bridge

**Status:** DESIGN_APPROVED

### Owner requirement

A retryable provider-side 429 should not immediately terminate the business workflow and force the LLM/operator to resubmit the same request manually.

Desired product behavior:

- one logical API command may own multiple physical retry attempts only for a reviewed retryable transport/provider class such as 429;
- retries must preserve the exact physical business request unless an explicit reviewed recovery policy says otherwise;
- retry state must be persisted across MV3 service-worker suspension;
- provider `Retry-After` should be honored when actually present;
- otherwise use reviewed bounded backoff/jitter policy;
- no duplicate provider replay after a successful response;
- the LLM should normally receive the final successful business result, not every transient 429;
- internal audit must retain logical request count, physical attempt count, attempt statuses and elapsed recovery time;
- there must be a terminal safety bound/operator abort path for persistent failures.

This changes the old invariant `one OZON_API_V1 = at most one physical request`. The new intended invariant is `one OZON_API_V1 = one logical business request`, with controlled physical retries only for explicitly allowlisted retryable recovery classes.

### Regression

Synthetic and live-safe tests must prove exact-request retry, no concurrent retries, no replay after success, persistence across worker suspension, bounded terminal failure, and truthful physical attempt accounting.

---

## Architecture note — response forms are part of the product

During Alice hardening, preserve the exact current forms of Bridge responses and track changes. The objective is to improve the information the LLM receives from the extension itself rather than growing an unbounded startup prompt.

For every response-form correction preserve:

```text
RESPONSE_TYPE =
CLUSTER =
SECTION =
BEFORE =
OBSERVED_AI_FAILURE =
CHANGE =
WHY =
AFTER =
REGRESSION_TEST =
STATUS =
```

The main response families currently under hardening include:

- `OZON_GUIDANCE_RESULT_V2` cluster menu;
- `OZON_GUIDANCE_RESULT_V2` section selection;
- unsupported/invalid command guidance;
- subscription/capability planning result;
- privacy/policy block result;
- Seller API successful result;
- Performance API successful result;
- quota/rate-limit recovery result;
- `OZON_BATCH_RESULT_V1` combined report.

Do not erase the pre-fix form when a correction is made; preserve `BEFORE` and regression evidence in this ledger or its linked response-form authority.
