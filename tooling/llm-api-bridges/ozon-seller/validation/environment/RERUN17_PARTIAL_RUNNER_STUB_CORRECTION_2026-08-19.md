# Ozon validation — RERUN17 partial-runner stub correction

Date: 2026-08-19
Status: `VALIDATION_ONLY_HARNESS_CORRECTION`

Authority:
- gate checkpoint `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- RERUN17 report `97cfa16c5cddcfa6b09bf3aa3dac7026cd063e60`
- worker activation/order correction `a7d2e1ca92c711089ff556c9e14a1870eb474eea`
- worker direct-CDP correction `376886cd29d971a354dc18f313fbeb9ba1153922`
- control-flow correction `57efec456b5416094fca0917a2310a5946106a1b`

RERUN17 proved canonical CFT reconciliation PASS, copied setup exit 78, post-setup byte identity PASS, exact spawn-argument match PASS, and extension installation returning the candidate id. It then terminated because the validation runner itself explicitly threw:

`Error: browser substrate harness unavailable after canonical CFT reconciliation`

Worker activation, worker Runtime, raw-page adapter self-check and permanent blocks were not attempted. This is `HARNESS_ERROR`; it is not environment or production evidence.

## Mandatory correction

A future full-gate runner is invalid before execution unless its exact source contains executable implementations, not prose/placeholders, for all required phases.

Before launch, statically reject the runner if any of the following appears in executable phase code: `unavailable`, `not implemented`, `NotImplemented`, `TODO`, `placeholder`, `stub`, or an unconditional throw/return/exit that substitutes for a required phase.

The exact runner source must contain and reach, after Phase-A/B0 prerequisites, concrete Phase-B calls/equivalents for:
- `browser.installExtension` and `browser.extensions`;
- browser-level `Target.createTarget`;
- raw PAGE `Runtime.enable`, `Page.enable`, `Fetch.enable`, and harmless Runtime evaluation;
- `Target.getTargets`;
- `ServiceWorker.enable` and, when no worker exists, exactly one `ServiceWorker.startWorker` using an observed exact candidate registration scope;
- bounded discovery by both Puppeteer extension workers and raw service-worker targets;
- direct worker CDP Runtime/Network via `worker.client.send`, with raw same-worker `Target.attachToTarget(..., flatten:true)` fallback;
- raw PAGE synthetic adapter operations required by block 15.

The exact runner source must also contain actual executable Phase-C harness invocations for every applicable permanent block 01-14, actual Phase-D browser-harness invocation/assertions, and actual Phase-E ZIP/fresh-extract/byte-verification code. Declaring phase names or markers is insufficient.

Static control-flow PASS is invalid unless this implementation-completeness check also passes.

No production/candidate/dependency/browser-version change is authorized by this correction.