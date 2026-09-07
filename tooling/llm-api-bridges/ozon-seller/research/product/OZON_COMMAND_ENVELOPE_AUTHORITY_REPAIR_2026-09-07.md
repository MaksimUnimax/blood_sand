# Ozon command-envelope authority repair — 2026-09-07

Status: `ROOT_CAUSE_PROVEN__RUNTIME_UNCHANGED__AUTHORITY_LOCKED__CI_PENDING_AT_AUTHORING`
Branch: `docs/ozon-command-envelope-authority-2026-09-07`
Base runtime authority: `34fd8c12fb35d918c2d7c38bcccb4375cef38d79`

## Problem

An assistant-side orchestration statement incorrectly presented Markdown layout as a Bridge protocol constraint. The false inference was that command cardinality could be derived from code-block cardinality.

This was a documentation/orchestration ambiguity, not a runtime parser defect.

## Proven runtime truth

`dist-step7-candidate/shared/ozon_contract.js` is the executable command authority.

`normalizeCommand(raw)` permits only top-level keys:

- `operation`
- `params`

Any additional top-level key is rejected with `UNKNOWN_TOP_LEVEL_FIELD`.

`discoverCommands(source)`:

1. scans the supplied source text for `OZON_API_V1`;
2. skips whitespace after the marker;
3. extracts the next balanced JSON object;
4. parses/normalizes/preflights that command;
5. advances its cursor to the end of the extracted JSON object;
6. searches for the next `OZON_API_V1` marker;
7. preserves source order.

The parser does not parse Markdown fences as command delimiters.

Therefore:

- prefix + newline is valid;
- one source text can contain multiple complete command envelopes;
- several command envelopes can be located inside one Markdown code fence;
- several command envelopes can be located in separate Markdown code fences;
- Markdown layout is not command syntax/cardinality;
- one explicit business command remains bounded to at most one physical provider request;
- `N` explicit commands may form a sequential batch bounded to at most `N` physical provider requests.

## Manual vs Autorun distinction

The only legitimate role of a code block in current semantics is UI capture scope in Manual mode.

Manual mode normally passes the raw text of the selected code block to the common parser. If that captured text contains multiple command envelopes, the parser can discover multiple commands.

Autorun passes the admitted completed assistant source text to the same common discovery path and can discover multiple envelopes throughout that source text.

The difference is capture scope, not protocol grammar.

## Persistent repair

Added mandatory authority:

`tooling/llm-api-bridges/ozon-seller/OZON_COMMAND_ENVELOPE_CONTRACT.md`

README now loads it before other Ozon work authorities for command syntax/cardinality questions.

Updated explicit-batch orchestration authority:

`OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md`

It now separates:

- command envelope;
- assistant response;
- Manual code-block capture;
- physical provider request.

The active commercial roadmap was inspected and already has the correct `EXPLICIT_BATCH_FIRST_FOR_INDEPENDENT_READS` rule; it does not impose a Markdown-cardinality requirement.

Historical guided-discovery wording about a selected code block remains valid only as Manual UI capture description. The new authority explicitly has precedence over historical/documentation presentation wording.

## Permanent regression

Added:

`validation/command-envelope-contract-v1/run_command_envelope_contract_gate.mjs`

The gate executes the actual candidate runtime and proves:

- `OZON_API_V1` + newline + valid JSON is accepted;
- two envelopes in one source string are discovered in source order;
- two envelopes inside one Markdown fence remain two commands;
- surrounding prose/two presentation fences do not alter command discovery;
- `args` is rejected with `UNKNOWN_TOP_LEVEL_FIELD`;
- active documentation does not contain forbidden one-command-per-code-block/response rules;
- batch runtime boundary remains present.

The gate also runs the existing disabled-alias admission regression as an intersecting positive safety control.

CI workflow:

`.github/workflows/ozon-command-envelope-contract-2026-09-07.yml`

It runs on Linux and Windows and fails if any production runtime file differs from base `34fd8c12fb35d918c2d7c38bcccb4375cef38d79`.

## Dependency audit

Changed concept:
`assistant-authored command syntax/cardinality authority`.

Producer/consumer inventory:

1. literal `OZON_API_V1` marker producer;
2. balanced JSON extractor;
3. `normalizeCommand()` top-level validation;
4. `discoverCommands()` multi-marker scan and source ordering;
5. execution preflight;
6. `discoverBatchEntries()` mapping;
7. sequential batch queue;
8. physical provider request cardinality;
9. Manual selected-code-block capture;
10. Autorun full-message capture;
11. guidance HELP/API mixing rule;
12. README/read-first authority order;
13. explicit batch orchestration methodology;
14. active commercial roadmap batching rule;
15. historical guided-discovery UI wording;
16. permanent parser/documentation regression;
17. Linux/Windows CI;
18. packaged runtime immutability boundary.

State lifetime classification:

- command source text: per admitted Manual/Autorun event;
- discovery entries: per batch admission/durable batch owner as already implemented;
- Markdown DOM/code-block structure: page/UI lifetime only;
- command-envelope grammar: packaged runtime/static authority;
- documentation authority: repository-persistent;
- regression result: CI-run evidence only.

Dependency closure target:

```text
Unaccounted dependencies: 0
Stale active assumptions: 0
Available-but-unverified dependencies: 0
Runtime modifications: 0
```

## Patch-delivery classification

`EXECUTABLE_BRIDGE_PATCH_REQUIRED = NO`

`PRODUCTION_RUNTIME_CHANGED = NO`

`INSTALLABLE_ZIP_CHANGED = NO`

The installed runtime from the preceding accepted candidate remains byte-identical. This repair changes only persistent authority, regression coverage and CI enforcement.

Required final marker after CI success:

`REG_COMMAND_ENVELOPE_AUTHORITY_REPAIR_PASS`
