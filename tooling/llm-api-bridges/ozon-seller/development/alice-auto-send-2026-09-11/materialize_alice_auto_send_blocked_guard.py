#!/usr/bin/env python3
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TARGET = ROOT / "dist-step7-candidate/shared/ai_adapters.js"

old = '''      if (aria === "отправить") return { kind: controlDisabled(button) ? "send_disabled" : "send_active", button };'''
new = '''      if (aria === "отправить") {
        // Alice's first-party StandaloneOknyx handler intentionally no-ops submit while
        // inputStore.status === "blocked". The current Alice bundle exposes that state as
        // the boolean BEM modifier StandaloneOknyx_error even when the native button is not
        // disabled and aria-label is still "Отправить". Treat it as send-disabled so the
        // delivery state machine waits before SEND_COMMIT instead of committing a no-op click.
        const aliceInputBlocked = button.classList?.contains?.("StandaloneOknyx_error") === true;
        return { kind: (controlDisabled(button) || aliceInputBlocked) ? "send_disabled" : "send_active", button };
      }'''

text = TARGET.read_text(encoding="utf-8")
if text.count(old) != 1:
    raise SystemExit(f"materializer authority mismatch: expected exactly one old Alice send classifier, found {text.count(old)}")
if "StandaloneOknyx_error" in text:
    raise SystemExit("materializer refuses to double-apply Alice blocked-send guard")
TARGET.write_text(text.replace(old, new), encoding="utf-8")
print("ALICE_AUTO_SEND_BLOCKED_GUARD_MATERIALIZED")
