# Qwen browser discovery review — 2026-09-02

Status: PROVIDER_REVIEW_COMPLETE_DISCOVERY_BLOCKED_ON_AUTH_AND_IDENTITY
Scope: Qwen only
Source: operator-provided Codex Qwen discovery report with QWEN-01..QWEN-38 terminal statuses.

## 1. Executive verdict

Qwen is **not authorized for production support** from the current evidence.

The decisive blocker is not selector discovery. The browser pass proved that the currently accessible guest flow does not expose a durable, distinguishing exact conversation identity suitable for Ozon Bridge channel binding.

Observed guest behavior:

- trusted origin `https://chat.qwen.ai` confirmed;
- positive chat-app DOM signature confirmed;
- empty new chat has no exact conversation identity before first Send;
- first plain Send path was observable and one-shot safe;
- resulting guest route `/c/guest` is not a durable per-conversation identifier;
- reload of the guest route redirected to `/auth`;
- user/assistant turn roots were structurally discoverable, but stable native message IDs were not exposed;
- code-block, delivery, SPA and duplicate-tab tests became blocked after guest access ended at `/auth`.

Therefore:

- established-chat Manual: FAIL;
- established-chat Autorun: FAIL;
- new-chat Autorun: FAIL;
- exact durable channel binding: FAIL;
- production adapter onboarding: BLOCKED.

This result supersedes the earlier preliminary `MANUAL_ONLY_CANDIDATE` impression from the broad Tier A pass.

## 2. Terminal checklist summary

| ID | Requirement | Status | Review implication |
|---|---|---|---|
| QWEN-01 | Trusted origin | PASS | Exact trusted origin observed. |
| QWEN-02 | Positive Qwen chat-app detection | PASS | Origin + `.app` + visible Qwen composer signature can identify chat surface. |
| QWEN-03 | Non-chat rejection | PASS | Origin-only is insufficient; fail-closed states defined. |
| QWEN-04 | Empty-new-chat identity before Send | FAIL | No exact durable identity before Send. |
| QWEN-05 | First-Send identity timing | PASS | First-Send lifecycle observable. |
| QWEN-06 | Durable conversation identity source | FAIL | `/c/guest` does not distinguish/durably identify one conversation. |
| QWEN-07 | Conversation-ID case/normalization | NOT_APPLICABLE | No exact ID exists to normalize in tested guest flow. |
| QWEN-08 | Identity stability across reload | FAIL | Reload redirects guest route to `/auth`. |
| QWEN-09 | User-turn root | PASS | Structural user turn found, but no stable native message ID. |
| QWEN-10 | Assistant-turn root | PASS | Structural assistant turn found, but no stable native message ID. |
| QWEN-11 | True `orderedTurns()` | PASS | Mixed turn chronology can be traversed structurally. |
| QWEN-12 | Message-ID stability | FAIL | Turn roots expose no stable message IDs. |
| QWEN-13 | Generation-start signal | PASS | Structural generation start evidence observed. |
| QWEN-14 | Assistant-completion signal | PASS | `DETERMINISTIC_WITH_STABILITY_WINDOW`. |
| QWEN-15 | Composer root/editable | PASS | Deterministic active textarea/composer observed. |
| QWEN-16 | Exact composer write/read-back | PASS | Exact read-back observed. |
| QWEN-17 | Enabled Send | PASS | Unique active Send observed in current composer scope. |
| QWEN-18 | Disabled Send | PASS | Empty state represented by absent Send rather than disabled Send. |
| QWEN-19 | Stop/generating control | PASS | Structural generation control observed. |
| QWEN-20 | Exactly-once Send | PASS | One-shot Send procedure proved for tested plain flow. |
| QWEN-21 | Code-block creation | BLOCKED | Auth barrier after guest reload. |
| QWEN-22 | Exact raw code extraction | BLOCKED | No authenticated chat available for probe B. |
| QWEN-23 | Code-block ownership | BLOCKED | No completed code-block turn. |
| QWEN-24 | Code-block action anchor | BLOCKED | No owned code block. |
| QWEN-25 | Second-turn continuity | BLOCKED | Auth barrier. |
| QWEN-26 | Delivery-like one-shot Send | BLOCKED | Auth barrier. |
| QWEN-27 | Result delivery confirmation | BLOCKED | No delivery probe turn. |
| QWEN-28 | SPA A→B | BLOCKED | No two durable chats. |
| QWEN-29 | SPA B→A | BLOCKED | No two durable chats. |
| QWEN-30 | Stale DOM rejection | BLOCKED | Requires A/B identity evidence. |
| QWEN-31 | Different conversations in two tabs | BLOCKED | No distinct durable IDs. |
| QWEN-32 | Same conversation in two tabs | BLOCKED | No durable conversation URL/ID. |
| QWEN-33 | Duplicate-tab owner policy | BLOCKED | Ownership proof requires durable identity. |
| QWEN-34 | Established-chat Manual feasibility | FAIL | Exact ID, raw code and delivery proof absent. |
| QWEN-35 | Established-chat Autorun feasibility | FAIL | Reload-safe identity and raw-code proof absent. |
| QWEN-36 | New-chat Autorun feasibility | FAIL | Guest identity non-durable; reload requires auth. |
| QWEN-37 | Provider adapter contract | PASS | Evidence-backed/UNRESOLVED contract can be recorded, but not activated. |
| QWEN-38 | Final capability verdict | PASS | Terminal provider verdict obtained. |

