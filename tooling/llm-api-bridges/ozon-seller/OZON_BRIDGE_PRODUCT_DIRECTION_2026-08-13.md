# Ozon Bridge — product direction and decisions

Date: 2026-08-13
Repository: `MaksimUnimax/blood_sand`
Working branch: `work/ozon-data-collection-2026-08-11`
Baseline HEAD at document creation: `b3863037d4bb41a978da01a8affc912e24bf25b4`
Baseline state: Ozon Bridge v0.1.10 acceptance/hardening work is present on the branch.

## 1. Decision

The current `blood_sand` Ozon branch remains the engineering laboratory for the bridge.

We do **not** create the commercial product repository yet.

First we finish Ozon Bridge until it works as the intended universal browser bridge with multiple web AI services. Only after that do we create a new repository and move the clean, proven extension core there together with the commercial server, admin panel, licensing, subscription, remote adapter registry and later new data sources.

Current sequence:

1. Finish Ozon data access and bridge reliability.
2. Generalize the AI side so the bridge is not ChatGPT-specific.
3. Prove the full end-user workflow on several materially different AI web interfaces.
4. Prove Chrome + Yandex Browser compatibility from one Chromium-oriented core.
5. Freeze an accepted extension build as the migration baseline.
6. Create a new commercial repository.
7. Move only the clean, proven product core and its acceptance evidence into the new repository.
8. Add server/admin/subscription/remote configuration there.
9. Expand beyond Ozon only after the Ozon product path is proven.

## 2. Product thesis

The product is **not an analytics SaaS** and is **not its own AI**.

The product is a bridge:

`Ozon API <-> browser extension <-> user's chosen web AI`

The user should not have to learn Ozon reports, manually download spreadsheets, understand API methods, configure MCP, install local agent tooling, buy model API access, or move data between services by hand.

The target promise is simple:

> Install the extension, choose the AI you already use, connect Ozon once, and ask questions in normal language.

Examples:

- "Compare my sales for June and July."
- "Which products caused the largest decline?"
- "Why did revenue rise faster than profit?"
- "Compare advertising efficiency for these periods."
- "Make the result as a table."
- "Draw a chart."
- "Prepare a file/report for my partner."

The bridge supplies factual Ozon data. The chosen AI decides how to reason about it and how to present it.

## 3. Core differentiation

The intended differentiation is not "Ozon + AI" in the abstract.

The intended differentiation is:

> **The seller's own Ozon data in the AI the seller already uses, with minimal setup and without a separate analytics cabinet.**

The user may use:

- ChatGPT;
- Alice;
- DeepSeek;
- Grok;
- Claude;
- Gemini;
- other supported web AI products added later.

A paid model API is not inherently required. If a supported free web AI is capable of reading the protocol and producing commands, the bridge should work with it too.

A weaker model may only retrieve, compare and structure data. A stronger model may perform deeper analysis, correlations, explanations, document generation and other reasoning. The bridge itself stays the same.

This creates an important property: improvements in external AI products improve the usefulness of the bridge without requiring us to build our own reasoning engine.

## 4. Intended user flow

The desired end-user flow is:

1. User installs the extension.
2. User selects a supported AI from a list.
3. User enters Ozon access credentials once.
4. User opens the selected AI and clicks `Start` in the extension.
5. The extension inserts a versioned bridge instruction/handshake prompt into the AI conversation.
6. The AI confirms that it understands the bridge protocol and is ready.
7. The user asks an ordinary business question in natural language.
8. The AI determines which Ozon data is needed and emits one or more bridge commands.
9. The extension discovers all valid commands.
10. The user explicitly triggers execution.
11. The bridge executes the batch using the established serial/exactly-once/recovery architecture.
12. The bridge inserts one final structured batch result into the conversation.
13. The AI produces the user-facing answer in whatever form it supports: prose, table, chart, document, file, further analysis, etc.

The normal UX target is:

> **one user question -> one execution action -> one data report -> one useful AI answer**

The protocol must still permit another batch when a genuinely complex question needs additional data.

## 5. Handshake / first-message protocol

Multi-AI operation should start with a deliberate handshake rather than relying on undocumented model behavior.

The initial injected instruction should define at least:

- what Ozon Bridge is;
- which operations/data surfaces are available;
- the exact command envelope/version;
- batch behavior;
- the rule that the bridge is read-only unless a future product explicitly introduces reviewed write operations;
- how to request data;
- how to interpret a batch result;
- how to handle provider/validation errors;
- how to avoid inventing unavailable facts;
- when another batch is allowed;
- a machine-recognizable readiness marker.

