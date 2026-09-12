# Alice single-file repair — resumed execution

Owner renewed execution authorization: «Делай». Continue to verified package; never mark pre-handoff as live.

Live remote readback: a8aede1f4bb643ea98e216e063e6dfa0a6636a04. Production directory still at combined XLSX/expiry/UI baseline 06ec1af2a1d90e2ff192e749b5bf90129963dd05. No production publication yet.

Recovered exact frozen sources (1442 tracked files), all SHA-256 verified against audit manifest. Recovered stage1 patch: 155947 bytes, SHA-256 cebd23e60583c6d669beac49733d078a90e6ecf972f57ab6ee5754e5843144d6. Stage transport has 3 base64 parts; these are test staging, not installable extension files.

The previous ephemeral full run passed deterministic and historical regressions but failed real Chrome after worker restart: LOCAL_DELIVERY_COMMAND_MISMATCH. Cause: the new private retained-TXT command check incorrectly depended on object member insertion order. Planned correction: SHA-256 of normalized command with recursively sorted object keys, preserving array order and values. Existing global request fingerprints are unchanged. Prior local green logs are historical evidence only, not reused as final proof.

Only the execution notes and evidence survived the session boundary, not the corrected runtime files. Reconstruct the documented correction against the integrity-verified stage1, prove key-order RED on stage1, run all candidate and mutation tests anew, publish the test-only overlay, run whole ephemeral + real Chrome before production publication.

Local direct git read unavailable due DNS; connected GitHub Actions is the available full-history and real-browser environment. No Ozon calls. No force/reset. Do not change target profile, limit, provider transport, credentials contracts, XLSX parser or unrelated runtime.

Remaining: correction + test-only publication → complete ephemeral Linux/Chrome gate → materialize exact 6 production files + test/docs → freeze executable commit/tree → one identical ZIP Linux/Chrome/Windows → verify every log/hash and 35 gates → evidence publication/readback → handoff. LIVE-GATE-01..05 remain PENDING POST-INSTALL.
