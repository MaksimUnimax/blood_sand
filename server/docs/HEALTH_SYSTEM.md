# AI Compatibility Health System

Status: normative architecture for roadmap P8  
Date: 2026-09-03

## 1. Objective

Detect material changes in supported AI web interfaces early enough to repair the product before they become widespread user failures.

The system must distinguish:

- harmless page churn;
- early structural drift while fallbacks still work;
- degraded integration;
- complete workflow breakage;
- test-environment uncertainty.

The health system does not inspect user accounts. It uses dedicated controlled test accounts/browser profiles.

## 2. Core architecture

```text
Scheduler / Admin trigger
        |
        v
Health Orchestrator
        |
        +--> Browser Driver: Chrome
        |        |
        |        +--> AI test account/profile
        |
        +--> Browser Driver: Yandex Chromium (later)
                 |
                 +--> same health suite contract
        |
        v
Deterministic contour checks
        |
        v
Evidence sanitizer/collector
        |
        v
Health classifier
        |
        +--> HEALTHY
        +--> DRIFT
        +--> DEGRADED
        +--> BROKEN
        +--> UNKNOWN
        |
        v
Incident / notification
        |
        v
Codex repair packet (implementation aid)
        |
        v
Candidate profile/code
        |
        v
Candidate health run
        |
        v
Explicit approval -> staged rollout -> post-rollout health
```

Codex writes repair code/configuration from evidence and approved architecture. Codex does not define health truth and does not directly deploy unreviewed changes.

## 3. Why whole-page diff is insufficient

Modern AI sites continuously change:

- generated class names;
- experiment wrappers;
- analytics markup;
- irrelevant sidebars;
- timestamps;
- account banners;
- feature experiments.

Therefore whole HTML hash/DOM equality would create noise.

Primary monitoring unit is a named **critical UI contour** representing a bridge dependency.

A bounded DOM/fingerprint diff can be stored as evidence around that contour, but not used as the sole health definition.

## 4. Health state model

### `HEALTHY`

All required contours pass expected primary strategies and behavioral assertions. Optional contours may be absent only if explicitly allowed by suite definition.

### `DRIFT`

User workflow still works, but expected structure changed in a way that reduces redundancy or indicates likely future breakage.

Example:

- primary send-button selector no longer matches;
- packaged fallback matches and behavior passes.

This MUST trigger an early warning.

### `DEGRADED`

Core workflow remains possible, but one or more important capabilities/fallbacks are unavailable or less reliable.

Examples:

- native Copy contour broken while an approved alternate discovery path still works;
- completion detection falls back to a slower less reliable strategy;
- a non-core surface capability unavailable.

### `BROKEN`

The required product workflow cannot be completed safely/reliably.

Examples:

- composer cannot be found;
- send action cannot execute;
- assistant response cannot be correlated to the conversation;
- delivery path cannot preserve conversation ownership;
- required command discovery path cannot function.

### `UNKNOWN`

The run cannot establish product health because the test environment itself is uncertain.

Examples:

- AI login expired;
- CAPTCHA/security checkpoint;
- test account temporarily blocked;
- browser agent unavailable;
- network failure before page identity is established.

UNKNOWN is operationally actionable but must not falsely label the adapter broken.

### `MAINTENANCE`

Operator-controlled state. Product intentionally disabled for the affected scope.

## 5. Scope dimensions

Every result has an explicit scope:

- AI family;
- AI surface;
- AI UI variant where applicable;
- browser family;
- browser version;
- extension/adapter engine compatibility version;
- adapter profile revision;
- health suite revision.

Example:

`chatgpt / work / work_composer_v3 / chrome / profile 37`

A failure in this scope does not automatically prove failure in `chatgpt / standard` or Yandex Browser.

## 6. Critical contour schema

Each contour definition must include:

- stable contour key;
- purpose;
- required/optional classification;
- failure severity;
- primary detection strategy;
- ordered fallbacks;
- structural assertions;
- behavioral assertions;
- expected state transitions;
- evidence capture rules;
- redaction/sanitization rules;
- timeout budget;
- known acceptable variants.

Conceptual contour result:

```json
{
  "contour": "SEND_CONTROL",
  "required": true,
  "status": "DRIFT",
  "primary": {
    "matched": false
  },
  "fallback": {
    "strategy": "role_name",
    "matched": true
  },
  "behavior": {
    "enabled": true,
    "send_transition": "PASS"
  },
  "evidence": ["...safe references..."]
}
```

## 7. Baseline contour catalog

### C01 `PAGE_IDENTITY`

Proves that the expected AI product/surface is loaded and not a login/error/interstitial page.

Checks:

- trusted packaged host match;
- recognizable product/surface markers;
- absence/presence of known blocking state.

### C02 `CONVERSATION_ROOT`

Finds active conversation root and proves binding is unique enough for message ownership.

### C03 `COMPOSER_ROOT`

Finds the active composer container.

Assertions:

- visible;
- belongs to active conversation/surface;
- not stale hidden composer from another UI layer.

### C04 `COMPOSER_INPUT`

