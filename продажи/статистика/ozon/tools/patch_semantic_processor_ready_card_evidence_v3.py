#!/usr/bin/env python3
from pathlib import Path
import hashlib

TARGET = Path('/tmp/run_semantic_analysis_full.py')
BASE_SHA = 'a0a42af85f6624e0047b49156b8b7759703ca9cc4bde48a4544bce6e1848b5c5'
PATCHED_SHA = '6f0a24fb60ab47dce35589003cc64212d656d2cd746ce56c5bad3a49eb093685'

old = """        elif st in ('EXACT_PRODUCT','STRONG_PRODUCT') and ow['ownership_type'] in ('SKU_SPECIFIC','FAMILY_SHARED'):\n            dec='READY_CANDIDATE'; dest='TITLE' if cv and cv['title_coverage']=='ABSENT' else 'LONG_DESCRIPTION'\n"""
new = """        elif st in ('EXACT_PRODUCT','STRONG_PRODUCT') and ow['ownership_type'] in ('SKU_SPECIFIC','FAMILY_SHARED'):\n            # READY requires explicit current-card support for the relevance decision.\n            # If the classifier could not surface card evidence, fail closed instead of\n            # manufacturing a publishable recommendation from query/ownership alone.\n            if r.get('supported_card_evidence'):\n                dec='READY_CANDIDATE'; dest='TITLE' if cv and cv['title_coverage']=='ABSENT' else 'LONG_DESCRIPTION'\n            else:\n                dec='HOLD_AMBIGUOUS'; dest='HOLD'\n"""

raw = TARGET.read_bytes()
actual = hashlib.sha256(raw).hexdigest()
if actual != BASE_SHA:
    raise SystemExit(f'base processor SHA mismatch: {actual}')
text = raw.decode('utf-8')
if text.count(old) != 1:
    raise SystemExit(f'expected exactly one patch target, found {text.count(old)}')
TARGET.write_text(text.replace(old, new), encoding='utf-8')
actual = hashlib.sha256(TARGET.read_bytes()).hexdigest()
if actual != PATCHED_SHA:
    raise SystemExit(f'patched processor SHA mismatch: {actual}')
print(f'patched_processor_sha256={actual}')
