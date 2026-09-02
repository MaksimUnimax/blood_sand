# Qwen authenticated route observation — 2026-09-02

Status: OPERATOR_OBSERVED_REQUIRES_TARGETED_REVALIDATION
Scope: Qwen only

## Observation

The operator supplied an authenticated Qwen conversation URL after authorization and one sent message:

`https://chat.qwen.ai/c/ce304dad-6409-4762-b184-861d4939b5c3`

Observed route form:

`https://chat.qwen.ai/c/<UUID>`

Candidate conversation ID from the supplied example:

`ce304dad-6409-4762-b184-861d4939b5c3`

## Immediate implication

This materially changes the interpretation of the prior guest-only discovery.

The earlier result remains valid for the anonymous guest surface:

- `/c/guest` is not a durable exact conversation identity;
- guest reload can redirect to `/auth`;
- the anonymous guest surface is not suitable for durable Ozon Bridge channel binding.

However, the authenticated surface now has direct operator-observed evidence of a per-conversation UUID-shaped route after the first message. Therefore Qwen must no longer be described globally as lacking a candidate exact conversation ID.

Correct split:

- `qwen / guest surface`: no durable exact identity proven; production binding blocked;
- `qwen / authenticated chat surface`: candidate exact identity `pathname /c/<UUID>` observed and eligible for targeted verification.

## Authentication classification

Current classification:

`AUTH_NOT_REQUIRED_FOR_BASIC_GUEST_CHAT`

but

`AUTH_CURRENTLY_REQUIRED_FOR_DURABLE_CONVERSATION_BINDING`

This distinction must be preserved in the final provider matrix.

## What is proven by the supplied route

PASS as operator-observed candidate evidence:

- authenticated Qwen can create a route containing a unique UUID-shaped conversation identifier after a message;
- the identifier is available in the top-level pathname;
- the route form is compatible in principle with provider-specific exact channel binding.

## What is NOT yet proven

Do not promote Qwen to supported based only on this URL. A later authenticated Qwen closure pass must still verify:

1. `/c/<UUID>` remains exactly the same after normal reload;
2. two different authenticated conversations get different UUIDs;
3. opening the same conversation in two tabs preserves the same UUID;
4. SPA A→B→A tracks the expected UUID and rejects stale DOM;
5. active-history/sidebar state corroborates the active route where available;
6. no conflicting strong identity source appears in DOM/router state;
7. user/assistant message IDs or an acceptable stable alternative;
8. fenced-code exact extraction and ownership;
9. result-delivery confirmation;
10. established-chat Manual;
11. established-chat Autorun;
12. direct new-chat Autorun first-response capture.

## Roadmap rule

Do NOT immediately perform the authenticated Qwen closure pass.

The project now follows a two-pass provider program:

### Pass 1 — breadth

Research every remaining Tier A provider once, in the audience-priority order recorded in `OZON_MULTI_AI_RESEARCH_PRIORITY_ROADMAP_2026-09-02.md`.

Goal: classify access surface, authentication requirement, positive DOM, identity candidate and blockers for every provider.

### Pass 2 — depth

Only after all Tier A providers have a first-pass record, return to providers one by one in priority order and close all `BLOCKED`/`FAIL` items that require authentication or provider-specific handling.

Qwen authenticated closure belongs to Pass 2.