Finds editable user input target.

Structural:

- visible/editable;
- supported element semantics.

Behavioral:

- test text can be inserted through the packaged strategy;
- inserted text can be read back;
- existing prefilled text safety rule is respected.

### C05 `SEND_CONTROL`

Finds send action.

Structural:

- associated with active composer;
- visible/actionable;
- expected role/testid/semantic fallback.

Behavioral:

- after deterministic test prompt is inserted, control reaches expected enabled state;
- activation causes expected send/busy transition exactly once.

### C06 `BUSY_STOP_STATE`

Detects whether AI is generating/responding.

Behavioral:

- state becomes busy after send;
- returns to idle/completed state;
- no permanent false busy.

### C07 `ASSISTANT_MESSAGE`

Finds the assistant response created by the health prompt and associates it with the active conversation/run.

### C08 `MESSAGE_COMPLETION`

Proves response completion through packaged supported strategy.

### C09 `COMMAND_CODE_BLOCK_SURFACE`

Bridge-specific smoke contour. Uses a deterministic test fixture/prompt to prove that bridge-shaped command/code surfaces can be discovered by the packaged discovery mechanism.

It MUST NOT execute a real Ozon provider request merely to test AI DOM compatibility.

### C10 `NATIVE_COPY_CONTROL`

Where Bridge behavior relies on native Copy anchors, verify correct code block/control correlation and independence from unrelated copy controls.

### C11 `CONVERSATION_IDENTITY`

Proves that current conversation identity can be established and that message/delivery anchors correlate to the intended conversation.

### C12 `DELIVERY_INSERTION_PATH`

Using safe health fixture content, verifies the packaged delivery path can target the active conversation/composer without crossing ownership boundaries.

No real seller result is used.

### C13 `BLOCKING_STATE`

Detects login expiry, modal, paywall, verification checkpoint, consent overlay or other state that invalidates the run.

This contour usually drives UNKNOWN rather than BROKEN when the problem belongs to the controlled account/session rather than interface compatibility.

## 8. Test levels

### H0 — Static profile validation

No browser.

Checks:

- profile schema;
- allowed strategy types;
- timeout ranges;
- compatibility metadata;
- no remote executable fields;
- checksums/signature inputs.

Runs on every profile candidate.

### H1 — Deterministic DOM fixture tests

Local stored sanitized fixtures representing known UI variants.

Purpose:

- fast regression;
- prove selector fallback ordering;
- prove classifier state.

Not sufficient for production health by itself.

### H2 — Live structural smoke

Controlled browser opens AI and evaluates contours without necessarily sending a message where avoidable.

Frequent/cheap early warning.

### H3 — Live behavioral smoke

Controlled test conversation:

1. page/surface identify;
2. composer identify;
3. insert deterministic prompt;
4. send once;
5. observe busy;
6. observe response;
7. observe completion;
8. validate relevant bridge surfaces;
9. clean/reset according to account runbook.

This is the baseline daily production-support check for important surfaces.

### H4 — Candidate-profile acceptance

Runs current profile and candidate profile against the same supported matrix where possible.

Candidate must fix target incident without regressing previously passing critical contours.

### H5 — Post-rollout canary check

Runs after staged activation and observes both controlled health plus aggregate real-client safe diagnostics before broader rollout.

## 9. Scheduling strategy

Initial policy:

- H0/H1: every candidate/CI change;
- H2: several times daily may be added if inexpensive/useful;
- H3: at least daily per production-supported AI surface/browser baseline;
- H4: on every candidate fix;
- H5: on staged rollout and before expansion.

The exact cadence is configuration, not hard-coded domain behavior.

When an incident is open, temporary increased checks MAY be scheduled, bounded to avoid abusive traffic or account risk.

## 10. Browser drivers

Interface:

```text
BrowserDriver
  prepareSession()
  launch()
  open(url)
  getRuntimeMetadata()
  captureSafeScreenshot()
  closeOrPersist()
```

### ChromeDriver

First implementation/acceptance target.

### YandexChromiumDriver

Later implementation. Reuses health suites/contours but may have browser-specific launch/profile/permission behavior.

Do not duplicate AI contour logic unless a demonstrated browser difference requires an explicit variant.

## 11. Controlled account/session management

Each AI health target has dedicated accounts where service terms/operational policy permit automated checks.

Requirements:

- never use customer sessions;
- session/profile secrets stored outside Git;
- account purpose documented;
- reauthentication runbook;
- account lock/CAPTCHA classified separately from product breakage;
- tests produce minimal benign conversations;
- cleanup/retention managed.

If a service disallows the planned automation mode, that surface requires a compliant monitoring strategy; the health architecture must not depend on bypassing anti-bot/security controls.

## 12. Evidence bundle

A run may store:

- run ID/timestamp;
- AI/surface/variant;
- browser/runtime versions;
- profile/suite revisions;
- contour results;
- strategy names used;
- selected safe element attributes (`role`, `aria-*`, stable `data-*`, tag/type, bounded ancestor relation);
- sanitized bounded DOM fragment around failed contour;
- screenshot from dedicated health account;
- timing/state transition data;
- previous/current contour fingerprint;
- classifier output.

