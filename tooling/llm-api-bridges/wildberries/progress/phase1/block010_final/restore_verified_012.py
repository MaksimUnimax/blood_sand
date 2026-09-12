"""Recover known six-byte damaged archive transport against the real user upload.
References are NEVER edited. Both input and output SHA256 are enforced.
python restore_verified_012.py REFERENCE_DIRECTORY NEW_ARCHIVE
"""
from pathlib import Path
import base64,hashlib,json,sys
reference,output=map(lambda x:Path(x).resolve(),sys.argv[1:]);assert not output.exists()
parts=sorted((reference/'archive-exact').glob('wildberries-bridge-v0.1.2-extension.zip.b64.part*'))
assert len(parts)==10
payload=bytearray(base64.b64decode(b''.join(p.read_bytes().strip() for p in parts),validate=True))
actual=hashlib.sha256(payload).hexdigest();good='56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715';bad='0bf387ed936b66fcaf1da481c3fc2c6b90bd77500113d66266c208b130814edc'
changes=[]
if actual==bad:
 for offset,old,new in [(14,150,71),(15,198,253),(16,4,40),(17,176,128),(54,49,50),(315,22,54)]:
  assert payload[offset]==old;payload[offset]=new;changes.append([offset,old,new])
else:assert actual==good,'Unknown baseline transport; do not patch it speculatively'
assert len(payload)==84964 and hashlib.sha256(payload).hexdigest()==good
output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(payload)
print(json.dumps({'input_sha256':actual,'output_sha256':good,'bytes':len(payload),'verified_user_byte_corrections':changes,'references_modified':False}))
