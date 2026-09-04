# Ozon Seller Bridge — Mandatory Patch Delivery Gate

Status: **MANDATORY / BLOCKING / RUN BEFORE EVERY PATCH HANDOFF**

Canonical scope: every executable Ozon Seller Bridge corrective patch, hotfix, repair package, or replacement build handed to the operator.

This document is a blocking process gate. It does not authorize a patch and it does not replace live certification after installation.

## 0. Non-negotiable operator rules

**ЗАПРЕТ НА ЛЮБЫЕ ПАТЧИ БЕЗ МОЕГО ПРЯМОГО РАЗРЕШЕНИЯ.**

**ПЕРЕД ПЕРЕДАЧЕЙ КАЖДОГО ПАТЧА ОПЕРАТОРУ ОБЯЗАТЕЛЬНО ПОЛНОСТЬЮ ПРОГНАТЬ ВСЕ ПРИМЕНИМЫЕ PRE-HANDOFF ПРОВЕРКИ ИЗ `OZON_PATCH_DELIVERY_GATE.md`; В СООБЩЕНИИ С ПАТЧЕМ ОБЯЗАТЕЛЬНО ПРИВЕСТИ ПОЛНЫЙ СПИСОК GATE-ID И ФАКТИЧЕСКИЙ РЕЗУЛЬТАТ КАЖДОЙ ПРОВЕРКИ. ЛЮБОЙ `FAIL`, `UNKNOWN` ИЛИ `NOT RUN` В ОБЯЗАТЕЛЬНОЙ PRE-HANDOFF ПРОВЕРКЕ БЛОКИРУЕТ ПЕРЕДАЧУ ПАТЧА КАК ГОТОВОГО.**

**ЗАПРЕЩЕНО ПЕРЕДАВАТЬ ПАТЧ, СБОРКУ ИЛИ АРТЕФАКТ КАК ГОТОВЫЙ, ПОКА НЕ ПРОВЕРЕНЫ ВСЕ ДО ЕДИНОЙ ЗАВИСИМОСТИ, КОТОРЫЕ ДОБАВЛЕНЫ, ИЗМЕНЕНЫ ИЛИ МОГУТ БЫТЬ ЗАТРОНУТЫ ПАТЧЕМ. ДЛЯ КАЖДОЙ ТАКОЙ ЗАВИСИМОСТИ ОБЯЗАТЕЛЬНО ПРОЙТИ ПОЛНУЮ ЦЕПОЧКУ ОТ МЕСТА, ГДЕ ОНА СОЗДАЕТСЯ/ОПРЕДЕЛЯЕТСЯ, ДО КАЖДОГО МЕСТА, ГДЕ ОНА ЧИТАЕТСЯ, СРАВНИВАЕТСЯ, ВЕТВИТ ЛОГИКУ, ИЗМЕНЯЕТСЯ, СОХРАНЯЕТСЯ, ВОССТАНАВЛИВАЕТСЯ, ПЕРЕДАЕТСЯ, ИСПОЛЬЗУЕТСЯ ДЛЯ ПРАВ/ПОЛИТИК/ПЛАНИРОВАНИЯ/ЗАПРОСОВ/УЧЕТА/БЕЗОПАСНОСТИ, ПОПАДАЕТ В РЕЗУЛЬТАТ ИЛИ ПРОВЕРЯЕТСЯ ТЕСТАМИ. ХОТЯ БЫ ОДИН НЕПРОВЕРЕННЫЙ ПОТРЕБИТЕЛЬ, ВЕТКА, ПЕРЕХОД, ХРАНИЛИЩЕ, ВЫВОД ИЛИ ТЕСТ = `BLOCKED`; НЕЛЬЗЯ ГОВОРИТЬ `PASS`, `ГОТОВО`, `ЗАКРЫТО` И НЕЛЬЗЯ ОТДАВАТЬ ПАТЧ. ИСПРАВЛЕНИЕ ИСХОДНОГО СИМПТОМА НЕ ЯВЛЯЕТСЯ ДОКАЗАТЕЛЬСТВОМ ЗАКРЫТИЯ ЗАВИСИМОСТЕЙ.**

