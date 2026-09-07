# Ozon Bridge command-envelope contract

Status: **MANDATORY / SINGLE SOURCE OF TRUTH**  
Applies to: assistant-authored `OZON_API_V1` command syntax, discovery cardinality, batching semantics, Manual/Autorun presentation rules  
Runtime authority: `dist-step7-candidate/shared/ozon_contract.js` and the common batch path in `dist-step7-candidate/service_worker.js`

This document exists to prevent conversational or Markdown presentation conventions from being mistaken for Bridge protocol rules.

## 1. Canonical command envelope

One explicit Bridge API command is one command envelope:

```text
OZON_API_V1
{"operation":"allowed_alias","params":{}}
```

The semantic unit is:

`literal OZON_API_V1 marker -> optional whitespace/newlines -> one balanced JSON object`

The JSON object may contain only these top-level keys:

- `operation`
- `params`

Any other top-level key, including `args`, `method`, `url`, `headers`, credentials or transport fields, is not part of the command envelope contract and is rejected by validation. `params` defaults to `{}` if omitted where the selected operation permits an empty parameter object.

The prefix and JSON do **not** have to be on one physical line. A newline after `OZON_API_V1` is canonical and valid.

## 2. Multiple commands in one source text

A source text may contain one or multiple complete `OZON_API_V1` command envelopes.

`discoverCommands()` scans the source text for every `OZON_API_V1` marker, extracts the next balanced JSON object, and then continues scanning from the end of that object. Commands are therefore discovered in source order.

For `N` valid explicit command envelopes in one admitted batch:

`N explicit commands -> at most N sequential physical business provider requests`

This is compatible with the standing safety invariant:

`ONE_EXPLICIT_BUSINESS_COMMAND => AT_MOST_ONE_PHYSICAL_PROVIDER_REQUEST`

Multiple explicit commands do not authorize hidden retry, hidden pagination, hidden fan-out, hidden polling, replay or provider chaining.

## 3. Markdown code fences are NOT protocol boundaries

Markdown code blocks/fences are presentation and UI containers only.

They do not define:

- how many Bridge commands may exist in an assistant response;
- how many Bridge commands may exist in one captured text block;
- command order;
- provider request cardinality;
- batch membership.

Therefore all of these source shapes can contain two explicit commands from the parser's point of view:

### Two envelopes in one code fence

```text
OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}

OZON_API_V1
{"operation":"stocks_current","params":{"filter":{},"limit":1}}
```

### Two envelopes in separate code fences

Presentation may place the same two complete envelopes in separate Markdown blocks. Autorun receives the whole completed assistant message and discovers them in source order.

### Two envelopes in plain text

Markdown is not required by the parser. The protocol boundary remains each `OZON_API_V1` marker plus its balanced JSON object.

## 4. Manual vs Autorun scope

The protocol is the same in both modes; only the text capture scope differs.

### Manual mode

The extension's UI button is structurally attached to a selected assistant code block and normally passes the raw text of that selected block to the common discovery path.

Consequences:

- a selected Manual block may contain one or multiple command envelopes;
- only envelopes present in the selected block's captured raw text are discoverable in that Manual click;
- the code block is a UI capture boundary, **not** a command-envelope cardinality rule.

### Autorun mode

Autorun passes the completed assistant message through the common discovery path.

Consequences:

- command envelopes may appear anywhere in that admitted assistant source text;
- all discovered `OZON_API_V1` envelopes are queued in source order, subject to the normal local validation/admission rules.

Manual and Autorun are mutually exclusive execution modes. Their different capture scopes must never be converted into contradictory command syntax rules.

## 5. Explicit batch orchestration

When several reads are independent and all parameters are known before execution, prefer an explicit sequential batch in one assistant response rather than needless operator round trips.

When a later command depends on an earlier result, use stepwise execution. Examples include cursor/`last_id` continuation, a discovered report/file identifier, entitlement/privacy branching, causal diagnosis, or another real dependency.

Endpoint cardinality is not assistant-turn cardinality.

A provider endpoint that accepts one date/SKU/item per request may still be represented by several independent explicit Bridge command envelopes in one assistant response.

## 6. HELP/API mixing is a separate local rule

`OZON_HELP_V1` is a local guidance protocol, not a business API command.

The existing guidance contract rejects a source that mixes `OZON_HELP_V1` and `OZON_API_V1` in the same admitted assistant response. This special rule does not imply any one-command-per-response restriction for multiple `OZON_API_V1` envelopes.

## 7. Forbidden interpretations

The following must never be stated or inferred as Bridge protocol rules:

- one command must occupy one Markdown code block;
- one Markdown code block may contain only one Bridge command;
- one assistant response may contain only one `OZON_API_V1` command;
- one endpoint item/date per provider request means one command per assistant turn;
- `OZON_API_V1` and its JSON must be on one physical line;
- separate Markdown code fences are required for batching.

If a presentation choice uses one command per code block for readability, it must be described only as a presentation choice, never as a Bridge contract requirement.

## 8. Authority precedence

For command syntax/cardinality questions, use this precedence:

1. actual packaged runtime behavior in `shared/ozon_contract.js` and `service_worker.js`;
2. this `OZON_COMMAND_ENVELOPE_CONTRACT.md`;
3. current explicit-batch orchestration authority;
4. older design, roadmap, benchmark or conversational examples.

If an older document uses wording such as "block" or describes Manual code-block UI capture, that wording must be interpreted through this contract and cannot override runtime semantics.

## 9. Permanent regression requirements

The repository gate must prove against the actual candidate runtime that:

- prefix + newline is valid;
- top-level `operation`/`params` is accepted for a valid enabled alias;
- `args` is rejected as an unknown top-level field;
- two envelopes in one source string are discovered in order;
- two envelopes inside one Markdown fence are still discovered in order;
- surrounding prose/Markdown does not create command boundaries;
- active authoritative documentation does not reintroduce a one-command-per-response or one-command-per-code-block rule.

Required terminal marker:

`REG_COMMAND_ENVELOPE_CONTRACT_PASS`
