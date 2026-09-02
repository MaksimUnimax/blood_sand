# Claude browser discovery review — 2026-09-02

Status: PASS1_COMPLETE_AS_AUTH_BLOCKED_RECORD
Scope: Claude only
Source: operator-provided Codex Claude discovery report.

## 1. Executive verdict

Claude reached a real provider page successfully and redirected to `https://claude.ai/login`. The observed surface contained only authentication controls and no chat composer, conversation root, user/assistant turns, Send, Stop, or code block.

Therefore the correct access classification for the tested unauthenticated session is:

`AUTH_REQUIRED_FOR_BASIC_CHAT`

This is a provider/authentication blocker, not a Codex browser environment failure and not evidence that Claude is technically unsupported.

Pass-1 outcome:

- provider/environment reachability: PASS;
- trusted origin/final login route: PASS;
- product surface classification: PASS;
- authentication boundary: PASS;
- unauthenticated basic chat: unavailable;
- positive executable chat DOM: BLOCKED / AUTH_REQUIRED;
- conversation identity, turns, composer, Send, code, delivery, SPA, duplicate tabs, Manual and Autorun: BLOCKED / AUTH_REQUIRED;
- overall provider verdict: `AUTHENTICATED_REDISCOVERY_REQUIRED`.

No Claude production adapter support is authorized from this pass.

## 2. Load-bearing evidence

Observed:

- requested URL: `https://claude.ai/`;
- final URL: `https://claude.ai/login`;
- origin: `https://claude.ai`;
- pathname: `/login`;
- title: `Sign in - Claude`;
- login options: Google, Apple, email, SSO;
- no chat composer;
- no conversation root;
- no user/assistant turns;
- no Send/Stop controls;
- no code block.

Sanitized auth-boundary candidate:

```html
<main>
  <button>Continue with Google</button>
  <button>Continue with Apple</button>
  <button>Continue with email</button>
  <button>Continue with SSO</button>
</main>
```

This is useful negative/autodetection evidence: `/login` plus auth-only controls must be rejected as executable Claude chat.

## 3. Authentication classification

Current taxonomy value:

`AUTH_REQUIRED_FOR_BASIC_CHAT`

Observed unauthenticated capabilities:

- provider page: YES;
- login UI: YES;
- basic chat: NO;
- composer: NO;
- Send: NO;
- turns: NO;
- durable conversation/history: NOT TESTED because basic chat itself is unavailable.

No authentication bypass was attempted.

## 4. Report consistency issue

The source report contains one internal status mismatch for `CLAUDE-27` (artifact distinction):

- top checklist table says `CLAUDE-27 = BLOCKED / AUTH_REQUIRED`;
- narrative closure says `CLAUDE-27 = NOT_APPLICABLE` because no authorized code probe was sent and no artifact was created.

The raw report is preserved verbatim.

For planning purposes, do not silently choose one as canonical yet. In the authenticated follow-up, re-evaluate the artifact/code distinction when the code probe is actually executed. Until then, treat the artifact-specific evidence as **not obtained**.

## 5. What can be reused later

### Negative surface rule

Candidate fail-closed rule:

- trusted Claude origin + `/login` or auth-only controls => `CONFLICT` / non-executable;
- trusted origin while chat DOM is still loading => `PENDING_PAGE_READY`;
- another origin => `UNSUPPORTED`;
- multiple visible current chat candidates => `AMBIGUOUS`;
- only origin/title is never enough to grant executable Claude support.

### Trusted origin candidate

`https://claude.ai`

This is only a trusted-origin candidate. Positive chat detection still requires authenticated DOM evidence.

## 6. Required Claude closure before patch

A future authenticated Claude pass must establish at least:

1. positive chat-app DOM signature;
2. empty/new-chat route and identity timing;
3. exact durable conversation identity;
4. conversation-ID format/case policy;
5. reload identity stability;
6. user/assistant turn roots;
7. true ordered-turn traversal;
8. stable/recoverable message identity;
9. generation-start signal;
10. deterministic completion policy;
11. composer root/editor strategy;
12. exact multiline write/read-back;
13. enabled/disabled Send;
14. Stop/Cancel lifecycle;
15. exactly-once Send acceptance evidence;
16. fenced code block creation;
17. exact raw-code extraction;
18. code block -> assistant ownership;
19. artifact-vs-normal-code distinction if applicable;
20. second-turn continuity;
21. result-delivery confirmation;
22. SPA A→B→A;
23. stale DOM rejection;
24. two different conversations in two tabs;
25. same conversation duplicate tabs;
26. single-owner lease feasibility;
27. Manual feasibility;
28. established-chat Autorun;
29. new-chat Autorun.

## 7. Pre-patch status

Provider: Claude

Pass-1 status: COMPLETE AS AUTH-BLOCKED RECORD

Basic chat without authentication: NO

Authentication taxonomy: `AUTH_REQUIRED_FOR_BASIC_CHAT`

Environment access: PASS

Positive chat DOM: NOT OBTAINED

Conversation identity: NOT OBTAINED

Composer/Send: NOT OBTAINED

Raw code/delivery: NOT OBTAINED

Manual: NOT PROVEN

Established Autorun: NOT PROVEN

New-chat Autorun: NOT PROVEN

Overall: **AUTHENTICATED_REDISCOVERY_REQUIRED / DO NOT PATCH CLAUDE YET**
