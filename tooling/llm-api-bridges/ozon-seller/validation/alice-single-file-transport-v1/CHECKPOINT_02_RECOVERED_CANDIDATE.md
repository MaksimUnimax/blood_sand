# Checkpoint 02 — candidate recovered and independently rerun

Previous staged payload is COMPLETE, not partial: concatenate part1/2/3.b64, strict base64 decode, XZ decompress. Compressed bytes=40156, SHA256=5029b9a54f37d49b3fff559f6acfd0a776ac02a4f1930c0c1ef2a3c2725012bb. Decoded unified patch bytes=155947, SHA256=cebd23e60583c6d669beac49733d078a90e6ecf972f57ab6ee5754e5843144d6. Patch applies cleanly to baseline 06ec1af2. No production materialization on remote yet.

Local recovery verification (fresh runtime, not inherited previous PASS):
- 1442 baseline file hashes and sizes match frozen Actions artifact.
- Three baseline behavioral RED proofs reproduced: synthetic mixed TXT count failure; second download made before capacity check; pre-attach failure deletes result without LLM reply.
- Candidate green.mjs: 55/55 actual worker queue/Port behavioral cases PASS.
- audit.py: exactly 6 changed production files,26 unchanged;8 consumer source files; profiles and protected ownership/send/transport paths unchanged.
- negative.py:8/8 named mutation controls reject at expected tests (budget,inline text,scope,expiry,hash,toast-only fallback,HTTP0 file recognition,prefix credit).
- Business data in ChatGPT live control are not published or re-requested. Local/CI test providers are synthetic.

Candidate source changes: service_worker.js; shared/bridge_autorun_model.js; shared/file_delivery_model_policy.js; shared/file_delivery_port_worker.js; shared/llm_output_report_workflow_patch.js; attachment_delivery_port_content.js. No manifest/profile/credential/API registry/transport changes.

Design: durable completed-entry Alice-only file budget; local HTTP0 deferral with exact next command; one attachment + full inline results; oversized result retained whole as scoped,expiring local TXT with explicit next command; safe text failure handover only before attachment commit; existing unknown-outcome no-resend protections preserved. ChatGPT multifile and companion policy unchanged.

NEXT: full ephemeral CI targeted + all prior31 scripts; inspect failures without weakening guards; independent source/security review; production materialization only after GREEN; frozen executable → same ZIP Linux→Chrome→Windows→finalizer; remote readback and exact handoff. Current status IN_PROGRESS, NOT PRE-HANDOFF PASS, LIVE PENDING POST-INSTALL.
