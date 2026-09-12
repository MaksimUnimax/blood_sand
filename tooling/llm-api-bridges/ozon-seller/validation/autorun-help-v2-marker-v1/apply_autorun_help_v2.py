"""Apply the authorized minimal HELP_V2 ingress repair; fail on source drift."""
from pathlib import Path
import hashlib
import sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '.')
dist=root if (root/'content_script.js').is_file() else root/'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate'
p=dist/'content_script.js'
before=p.read_bytes()
# Production is materialized from canonical Linux Git bytes, not a CRLF checkout.
if b'\r' in before: raise SystemExit('NON_CANONICAL_LINE_ENDINGS')
s=before.decode('utf-8')
anchor='  function candidateAfterAssistantBaseline(baselineIds, watchId) {'
helper='''  // Keep both Autorun ingress checks aligned with the ordered API/HELP discovery contract.
  function autorunCommandMarkerPresent(value) {
    const text = String(value || "");
    return [OzonContract.PREFIX, OzonRuntime.RUNTIME.helpPrefix, OzonRuntime.RUNTIME.helpPrefixV2]
      .some((prefix) => typeof prefix === "string" && prefix.length > 0 && text.includes(prefix));
  }

'''
changes=[(anchor,helper+anchor),
('const hasMarker = messageText.includes(OzonContract.PREFIX) || messageText.includes(OzonRuntime.RUNTIME.helpPrefix);','const hasMarker = autorunCommandMarkerPresent(messageText);'),
('if (!(latestText.includes(OzonContract.PREFIX) || latestText.includes(OzonRuntime.RUNTIME.helpPrefix)) || latestFingerprint !== candidate.message_fingerprint) {','if (!autorunCommandMarkerPresent(latestText) || latestFingerprint !== candidate.message_fingerprint) {')]
if 'function autorunCommandMarkerPresent' in s: raise SystemExit('ALREADY_PATCHED_OR_DRIFTED')
for old,new in changes:
    if s.count(old)!=1: raise SystemExit('EXACT_PATCH_ANCHOR_MISMATCH: '+old)
    s=s.replace(old,new,1)
p.write_bytes(s.encode('utf-8'))
print('BEFORE_SHA256='+hashlib.sha256(before).hexdigest())
print('AFTER_SHA256='+hashlib.sha256(p.read_bytes()).hexdigest())
print('CHANGED_PRODUCTION_FILES=1')