A model-specific prompt may be used when needed. Strong models can receive a richer compact protocol; weaker models may need a shorter, stricter instruction.

The extension should consider the AI ready only after a successful handshake/readiness condition defined for that adapter.

## 6. Extension architecture direction

The extension should be split conceptually into independent layers.

### 6.1 Ozon data adapter

Responsibilities:

- credentials handling;
- Ozon request construction;
- pagination/continuation where required;
- validation;
- normalization needed for the bridge contract;
- provider errors;
- read-only security policy;
- batch execution;
- recovery without replay.

### 6.2 Common bridge protocol/core

Responsibilities:

- command discovery in arbitrary AI text;
- strict JSON/protocol validation;
- queueing;
- sequential execution;
- exactly-once external-request semantics per accepted queue item;
- one final batch result;
- delivery state machine;
- recovery and diagnostics.

A single command remains a batch of one.

### 6.3 AI adapter engine

The core must not hard-code the entire product around one AI DOM.

Each supported AI should have an adapter/profile that describes how the generic engine interacts with that site, including concepts such as:

- supported domains;
- conversation/composer detection;
- insertion target;
- send control detection;
- stop/busy state detection;
- completion/readiness detection;
- message/result insertion path;
- fallback selectors/strategies;
- timeouts/feature flags where appropriate.

The long-term commercial version should receive **declarative adapter configuration** from the product server. Executable extension logic must remain packaged with the extension; remote configuration must not become remote executable code.

### 6.4 Browser compatibility

The goal is one Chromium-oriented extension core, tested for at least:

- Google Chrome;
- Yandex Browser.

Avoid separate product codebases unless an actual compatibility limitation forces one.

## 7. Data and privacy direction

Preferred commercial architecture:

- Ozon credentials stay on the user's device/extension storage under the strongest practical local protection available to the extension architecture;
- Ozon requests go directly from the extension/browser environment to Ozon where technically allowed by the final architecture;
- raw seller sales/finance/advertising data should not be routed through our commercial server unless a future feature genuinely requires it and the privacy model is explicitly changed;
- the commercial server should primarily manage licensing, supported AI registry, adapter/config versions, health state, extension compatibility and administration.

A strong product claim should be achievable:

> Seller business data is not stored in our analytics cloud because we do not operate an analytics cloud.

This must be validated against the final implementation and browser/Ozon constraints before being used in public marketing.

## 8. Server role in the future commercial repository

The future server is a **control plane**, not an analytics engine.

Expected responsibilities:

- subscription/license status;
- account/device/session policy as eventually chosen;
- supported-AI registry;
- declarative adapter/profile versions;
- compatibility constraints;
- health/degraded status for adapters;
- release/update notices;
- diagnostics metadata;
- admin panel support;
- payments/subscription integration;
- later data-source registry for WB/Yandex/etc.

Not expected as a baseline responsibility:

- LLM inference;
- Ozon analytics computation;
- large seller-data storage;
- report generation;
- graph generation;
- model-specific reasoning.

Those capabilities belong to the user's selected AI.

## 9. Operational model for changing AI websites

AI web interfaces will change. This is expected maintenance, not an exception.

The target maintenance model is:

1. automated/scheduled smoke checks inspect supported AI interfaces;
2. an adapter is marked healthy/degraded/broken;
3. ordinary selector/DOM changes are fixed by changing declarative remote profile data in the future commercial system;
4. if the site's interaction model changes beyond the capabilities of the packaged adapter engine, a new extension release is made;
5. admin/monitoring should make failures visible before large numbers of users report them.

The test matrix should account for at least AI x browser and, where necessary, important UI/account variants.

## 10. Support economics

Target introductory price discussed: **190 RUB per 30 days**.

At this price the product must remain highly self-service.

The economics rely on very low marginal infrastructure cost because:

- we do not buy LLM inference for normal use;
- the user already has/free-uses the selected AI;
- Ozon supplies the source API;
- the user supplies the browser/device;
- our server is primarily a control/configuration plane.

The main operating-cost risk is therefore support, not compute.

The extension should eventually expose diagnostics such as:

- subscription/license state;
- selected AI adapter state;
- adapter/profile version;
- Ozon credential/API connectivity state;
- bridge protocol version;
- current delivery/batch state;
- a safe diagnostic export that does not leak credentials or private business payloads.

