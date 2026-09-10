#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADAPTERS = ROOT / "dist-step7-candidate/shared/ai_adapters.js"


def replace_once(old: str, new: str) -> None:
    text = ADAPTERS.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected one Alice adapter hardening anchor, found {count}")
    ADAPTERS.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
'''  function aliceFileInput() {
    const scopes = aliceAttachmentScopes();
    for (const scope of scopes) {
      const all = [...scope.querySelectorAll('input[type="file"]')].filter((input) => input instanceof HTMLInputElement && input.isConnected && !input.disabled);
      if (!all.length) continue;
      return aliceUniqueFileInput(scope);
    }
    const documentCandidates = [...document.querySelectorAll('input[type="file"]')]
      .filter((input) => aliceFileInputScore(input) >= 0)
      .map((input) => ({ input, score: aliceFileInputScore(input) }));
    if (!documentCandidates.length) return null;
    documentCandidates.sort((a, b) => b.score - a.score);
    const top = documentCandidates[0];
    return documentCandidates.filter((item) => item.score === top.score).length === 1 ? top.input : null;
  }
''',
'''  function aliceFileInput() {
    const scopes = aliceAttachmentScopes();
    for (const scope of scopes) {
      const all = [...scope.querySelectorAll('input[type="file"]')].filter((input) => input instanceof HTMLInputElement && input.isConnected && !input.disabled);
      if (!all.length) continue;
      return aliceUniqueFileInput(scope);
    }
    return null;
  }
''')

replace_once(
'''        if (!preview?.isConnected || preview.matches?.('[aria-busy="true"]') || preview.querySelector?.('[aria-busy="true"]')) return false;
''',
'''        if (!preview?.isConnected || !visible(preview) || preview.matches?.('[aria-busy="true"]') || preview.querySelector?.('[aria-busy="true"]')) return false;
''')

print("ALICE_SCOPED_ATTACHMENT_HARDENING_MATERIALIZED")
