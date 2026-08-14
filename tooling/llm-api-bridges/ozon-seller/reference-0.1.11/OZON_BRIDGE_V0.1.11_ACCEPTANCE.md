# Ozon Seller LLM API Bridge v0.1.11 — live DOM binding correction candidate

Date: 2026-08-14
Repository: `MaksimUnimax/blood_sand`
Branch: `work/ozon-data-collection-2026-08-11`
Base artifact: Ozon Bridge v0.1.10

## Incident

A logged-in ChatGPT v0.1.10 run reported `MANUAL_BRIDGE_READY` while the visible code-block Copy control remained native/gray and clicking it could not enter the Ozon manual execution path.

The supplied live diagnostic sequence proved that the content runtime was loaded, the conversation was bound, Seller credentials were present, and the worker reported Manual readiness. The remaining failure was therefore in binding/decorating the visible assistant code block.

## Exact root cause

v0.1.10 recognized Manual command blocks through only two DOM families:

1. the explicit ChatGPT writing-block selectors in `CURRENT_ROOT_SELECTOR`;
2. a legacy `<pre>` adapter only when that `<pre>` contained exactly one `#code-block-viewer` descendant.

A current ordinary ChatGPT code block represented as a generic `<pre><code>...</code></pre>` without `#code-block-viewer` was not a supported root. It was absent from both the initial reverse scan and MutationObserver candidate-root discovery. Consequently the worker could be ready while `DECORATED` remained empty: no blue state and no Ozon click handler on the visible local Copy control.

There was also a state-order weakness: v0.1.10 applied the ready flag before applying Manual mode during state synchronization; `applyManualMode()` can tear down the observer/state on transitions. v0.1.11 applies Manual mode first, then readiness.

## Production correction

`content_script.js` now:

- resolves an assistant message container through either the existing `section[data-turn="assistant"][data-turn-id]` family or the current `[data-message-author-role="assistant"]` family;
- supports generic assistant `<pre><code>...</code></pre>` blocks as `generic_pre_code_v1` while preserving the existing `#code-block-viewer` legacy adapter;
- includes generic `<pre>` roots in initial scanning and MutationObserver discovery;
- re-scans/decorates current blocks whenever readiness becomes true;
- records `decorated_button_count` with Manual READY/BUSY diagnostics;
- applies Manual mode before setting readiness in both `OZ_GET_MANUAL_STATE` and `OZ_CONTENT_READY` synchronization.

The existing locality algorithm remains responsible for selecting one unique code-block-local Copy control and still excludes the generic assistant-response Copy action.

No Ozon operation, provider path, permission, host permission, credential behavior, batch semantics, recovery rule, result format, delivery rule, or read-only safety policy is expanded by this correction.

## Browser regression proof

A real Chromium 144 Playwright harness executed the exact v0.1.10 and v0.1.11 production `content_script.js` against two DOM families with worker Manual mode/ready mocked true.

### Current generic code block

DOM shape: assistant message container + sibling local Copy toolbar + `<pre><code>OZON_API_V1 ...</code></pre>`.

- v0.1.10: READY diagnostic present; Copy background unchanged/gray; `OZ_EXECUTE_COMMAND` count after click = **0**.
- v0.1.11: Copy receives Ozon-blue ready styling; one click emits exactly **1** `OZ_EXECUTE_COMMAND`; control immediately returns to busy/native-Copy-only styling after admission.

### Legacy code block

DOM shape: `section[data-turn="assistant"]` + sibling local Copy toolbar + `<pre><div id="code-block-viewer">OZON_API_V1 ...</div></pre>`.

- v0.1.10: blue ready styling; one click emits exactly **1** `OZ_EXECUTE_COMMAND`.
- v0.1.11: blue ready styling; one click emits exactly **1** `OZ_EXECUTE_COMMAND`.

No page errors occurred in the final browser regression. Verdict: `ALL_DOM_REGRESSIONS_PASS`.

The same browser regression was rerun against a fresh extraction of the final v0.1.11 ZIP and produced the same PASS result.

## Syntax, package and security checks

- production files: **16**;
- every production `.js`: `node --check` PASS;
- fresh ZIP extraction: **16/16 byte-identical** to staged v0.1.11 production tree;
- manifest version: `0.1.11`;
- permissions unchanged: `storage`, `tabs`, `unlimitedStorage`;
- host permissions unchanged: ChatGPT/chat.openai.com + fixed `https://api-seller.ozon.ru/*`;
- Chromium 144 `--pack-extension`: exit **0**;
- deterministic ZIP rebuild: byte-identical.

## Final artifact

- ZIP: `ozon-bridge-v0.1.11-extension.zip`
- bytes: `91432`
- production files: `16`
- SHA-256: `b8b67459ca735076f61114b5fd53c636b074840174ba82a716dc15ba468343a8`

## Reproducible v0.1.10 → v0.1.11 patch

- raw patch SHA-256: `4986859aaad1f1852dbcd86f3bb02f6eab8b533caa767c72109d0280373c8847`
- deterministic gzip SHA-256: `0420696f09108c20252081aea89cfe7b2ae95f78df96be822d8c0a879de4a7bd`
- base64 SHA-256: `372420ba7c02c5187d1f11b83cbbe06b733932a9e779a63fddfb76b7edf92df4`

## Acceptance boundary

The exact reported failure mode is reproduced and corrected under real Chromium using the production content script and the final fresh ZIP. This does **not** claim logged-in live ChatGPT acceptance of v0.1.11 until the operator installs the package and confirms the same real code block becomes Ozon-blue and a click starts the Ozon batch.

The previous v0.1.10 full 208-test suite is not falsely re-claimed as rerun here because that external harness is not present in this runtime. The v0.1.11 evidence is deliberately scoped to the changed DOM/readiness path plus production syntax/package/security integrity and fresh-ZIP browser regression.
