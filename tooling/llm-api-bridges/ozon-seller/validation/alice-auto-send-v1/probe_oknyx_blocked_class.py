#!/usr/bin/env python3
from __future__ import annotations
import hashlib,re,urllib.request
URL='https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
with urllib.request.urlopen(req,timeout=30) as r:data=r.read()
text=data.decode('utf-8','replace')
print('ASSET_SHA256='+hashlib.sha256(data).hexdigest())
for pat in [r'StandaloneOknyx[_-][A-Za-z0-9_-]+',r'StandaloneOknyx[^"\'\s,;:{}()]{0,80}',r'error:"blocked"===Y\.status',r'className:tt\(\{error:"blocked"===Y\.status[^}]+\},i\)']:
    found=[]
    for m in re.finditer(pat,text):
        s=m.group(0)
        if s not in found: found.append(s)
    print('PATTERN='+pat)
    print('MATCH_COUNT='+str(len(found)))
    for x in found[:100]: print('MATCH='+x)
