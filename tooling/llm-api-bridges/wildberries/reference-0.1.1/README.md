# Canonical Wildberries Bridge v0.1.1 reference

Canonical install artifact: `wildberries-bridge-v0.1.1-extension.zip`.

- bytes: `82701`
- SHA-256: `3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2`
- production files: **17**

GitHub stores the exact install ZIP as base64 parts under `archive-exact/`. Run `rebuild_extension.py` to reconstruct and verify the byte-exact artifact.

The install ZIP itself contains all 17 unminified production files, including `content_script.js`, `service_worker.js`, popup files, and the complete executable registry under `shared/`.

A supplemental full source/tests/evidence bundle was retained separately:

- bytes: `183421`
- SHA-256: `b7e08ca72b52af3c34ff33d742faf10cea9a9b9dc25df75cf6134ed8b233d041`

That supplemental bundle is evidence convenience only; it is not required to reconstruct the canonical production extension stored here.

Acceptance: **AUTOMATED TESTED**; **LIVE USER-ACCOUNT ACCEPTED** remains pending.