**PRE-HANDOFF PASS НИКОГДА НЕ НАЗЫВАТЬ LIVE PASS. ПОСЛЕ УСТАНОВКИ ПАТЧА LIVE-ЗАКРЫТИЕ ИДЁТ ОТДЕЛЬНО И МОЖЕТ БЫТЬ ТОЛЬКО ПО ФАКТИЧЕСКОМУ LIVE EVIDENCE.**

Every patch handoff message must reproduce the complete checklist result, not merely link to this file.

---

## 1. Authorization and scope gate

### GATE-01 — Direct patch authorization
Confirm that the operator gave direct permission to make this patch. Quote or reference the current-turn authorization. If there is no direct permission: **BLOCKED**.

### GATE-02 — Frozen defect set / evidence collection
Confirm that the planned live/evidence collection for the current repair cycle was completed before patching, unless the operator explicitly ordered otherwise. Do not patch the first observed failure while other planned tests remain uncollected.

### GATE-03 — Exact patch scope
List every defect the patch is intended to repair and every file expected to change. Verify there are no unrelated executable, config, manifest, branch/ref, or package changes.

### GATE-04 — No hidden mutation
Verify no branch/ref reset, config mutation, package replacement, generated-file mutation, or other corrective action was performed outside the authorized patch scope.

---

## 2. Root-cause completeness gate

### GATE-05 — Exact failing workflow reconstructed
Reconstruct the operator-observed workflow end-to-end, including all commands, command boundaries, settings, generated IDs/refs, provider calls, and the exact failure stage.

### GATE-06 — Do not stop at the first confirmed cause
After finding one valid root cause, continue auditing the complete workflow for independent/latent failures. A first confirmed boundary is not proof that the full workflow has only one defect.

### GATE-07 — Exhaustive dependency-closure inventory
For every value, type, provider, ref, ID, provenance flag, policy decision, entitlement result, cache entry, session value, timing value, credential metadata item, storage key, request metadata item, output field, enum/category, or other dependency that is added, changed, reinterpreted, or relied on by the patch, build an exhaustive producer-to-consumer inventory.

The inventory must start where the dependency is created/defined and enumerate **every** place where it is:
- read or resolved;
- compared or used in `if`/`switch`/dispatch logic;
- validated or normalized;
- transformed or copied;
- used to choose provider, credentials, entitlement, policy, quota, cache, retry, request builder, host, transport, parser, redaction, accounting, or output metadata;
- stored, restored, expired, migrated, pruned, or recreated;
- passed across command/service-worker/provider boundaries;
- exposed in user-visible results, diagnostics, guidance, status, errors, or package metadata;
- covered or assumed by deterministic, package, browser, or live tests.

Search must include direct references **and semantic assumptions** such as binary fallbacks (`not A => B`), default branches, catch-all conditions, legacy code paths, generated/bundled copies, and tests that bypass part of the real execution path.

A dependency inventory is incomplete if any possible consumer, branch, transition, storage location, output path, generated copy, or test assumption remains unknown or unchecked. Incomplete inventory = **FAIL / BLOCKED**.

### GATE-08 — Full dependency path proof and lifetime classification
For every dependency from GATE-07, trace every listed path from the beginning of its logic to the final observable effect. Do not stop after confirming the originally broken helper or symptom.

For each path, record:
1. producer/definition;
2. all intermediate readers/branches/transforms;
3. storage location and lifetime, if any: local variable, module memory, provider instance, service-worker global, `chrome.storage.session`, `chrome.storage.local`, provider/server, or other store;
4. every boundary crossing;
5. final request, policy, entitlement, accounting, security, user-visible output, or terminal failure behavior;
6. the test that proves the path on the final candidate.