At 190 RUB, a product that routinely requires manual per-user debugging is not viable.

## 11. Copying / piracy position

The extension should not be designed around expensive anti-copying work.

The core idea and browser code are reproducible. A technically capable user can build a personal bridge with modern coding models. At a 190 RUB subscription price, the commercial value should instead be:

- installation convenience;
- ongoing compatibility maintenance;
- supported AI coverage;
- Ozon API maintenance;
- tested releases;
- remote profiles/configuration;
- diagnostics;
- trust and continuity.

A copied build is a snapshot. A subscription is the maintained product.

## 12. Competitive working conclusion

Current competitors and adjacent products validate the demand for AI-assisted marketplace data access, but the working product hypothesis is narrower:

- many existing products place the seller inside their own SaaS/AI interface;
- agent/skill/MCP approaches can require API tokens, local tooling, configuration or a compatible agent runtime;
- our intended experience is ordinary supported web AI + browser extension + Ozon credentials, with no developer workflow.

This is a product hypothesis, not a permanent moat. Competitors can copy the architecture. The defensible value is execution quality, low friction, broad AI compatibility, ongoing maintenance and distribution.

## 13. Product scope after Ozon proves the model

The long-term product should not remain Ozon-only.

Candidate business-data sources discussed:

- Wildberries;
- Yandex Direct;
- Yandex Wordstat;
- Yandex Metrica;
- Yandex Webmaster;
- later direct own-site/CRM/CMS/order sources where useful.

The intended long-term abstraction is:

`business data adapters -> common bridge protocol -> any supported AI adapter`

Do not implement N x M custom integrations. Data adapters and AI adapters must remain independent behind the common protocol.

The user-facing value then becomes:

> **One connector. Your business data. Your AI.**

Potential cross-source questions:

- compare Ozon and WB performance;
- detect products declining on both marketplaces;
- relate Wordstat demand to marketplace sales;
- compare Direct spend with site and marketplace results;
- produce a daily business summary across marketplaces and own-site channels.

## 14. Main risks

The project should explicitly track these risks:

1. **AI DOM/interface churn** — manageable only with adapter abstraction, monitoring and rapid profile/release updates.
2. **AI output variability** — weak models may fail protocol instructions; handshake, strict parsing and model-specific prompts are required.
3. **Context/result size** — large reports may exceed a model's practical context; the protocol must support bounded results and additional batches.
4. **Ozon API changes** — the data adapter requires ongoing maintenance.
5. **Browser extension store/privacy requirements** — permissions, disclosures and remote-configuration design must be compliant.
6. **Credential trust** — onboarding and architecture must make clear where Ozon credentials live and what the extension can do.
7. **Support burden** — at 190 RUB/month, diagnostics and self-healing matter more than manual support.
8. **Copyability** — code is not the moat; maintained compatibility and distribution are.
9. **Commercial validation** — the largest business risk is not technical feasibility but whether sellers continue paying after initial novelty.

## 15. Commercial validation principle

Do not confuse technical capability with product-market fit.

The strongest demo is intentionally simple:

1. Open a supported AI, including a free one if possible.
2. Ask: "Compare my Ozon sales for June and July."
3. Execute the bridge command once.
4. Receive the factual result.
5. Ask the AI for a table/chart/file without touching Ozon reports manually.

The first real proof of the product is a seller paying the intended low subscription price and continuing to use it because it removes recurring work.

## 16. Boundary between current branch and future product repository

### Current `blood_sand` Ozon branch

Purpose: prove and harden the technology.

Should end with:

- stable Ozon data bridge;
- stable batch/recovery/delivery architecture;
- generic AI adapter engine;
- several supported AI web interfaces;
- Chrome + Yandex Browser acceptance;
- handshake/onboarding flow proven;
- security/credential model documented;
- acceptance tests and evidence;
- one final migration-ready extension build.

### Future separate commercial repository

Purpose: ship and operate the business.

Starts only after the above is accepted.

Adds:

- product branding/site;
- licensing/subscription;
- payment integration;
- control-plane server;
- admin panel;
- remote AI profile registry;
- automated adapter health monitoring;
- production onboarding;
- support diagnostics;
- store distribution/release process;
- later WB/Yandex/own-site source adapters.

## 17. Final current decision

Do **not** split repositories today.

Finish the Ozon bridge and multi-AI proof in this branch first.

When the final extension satisfies the migration gates in the companion roadmap, create a separate commercial repository and migrate the clean accepted implementation rather than the entire experimental history.
