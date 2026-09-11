# Alice auto-send — corrected pre-fix authority after first synthetic hypothesis failed

The first synthetic pre-fix gate on run `34555256499` is preserved as negative evidence but is **not** root-cause authority.

It modeled Alice controls as siblings outside `[data-highlight-id="alice-input"]`. The saved current Alice HTML for release `release-v1.139.0-2026.09.09` disproves that topology assumption: the textarea and `StandaloneRichInput-Controls`/`oknyx` control are inside the same Alice input subtree. Therefore the earlier assertion `ALICE_SEND_BUTTON_MUST_RESOLVE_IN_REALISTIC_SIBLING_TOPOLOGY` tested an inaccurate fixture.

Current production still has a separate live failure: after one TXT is visibly attached and the `OZON_BATCH_RESULT_V1` marker is staged, automatic Send does not occur. The live screenshot does not expose the button's current DOM `aria-label`, so this correction does not invent one.

The next diagnostic must determine the current first-party Oknyx active-send state contract and/or reproduce the complete post-attachment Send chain against an accurate DOM shape before any production write.

Provider calls: `0`.
Production writes after exact executable `39eadd2699320774ef53964ea8cf347057c1b813`: `0`.