Every branch and consumer must have an explicit final status: `PASS` or a separately documented intentional non-applicability. Any `UNKNOWN`, `NOT CHECKED`, assumed behavior, skipped consumer, or untested terminal effect = **FAIL / BLOCKED**.

### GATE-09 — Architecture-invariant comparison
Compare the proposed repair with existing bridge architecture patterns. If the bridge already has a durability, privacy, request-accounting, retry, correlation, session, provider-routing, entitlement, policy, storage, or output invariant, explicitly verify **every dependency path from GATE-07/GATE-08** follows it rather than inventing or inheriting an inconsistent exception.

When a new enum member, provider type, state kind, ref class, storage record, policy class, or other category is added, explicitly audit all existing binary/catch-all assumptions that previously treated the old set as exhaustive. A new category may not be certified until every such assumption has been reviewed and either updated or proven unaffected.

### GATE-10 — Separate bridge defects from provider/account blockers
Classify provider permission, entitlement, empty-business-state, missing account data, and other external blockers separately. Do not “repair” a provider/account condition in bridge code.

---

## 3. MV3 lifecycle and cross-command durability gate

### GATE-11 — Cross-command durability contract
Every state item needed by a later separately issued command must be one of:
1. deliberately durable across MV3 service-worker/provider recreation; or
2. deliberately non-durable with an explicit fail-closed product contract.
Anything unclassified is **FAIL**.

### GATE-12 — Forced recreation between dependent commands
For every multi-command workflow with state dependencies, the deterministic acceptance test must destroy/recreate the provider/service-worker-equivalent runtime between each dependent command boundary.

### GATE-13 — Same-instance test is supplemental only
A same-provider/same-worker test may exist, but it can never be the sole certification evidence for a multi-command MV3 workflow.

### GATE-14 — Fresh-state replay
Repeat the target workflow with freshly generated report codes, refs, IDs, or equivalent runtime state. Do not certify using a stale ref accidentally retained by the current worker.

### GATE-15 — Restart-sensitive negative control
Verify that after lifecycle recreation an unknown/stale ref or missing durable state fails closed without fabricating state or executing an unsafe request.

---

## 4. Browser/package boundary gate

### GATE-16 — Test the browser boundary, not only mocked transport
If runtime behavior depends on MV3 permissions, CSP, host permissions, extension storage, service-worker lifetime, or browser APIs, include deterministic/static assertions for that browser boundary. A mocked `fetch` alone is insufficient.

### GATE-17 — Manifest/runtime endpoint parity
Enumerate all runtime network destinations introduced or relied on by the patch and verify the packaged manifest grants exactly the required trusted hosts. Verify this in the packaged artifact, not merely source.

### GATE-18 — Installed-artifact parity
Run tests against the exact build tree/archive intended for installation. Record commit, tree, archive name, archive bytes, and SHA-256. Source-tree PASS does not certify a different package.

### GATE-19 — Rebuild invalidates previous package evidence
Any executable/config/manifest change after a package test invalidates the prior package result. Rebuild and rerun the complete applicable PRE-HANDOFF gate.

---

## 5. Request/contract truthfulness gate

### GATE-20 — Exact request preservation
When metadata claims `exact_request_preserved=true`, prove logical and physical request equivalence. If the command is transformed, fingerprints/metadata must truthfully show the transformation.

### GATE-21 — Logical/physical request accounting
Verify logical request count, physical business request count, `external_request_executed`, HTTP status, retry state, provider classification, entitlement metadata, and other reported execution metadata match what actually happened. A target request succeeding does not make contradictory metadata acceptable.

### GATE-22 — No hidden retry or duplicate provider request
For single-flight operations, assert exactly one provider request unless the documented contract explicitly allows retry. Any unexpected second request is **FAIL**.

### GATE-23 — Negative guard plus positive control
For every validation/policy repair, test both sides: invalid/blocked input must reject locally with the expected zero-request behavior; the valid counterpart must execute with the expected request count and result metadata.

