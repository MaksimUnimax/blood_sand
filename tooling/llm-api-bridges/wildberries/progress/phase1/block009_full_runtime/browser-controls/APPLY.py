#!/usr/bin/env python3
"""Apply to full runtime reconstruction AFTER tests001/source-fix.diff.
Usage: python APPLY.py RECONSTRUCTED_WORKSPACE_WITH_SRC
No network. This is an intermediate source checkpoint, not final certification.
"""
from pathlib import Path
import base64,lzma,hashlib,subprocess,sys
here=Path(__file__).resolve().parent;root=Path(sys.argv[1]).resolve()
raw=lzma.decompress(base64.b64decode(''.join((here/f'source.part{i:02}').read_text().strip() for i in range(1,4)),validate=True))
assert hashlib.sha256(raw).hexdigest()=='2671ff628e3a9fb104c48f2cb6c5d2235d4e3a530bfd3ff6be686ff56bf846a7'
p=root/'browser-controls.patch';p.write_bytes(raw)
subprocess.run(['git','-C',str(root),'apply','--check',str(p)],check=True,timeout=15)
subprocess.run(['git','-C',str(root),'apply',str(p)],check=True,timeout=15)
print('APPLIED_SOURCE_CHECKPOINT; final package tests still required')
