# Ozon V2 Step 5 workflow/report/document acceptance template

This file is a non-authoritative template until exact-package CI is green and the placeholders below are replaced with final run/artifact identities.

Status: `PENDING_STEP5_EXACT_PACKAGE_ACCEPTANCE`

## Scope

- Roadmap Step 5 only: Seller workflow/report/document reads.
- Frozen terminal-decision universe: 118 exact-schema pending operations.
- Decisions: 28 implement reads, 60 reject server-side generation/creation, 25 reject mutation/side effect, 3 reject sunset/replaced, 2 reject deprecated/replaced.
- Accepted Step3 Seller read surface before Step5: 191 aliases.
- Step5 candidate adds exactly 28 new Seller reads, producing 219 Seller aliases.
- Nine of the new reads attach to the existing B0 Personal Data gate; no second privacy mechanism is introduced.
- Four direct PDF/PNG reads use byte-preserving single-request transport.

## Required final evidence

- Exact Step3 base tree: `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`.
- Exact Step5 final tree: `3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`.
- Linux exact-package job: PENDING.
- Windows exact-package job: PENDING.
- Exact-package artifact ID/digest: PENDING.
- Independent artifact verification: PENDING.

## Safety invariants

- One explicit command performs at most one Ozon business request.
- No hidden pagination, retry, polling, fan-out, provider chaining, or automatic document-URL fetch.
- Server-side create/generate operations are not reclassified as reads.
- Existing Step3 registry/contract/entitlement semantics remain preserved.
- Personal Data OFF continues to block before provider execution with zero external business requests; enabling the setting does not replay blocked commands.
- `service_worker.js`, `shared/ozon_provider.js`, Work/manual/session lifecycle remain protected from Step5 production changes.
- No fresh Ozon Seller business API request is part of acceptance.

Do not treat this template as formal acceptance. Formal acceptance requires marker `OZON_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_ACCEPTED` in a separate final acceptance file after clean exact-package evidence.