### GATE-24 — Fail-honest entitlement
Unknown provider/account permission must remain `UNKNOWN`/fail-honest. Do not overstate it as supported for all accounts and do not convert a provider permission blocker into a bridge success. Provider classification and entitlement `reason` must also be semantically correct for the actual provider path; a generic/catch-all reason borrowed from a different provider is **FAIL**.

---

## 6. Privacy and security gate

### GATE-25 — Personal-data policy OFF guard
For operations requiring personal-data authorization, verify policy OFF fails closed before the provider request where that is the contract. Record zero physical request / external false when expected.

### GATE-26 — Provenance-aware privacy path
For operations whose privacy decision depends on provenance, test both known-safe and unknown/historical provenance, including a lifecycle recreation between provenance producer and consumer.

### GATE-27 — Semantic redaction
Test sensitive semantic keys/values, not only fixed field names. Provider URLs, receiver identifiers, personal values, and other protected content must be redacted according to contract.

### GATE-28 — No URL/base64/credential leakage
Assert report text/result/error paths do not leak signed report URLs, raw base64, seller credentials, API keys, authorization headers, or other secrets.

### GATE-29 — Trusted-host / SSRF guard
For report-file or other externally resolved URLs, test accepted trusted HTTPS hosts and rejected HTTP/untrusted hosts. Verify seller credentials are never sent to report-file hosts.

---

## 7. Regression and completeness gate

### GATE-30 — Targeted regression for every defect in patch scope
Each defect must have a deterministic regression that fails on the pre-fix authority for the intended reason and passes on the candidate for the intended reason whenever a deterministic reproduction is possible.

### GATE-31 — Previous repaired-defect and dependency guards
Run all relevant previously repaired-defect regression guards that intersect the changed files or shared runtime surfaces. For the current repair family this includes at minimum the guards for DEFECT-001..DEFECT-013 that are affected by provider, policy, report, transport, manifest, entitlement, or lifecycle changes.

In addition, every added/changed dependency from GATE-07 must have regression coverage for all affected shared consumers, including consumers outside the originally failing feature. A test that calls a lower-level helper directly does not cover skipped planner/policy/routing/accounting/output layers.

### GATE-32 — Full exact workflow and dependency-closure gate
After targeted unit/regression checks pass, run a deterministic end-to-end reproduction of the complete operator-observed workflow **through the same layers used by the real product**, then verify the complete output contract, not only the originally broken symptom.

Before PASS, cross-check that every dependency and consumer recorded in GATE-07/GATE-08 is exercised by an applicable test or has an explicit proven non-applicability. Isolated helper/transport success is not sufficient. Any dependency-closure gap = **FAIL / BLOCKED**.

### GATE-33 — No stale or fabricated dependencies
Every test dependency must come from the current test flow or an explicitly documented real prerequisite. Do not fabricate IDs/refs/payloads and do not silently reuse an old live ref to make a test pass.

### GATE-34 — Read-only safety
For read-repair validation, confirm tests do not mutate provider business state. Any required provider-side mutation must be separately authorized.

### GATE-35 — Full green run after final candidate
After the last candidate change, run the entire applicable PRE-HANDOFF suite once more from the final artifact. Partial green results from earlier revisions cannot be combined into a final PASS.

`GATE-35 PASS` additionally requires an explicit final dependency-closure statement for GATE-07/GATE-08: all added/changed/affected dependencies, all consumers, all branches, all boundary crossings, all final outputs, and all applicable tests are accounted for with no `UNKNOWN`, `NOT CHECKED`, or assumed path. Without that statement and evidence, GATE-35 is **FAIL / BLOCKED** even if every executed test is green.

---

## 8. Post-install live-certification gate

These checks are mandatory for final LIVE closure but are not falsely represented as pre-handoff evidence. The patch message must list them as `PENDING POST-INSTALL` until the operator installs the candidate and real live evidence exists.

