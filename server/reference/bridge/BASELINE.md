# Bridge Reference Baseline for Parallel Server Development

Date captured: 2026-09-03  
Purpose: architecture/reference snapshot only; NOT a frozen Bridge integration target.

## 1. Source branch at server split

Bridge source branch:

`feature/ozon-work-session-lifecycle-2026-08-21`

Branch commit observed at split:

`f2e360999a26682cfb4da2034666dcb29aef2ae7`

Commit message:

`feat(ozon): checkpoint explicit work-session refresh`

The server branch was created from this line for repository context. The Bridge is expected to continue changing independently.

At final integration, do NOT integrate this old hash merely because it is recorded here. Fetch the then-current accepted Bridge build and perform the P11 delta audit.

## 2. Historical v0.1.19 development baseline provenance

Existing Bridge baseline document:

`tooling/llm-api-bridges/ozon-seller/development/operator-v0.1.19/BASELINE.md`

It explicitly describes an operator-supplied v0.1.19 development baseline and states that it is not canonical release acceptance.

Recorded source artifact in that document:

`ozon-bridge-v0.1.19-extension.zip`

Recorded SHA-256 there:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

That historical file lists 17 production files including:

- `content_script.js`;
- `manifest.json`;
- `popup.*`;
- `service_worker.js`;
- `shared/ai_adapters.js`;
- `shared/bridge_autorun_model.js`;
- `shared/composer_send.js`;
- `shared/conversation_identity.js`;
- `shared/manual_controls.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_credentials.js`;
- `shared/ozon_provider.js`;
- `shared/proven_writing_block_capture.js`;
- `shared/provider_transport_core.js`;
- `shared/runtime_names.js`.

This list is useful only to understand major Bridge responsibility boundaries. Server architecture MUST NOT import those files during parallel development.

## 3. Product direction imported as server requirements

Source:

`tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRODUCT_DIRECTION_2026-08-13.md`

Important product ideas carried into the server architecture:

- product is a browser bridge, not its own analytics SaaS/LLM;
- user's chosen web AI performs reasoning/presentation;
- long-term abstraction separates business data adapters from AI adapters through a common bridge protocol;
- commercial server is a control plane;
- remote AI profiles are declarative, while executable extension logic remains packaged;
- credentials/business payloads should remain local in the baseline privacy architecture;
- admin/licensing/subscription/remote config/health belong to the commercial product;
- maintained compatibility, diagnostics and distribution are the commercial value, not code secrecy.

The original sequence in that older product-direction document said to finish the Bridge first and create the commercial product later. The 2026-09-03 architecture decision supersedes that sequencing only: server/control-plane development now proceeds in parallel. The separation/security principles remain applicable unless explicitly superseded by a newer ADR.

## 4. Integration-relevant Bridge invariants to preserve

The server architecture must preserve these Bridge classes of invariant at P11:

### Provider security

- fixed trusted provider hosts;
- fixed methods/operation registry;
- no assistant-controlled arbitrary URL/host/method/headers/auth;
- credential isolation;
- read-only operation model unless a future reviewed write product explicitly changes it;
- safe provider error normalization.

### Execution ownership

- exactly-once external provider request semantics for accepted work;
- no hidden replay caused by delivery recovery;
- provider work and AI delivery recovery are distinct;
- no unrelated UI/config/auth event resets provider quota/cache/execution state.

### AI/conversation ownership

- fail-closed conversation/binding ownership;
- independent tabs/conversations;
- independent AI service ownership;
- UI rebinding must not leak/cross-deliver result into another conversation.

### Quota/cache state

- provider quota/countdown state is provider lifecycle state;
- unrelated AI UI toggle/rebind must not reset it;
- durable recovery rules remain explicit.

## 5. Known historical failure classes relevant to future server integration

### Composer control classification

A prior Work-mode defect selected the wrong composer control instead of the send button. This established the need for surface-specific AI profiles and health contours for composer/send controls.

### Manual-mode cancellation / lifecycle coupling

A prior defect let a generic Manual UI state transition cancel delivery state unexpectedly. This established the need to separate UI lifecycle from durable provider/runtime state.

### Button re-enable / repeated request lifecycle

Repeated request tests exposed UI state issues where a control could remain disabled. Future remote config/bootstrap refresh must not introduce additional lifecycle resets.

These are regression classes, not server features.

## 6. Server parallel-development rule

Until P11:

- do not copy live Bridge runtime source into `server/apps`/`server/packages`;
- use schemas/fixtures/simulated clients;
- record new Bridge facts here only when they materially affect the future integration contract;
- if the Bridge changes in a way that contradicts `server/docs/INTEGRATION_CONTRACT.md`, resolve the architecture contract deliberately instead of opportunistic coupling.

## 7. P11 required fresh inputs

Before real integration, fetch and pin:

- current accepted Bridge branch/commit;
- current extension artifact SHA-256;
- current production file list/hashes;
- current Bridge roadmap/acceptance state;
- current AI adapter/surface model;
- current provider state ownership model;
- current regression suite/evidence;
- delta from this reference baseline.

Only that fresh P11 snapshot becomes the actual integration baseline.