Do not capture unnecessary full-page DOM indefinitely.

Evidence has retention and classification.

## 13. Contour fingerprints

Fingerprints are early-warning metadata, not pass/fail truth.

A fingerprint can include normalized:

- tag;
- semantic role;
- stable attributes;
- bounded ancestor/descendant relationship;
- expected control count;
- selected visible labels where safe and stable.

Ignore known volatile values/classes.

Fingerprint change + passing behavior -> likely DRIFT.

## 14. Classification algorithm principles

Final scope health is derived deterministically from contour severity/status.

Example policy:

- required core contour hard fail -> BROKEN;
- primary fail + approved fallback behavior pass -> DRIFT;
- important non-core capability fail or fragile fallback -> DEGRADED;
- environment/session precondition failure -> UNKNOWN;
- all required primary/behavior checks pass -> HEALTHY.

Do not let an LLM override this result.

## 15. Incident lifecycle

```text
OPEN
 -> INVESTIGATING
 -> CANDIDATE_FIX
 -> CANDIDATE_PASS
 -> CANARY_ROLLOUT
 -> ROLLOUT
 -> RESOLVED
```

Alternative:

- `FALSE_POSITIVE` only when deterministic suite/profile definition was itself wrong, with a documented suite revision;
- `MAINTENANCE` when operator intentionally disables scope.

Incident records include first-seen, last-seen, affected matrix, contours, evidence and repair/rollout references.

## 16. Codex repair loop

On DRIFT/DEGRADED/BROKEN, the system prepares a machine-readable + human-readable repair packet containing:

- affected AI/surface/browser/profile;
- active profile schema/revision;
- failed contour(s);
- previous last-good evidence summary;
- current evidence summary;
- deterministic expected behavior;
- allowed repair surface;
- whether profile-only fix is plausible;
- regression matrix to run.

Codex receives a bounded implementation task.

Codex output should be one of:

1. profile-only candidate revision;
2. packaged adapter-engine code change + tests;
3. health-suite correction when test definition proven wrong;
4. blocker report when no safe supported repair exists.

No automatic production activation initially.

## 17. Profile-only vs extension-code decision

Profile-only repair is allowed when the new UI can be represented entirely by existing packaged declarative strategy vocabulary.

Extension release required when:

- new interaction primitive is needed;
- site semantics cannot be represented safely by current profile schema;
- packaged detector/observer/delivery engine needs logic change;
- browser permissions/manifest changes required;
- security boundary would otherwise be expanded remotely.

## 18. Staged rollout

Candidate profile progression example:

1. H0/H1 pass;
2. H4 live candidate pass;
3. explicit operator approval;
4. internal/health scope;
5. 5% client cohort;
6. observe diagnostics + H5;
7. 25%;
8. 100%.

Percentages are policy defaults, not hard requirements; critical emergency fixes may use a faster explicitly audited progression.

Every stage supports pause/rollback.

## 19. Alerts

Baseline alert conditions:

- first DRIFT on production-supported core contour;
- any DEGRADED;
- any BROKEN;
- repeated UNKNOWN above threshold;
- candidate profile fails previously healthy contour;
- rollout increases real-client error rate;
- health runner itself unavailable beyond threshold.

Channels are notification-provider adapters. Initial operational choice can be Telegram/email.

Avoid sending alert for every repeated run of the same open incident. Deduplicate/group by incident scope/root contour.

## 20. Dashboard requirements

Main view:

```text
AI / Surface / Browser | Health | Active Profile | Last Good | Current Incident
```

Detail view:

- current/last-good health run;
- contour matrix;
- primary/fallback usage;
- fingerprint changes;
- sanitized screenshot/evidence;
- incident timeline;
- candidate profile;
- test-candidate action;
- rollout controls;
- rollback;
- maintenance toggle.

## 21. Health/server integration

Health status feeds bootstrap/profile resolution.

Example:

- `HEALTHY`: normal availability;
- `DRIFT`: still available, operator warning;
- `DEGRADED`: availability policy may remain enabled with product notice or disable affected subcapability;
- `BROKEN`: affected adapter/surface can be remotely disabled;
- `UNKNOWN`: do not automatically mark broken unless policy/threshold says service reliability is unverified;
- `MAINTENANCE`: unavailable intentionally.

The health system can restrict availability; it cannot expand packaged capabilities.

## 22. First implementation sequence

1. define health schemas/entities;
2. implement health suite registry;
3. implement browser driver interface;
4. Chrome driver;
5. deterministic fixture tests;
6. first ChatGPT surface contour suite using current accepted knowledge at implementation time;
7. scheduled runner + persistence;
8. evidence sanitizer/object store;
9. classifier/incidents;
10. notifications;
11. candidate profile runner;
12. rollout integration;
13. Yandex driver/matrix later.

Do not freeze today's ChatGPT selector details into this architecture document. Actual selectors are profile revisions created from the then-current supported UI.