## 3. Evidence that can be reused later

### 3.1 Autodetection candidate

Observed positive signature:

```html
<div class="app">
  <div role="button" aria-label="New Chat"></div>
  <textarea class="message-input-textarea" placeholder="Ask Qwen"></textarea>
</div>
```

This can be retained as a **candidate** positive chat-app signature, subject to future authenticated revalidation and localization/stability review.

Detection must remain two-sided:

`trusted worker URL evidence + positive visible Qwen chat DOM = confirmed surface candidate`.

A Qwen origin without the required chat signature must not be executable.

### 3.2 Composer/lifecycle candidate

The pass proved useful generic-core facts:

- Qwen uses an ordinary textarea-style composer in the tested surface;
- exact composer read-back is feasible;
- enabled Send can be resolved in the current composer scope;
- empty state may remove Send instead of rendering a disabled button;
- generation start/Stop can be structurally observed;
- assistant completion can be treated as deterministic only with a stability window;
- one-shot Send safety is compatible with the generic commit-before-click design.

These facts may inform future fixtures, but **must not activate Qwen support without channel identity and delivery proof**.

## 4. Hard release blockers

### 4.1 No exact durable conversation identity

This is the primary blocker.

`/c/guest` must not be used as:

- durable conversation ID;
- v2 channel key input;
- binding identity;
- duplicate-tab lease key;
- Autorun ownership identity.

Without an authenticated Qwen flow exposing a deterministic per-conversation identity, Ozon Bridge cannot guarantee that commands/results remain bound to one exact conversation.

### 4.2 Reload recovery fails in tested guest flow

Reload of the guest route led to `/auth`. Therefore:

- durable recovery cannot be proven;
- same-channel rebinding after content reload cannot be proven;
- Autorun recovery cannot be accepted;
- duplicate-tab ownership cannot be accepted.

### 4.3 Stable message IDs absent

The pass found structural user/assistant roots but no stable native message IDs.

This weakens:

- reload-safe Autorun baselines;
- delivery de-duplication;
- turn reconciliation after rerender/reload;
- exact duplicate suppression.

A future authenticated pass must determine whether stable IDs exist there. If not, Qwen may remain unsupported for Autorun even if conversation identity is solved.

### 4.4 Raw code and delivery evidence blocked

Manual support cannot be accepted until an authenticated disposable chat proves:

- fenced code block creation;
- exact raw code extraction;
- code block → assistant ownership;
- safe Ozon button anchor;
- delivery-like Send;
- deterministic delivery confirmation.

## 5. Revised Qwen status

Provider: Qwen

Access: guest chat initially accessible; reload transitioned to auth requirement.

Autodetection: positive candidate evidence PASS.

Conversation identity: FAIL in guest flow.

Identity durability: FAIL.

Ordered turns: structural PASS.

Message IDs: FAIL.

Completion: PASS with stability window.

Composer: PASS candidate.

Exactly-once Send: PASS for tested plain flow.

Raw code extraction: BLOCKED.

Result delivery: BLOCKED.

SPA: BLOCKED.

Different-chat parallelism: BLOCKED.

Duplicate-tab ownership: BLOCKED.

Manual: FAIL.

Established Autorun: FAIL.

New-chat Autorun: FAIL.

Overall verdict: **AUTHENTICATED_REDISCOVERY_REQUIRED / PRODUCTION_UNSUPPORTED_NOW**.

## 6. Required next Qwen pass

Do not spend another anonymous/guest pass repeating already proven items.

Only revisit Qwen when an existing authenticated disposable Qwen session is available. The follow-up should target unresolved items only:

1. authenticated exact conversation identity;
2. reload stability;
3. stable message IDs;
4. code block/raw extraction/ownership;
5. second-turn continuity;
6. delivery confirmation;
7. SPA A→B→A;
8. two different conversations in parallel;
9. same conversation duplicate tabs;
10. Manual/Autorun re-evaluation.

Until then Qwen must not be added to production manifest/registry as an executable supported adapter.