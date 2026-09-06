# Ozon AI Worker — Explicit Batch Orchestration Defect and Mandatory Rule

Date: 2026-09-06
Status: `CONFIRMED_PROCESS_DEFECT__AUTHORITY_CORRECTION_REQUIRED`
Scope: AI/benchmark orchestration methodology; not an executable Bridge transport defect
Runtime observed: `ozon-llm-api-bridge v0.1.19`

## Defect summary

During CAP-24 monthly SKU unit-economics collection, the AI repeatedly asked the operator to run one `finance_accrual_by_day` command, wait for the result, then request the next calendar day.

That workflow was unnecessarily serialized at the conversation/operator level.

`finance_accrual_by_day` accepts one `date` per explicit command, but the Bridge supports discovering and queueing multiple explicit `OZON_API_V1` commands from one assistant response and executes them as `sequential_batch_single_delivery`.

The defect was therefore not endpoint cardinality. The defect was failure to use the Bridge's explicit batch capability for independent commands whose parameters were already known.

## Direct Bridge evidence

Current `dist-step7-candidate/service_worker.js`:

- counts multiple occurrences of the `OZON_API_V1` command prefix in one assistant response;
- calls `discoverBatchEntries(commandText)`;
- records `${entries.length} queued OZON_API_V1 item(s)`;
- produces one batch report with `delivery_mode: "sequential_batch_single_delivery"` and `result_count = reports.length`.

Therefore these two invariants are compatible:

`ONE_EXPLICIT_BUSINESS_COMMAND => AT_MOST_ONE_PHYSICAL_PROVIDER_REQUEST`

and

`ONE_ASSISTANT_RESPONSE => MAY_CONTAIN_MULTIPLE_EXPLICIT_BUSINESS_COMMANDS`

For `N` explicit commands in one valid batch, the permitted execution model is:

`N explicit commands => at most N sequential physical provider requests`

There is still no hidden retry, hidden pagination, hidden fanout, polling or chaining.

## Root cause

### Primary authority defect

The active commercial-validation roadmap contained the mandatory rule:

`Exactly one OZON_API_V1 command is sent at a time.`

That rule predates / conflicts with the current explicit sequential batch capability and is now operationally harmful.

### AI reasoning error

The AI also conflated two different cardinalities:

1. provider-call cardinality per explicit command;
2. explicit-command cardinality per assistant turn.

The safety invariant constrains (1), not (2).

The AI incorrectly transformed:

`one explicit command => at most one physical request`

into:

`one assistant turn => exactly one explicit command`.

That inference is invalid.

## CAP-24 impact

The mistake caused the operator to manually execute one date at a time for `finance_accrual_by_day`, even though many remaining August first-page requests were independent and known in advance.

Consequences:

- unnecessary operator round trips;
- slower evidence collection;
- higher opportunity for context drift between days;
- repeated manual copy/paste burden;
- needless interruption of the business workflow;
- false impression that a one-date provider endpoint requires a one-command conversation turn.

Already-completed CAP-24 dates remain valid evidence. The defect affects orchestration efficiency, not the correctness of those provider responses.

## Mandatory replacement rule

`EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS`

Before requesting a sequence of multiple Bridge reads, the AI MUST classify the sequence as either `INDEPENDENT_KNOWN_UPFRONT` or `DEPENDENT_STEPWISE`.

### A. Independent known-upfront reads

If all command parameters are already known and no later command depends on the result of an earlier command, the AI MUST prefer an explicit sequential batch rather than forcing one operator round trip per command.

Examples:

- the same read operation for several already-known dates;
- independent reads for several already-known SKUs;
- independent control reads where each command can be interpreted separately;
- a fixed set of business reads whose parameters are frozen before execution.

The assistant response may therefore contain multiple complete `OZON_API_V1` blocks.

Each block remains an explicit business command. The Bridge may execute them sequentially and return one batch delivery.

### B. Dependent stepwise reads

Use one-at-a-time execution only when the next command cannot be safely determined before inspecting the previous result.

Examples:

- pagination/cursor/`last_id` continuation where the next token is returned by the previous call;
- an ID needed by the next command is discovered in the prior response;
- causal diagnosis where an intervening result changes the next experiment;
- a write/side-effect sequence requiring validation between operations;
- entitlement/privacy/safety branching requiring inspection before continuation;
- a stop condition may make later calls unnecessary;
- provider behavior requires evidence review before deciding whether another call is justified.

Endpoint cardinality by itself is NOT a reason for stepwise conversation execution.

## Batch sizing rule

Do not assume unlimited batch size merely because multiple commands are supported.

Choose a bounded batch large enough to remove needless operator round trips but small enough that:

- returned evidence remains inspectable;
- one oversized response does not create avoidable output/materialization risk;
- per-command failures can still be attributed cleanly;
- provider or Bridge documented limits are respected.

If no hard batch-size limit is proven, do not invent one as a contract. Use a reasoned bounded chunk and state that the chunk size is an orchestration choice, not a provider rule.

## Failure handling inside a batch

`NO_SKIP_ON_FAILURE` applies per batch item.

A batch does not authorize hidden retry or skipping a failed command. After batch delivery:

1. inspect every logical result;
2. record each command's physical request count/status;
3. diagnose any failed item before treating its evidence class as complete;
4. do not repeat already successful items without a reason;
5. continue only the missing/dependent work.

## Context-recovery instruction

This rule must be loaded from persistent project authority, not trusted to conversational memory.

When restoring Ozon commercial-validation work in a new chat, the AI must read the active commercial roadmap and this rule before constructing multi-call execution plans.

Mandatory mental check before emitting repeated API commands:

`CAN_THESE EXPLICIT COMMANDS BE KNOWN UPFRONT?`

- YES -> batch them explicitly where practical.
- NO -> execute stepwise and explain the dependency.

The AI must never again infer `one endpoint item/date per command` to mean `one command per assistant turn`.

## CAP-24 correction

For the remaining August `finance_accrual_by_day` first-page reads, calendar dates are known upfront and independent.

Therefore the default plan is now explicit sequential batches of multiple dates, not one operator round trip per date.

If an individual day returns non-empty `last_id`, that continuation is dependent and is issued later as a separate explicit command using the returned token.

Completed first-page dates do not need to be repeated.

## Classification

`DEFECT_CLASS = AI_ORCHESTRATION_AND_OUTDATED_AUTHORITY_RULE`

`BRIDGE_BATCH_CAPABILITY = PRESENT`

`EXECUTABLE_BRIDGE_PATCH_REQUIRED = NO`

`DOCUMENTATION_METHODOLOGY_REPAIR_REQUIRED = YES`