### LIVE-GATE-01 — Exact user-observed workflow on installed candidate
Run the exact failing live workflow against the installed candidate, with fresh dependencies generated in that workflow.

### LIVE-GATE-02 — Lifecycle-sensitive live path
Where practical, allow/force a real command boundary capable of MV3 worker recreation and verify the durable workflow still succeeds. Do not rely on one unusually long-lived worker session.

### LIVE-GATE-03 — Complete real-result validation
Verify real logical/physical request counts, `external_request_executed`, HTTP result, retry status, provider classification, entitlement metadata, transformation/exactness metadata, privacy/redaction state, and all other contract fields touched by the patch. Do not mark a live test PASS merely because the original failure symptom disappeared.

### LIVE-GATE-04 — Relevant live regression guards
Rerun the minimum live guards needed to prove the patch did not regress privacy, redaction, request preservation, entitlement honesty, provider classification, or other surfaces touched by the patch and its dependency closure.

### LIVE-GATE-05 — CI/package PASS is not LIVE PASS
Do not close a live gate from deterministic CI/package evidence. Final LIVE PASS requires actual installed live evidence.

---

## 9. Historical failure guards — mistakes that must not recur

### HIST-01 — Unauthorized patch/ref mutation
Past failure: an executable patch and a later forced branch ref update were performed without direct operator authorization.
Guard: GATE-01 and GATE-04 are mandatory blockers. Documentation/evidence work does not authorize executable or ref mutation.

### HIST-02 — Mock transport hid MV3 host-permission failure (DEFECT-012)
Past failure: deterministic report-file tests mocked `https://cdn1.ozone.ru/...`; the mock never exercised Chrome MV3 host-permission enforcement, so the packaged extension lacked required `ozon.ru`/`ozone.ru` host permissions and live fetch failed with HTTP 0 / `Failed to fetch`.
Guard: GATE-16, GATE-17, GATE-18.

### HIST-03 — Diagnosis stopped at first confirmed boundary
Past failure: after DEFECT-012 was confirmed, the investigation treated it as the complete workflow root cause instead of auditing independent cross-command state dependencies.
Guard: GATE-05 through GATE-10.

### HIST-04 — Same-instance tests masked MV3 lifecycle loss (DEFECT-013)
Past failure: `create -> report_info -> report_file_get` tests reused one `OzonProvider`; module-local Maps therefore remained alive and falsely made the workflow look durable.
Guard: GATE-11 through GATE-15 and GATE-32.

### HIST-05 — Cross-command state durability omitted from acceptance (DEFECT-013)
Past failure: `reportCodePolicies` and `reportFileRefs` were cross-command dependencies but acceptance never classified their lifetime or forced worker/provider recreation.
Guard: GATE-07, GATE-08, GATE-11, GATE-12.

### HIST-06 — Existing storage architecture not applied (DEFECT-013)
Past failure: the bridge already used storage-backed/session-backed patterns for important cross-worker state, but report provenance/ref state remained module-local.
Guard: GATE-09 and GATE-11.

### HIST-07 — Isolated PASS mistaken for workflow closure
Past failure mode: a transport/helper can pass while an earlier/later workflow boundary is still broken.
Guard: GATE-32 plus LIVE-GATE-01; isolated PASS must be labeled isolated only.

### HIST-08 — Package/CI evidence must not be promoted to live certification
Past failure mode: deterministic/package evidence can be correct while real browser/provider behavior still contradicts it.
Guard: LIVE-GATE-05.

### HIST-09 — Added dependency/category was not audited through every consumer
Past failure: a new `report_file` provider/category was added while older code still contained a binary assumption equivalent to `not seller_api => performance_api`. The report-file transport tests exercised the helper/provider path but skipped the planner layer, so the build could pass while live output falsely labeled `report_file` with Performance entitlement reasoning.

