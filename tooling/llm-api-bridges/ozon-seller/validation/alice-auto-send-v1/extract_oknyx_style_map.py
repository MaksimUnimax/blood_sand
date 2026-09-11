#!/usr/bin/env python3
from __future__ import annotations
import hashlib,re,urllib.request
URL='https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
with urllib.request.urlopen(req,timeout=30) as r:data=r.read()
text=data.decode('utf-8','replace')
print('ASSET_SHA256='+hashlib.sha256(data).hexdigest())
needle='className:tt({error:"blocked"===Y.status'
i=text.find(needle)
print('TARGET_OFFSET='+str(i))
if i<0: raise SystemExit('TARGET_NOT_FOUND')
# Print the smallest useful module-local prefix around the component to expose imports/style map bindings.
s=max(0,i-14000); e=min(len(text),i+2500)
frag=text[s:e]
print('=== COMPONENT_PREFIX ===')
print(frag)
print('=== CANDIDATE_STYLE_BINDINGS ===')
for pat in [r'\bi\s*=\s*[^,;]{1,500}',r'\bi\s*=\s*\w+\([^)]{0,120}\)',r'\bi\s*=\s*e\([^)]{0,120}\)',r'\btt\s*=\s*[^,;]{1,500}']:
    vals=[]
    for m in re.finditer(pat,frag):
        v=m.group(0)
        if v not in vals: vals.append(v)
    print('PATTERN='+pat+' COUNT='+str(len(vals)))
    for v in vals[-20:]: print('BINDING='+v)