Guard: GATE-07, GATE-08, GATE-09, GATE-21, GATE-24, GATE-31, GATE-32, and GATE-35. Any new or changed dependency/category requires exhaustive producer-to-consumer closure before handoff. Green tests cannot override an incomplete dependency audit.

---

## 10. Mandatory patch handoff report format

Every patch handoff message must contain this information before any package/link is presented as ready:

```text
PATCH DELIVERY GATE
Authorization: <direct operator authorization>
Patch scope: <defects>
Base authority: <commit/tree>
Candidate: <commit/tree>
Artifact: <name>
Bytes: <bytes>
SHA-256: <sha256>
Dependency closure: PASS|FAIL  <explicit producer-to-all-consumers evidence; no unknown paths>

GATE-01  PASS|FAIL|UNKNOWN|NOT RUN  <evidence>
GATE-02  PASS|FAIL|UNKNOWN|NOT RUN  <evidence>
...
GATE-35  PASS|FAIL|UNKNOWN|NOT RUN  <evidence>

LIVE-GATE-01  PENDING POST-INSTALL|PASS|FAIL  <evidence>
...
LIVE-GATE-05  PENDING POST-INSTALL|PASS|FAIL  <evidence>

PRE-HANDOFF VERDICT: PASS|BLOCKED
LIVE CERTIFICATION: PENDING|PASS|FAIL
```

Rules for the verdict:
- `PRE-HANDOFF VERDICT: PASS` only if every applicable GATE-01..GATE-35 is PASS **and** `Dependency closure: PASS` is backed by the complete GATE-07/GATE-08 inventory and evidence.
- Any mandatory applicable `FAIL`, `UNKNOWN`, or `NOT RUN`, or any missing/unverified dependency consumer/path, means `PRE-HANDOFF VERDICT: BLOCKED`.
- A green targeted test, green CI, successful package build, or disappearance of the original symptom cannot override a dependency-closure failure.
- `LIVE CERTIFICATION: PASS` only after all required LIVE-GATE checks have real installed-build evidence.
- A patch may never be described as live-certified while live checks are pending.

---

## 11. Current repair-family special regression matrix

Until DEFECT-013 and the current read-effect repair cycle are fully closed, every candidate touching report/provider/policy/transport/storage/manifest code must explicitly include:

1. Safe report `create -> report_info` with personal-data OFF and forced provider/worker recreation between commands; safe provenance must remain known-safe.
2. Unknown/historical `report_info` provenance with personal-data OFF; it must fail closed according to policy.
3. `report_info -> report_file_get` with forced provider/worker recreation; freshly issued opaque ref must remain resolvable if the product contract requires cross-command use.
4. Unknown/stale report-file ref; zero unsafe request and explicit local failure.
5. Trusted report-file HTTPS fetch; exactly one GET, no seller credentials, structured output, no signed URL/base64 leak.
6. Manifest trusted-host permission check against the final packaged artifact.
7. Semantic receiver-field redaction regression.
8. Exact/transformed request metadata regression.
9. Personal-data OFF regression guard for personal-data operations.
10. Fail-honest FBP warehouse entitlement regression.
11. Full `report_*_create -> report_info -> report_file_get` deterministic workflow with lifecycle recreation at both command boundaries.
12. Final post-install live replay of the exact three-command workflow with fresh report code and fresh ref.
13. Full provider/dependency taxonomy audit for `seller_api`, `performance_api`, `report_file`, and any future provider/category: every planner, entitlement, policy, credentials, quota/cache, request-builder, accounting, output, diagnostic, guidance, storage, lifecycle, generated-copy, and test consumer must be enumerated and proven correct. Any catch-all assumption such as `not A => B` must be explicitly reviewed.
14. `report_file_get` must be tested through the real planning path, not only by direct provider invocation, and the full planning/output metadata must be asserted for semantic correctness.

This special matrix may be expanded by newly discovered defects; it must not be silently reduced while the repair cycle remains open.
