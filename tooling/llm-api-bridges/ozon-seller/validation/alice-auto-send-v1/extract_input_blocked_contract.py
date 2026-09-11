#!/usr/bin/env python3
from __future__ import annotations
import hashlib,re,urllib.request
URL='https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
with urllib.request.urlopen(req,timeout=30) as r:data=r.read()
text=data.decode('utf-8','replace')
print('ASSET_SHA256='+hashlib.sha256(data).hexdigest())
needles=['"blocked"', 'status:"blocked"', "status:'blocked'", 'blocked:', 'isFilesIncompatibleWithMode', 'filesContent.length', 'statusUpload.status']
for needle in needles:
    pos=[m.start() for m in re.finditer(re.escape(needle),text)]
    print(f'=== NEEDLE {needle} MATCHES={len(pos)} ===')
    for i in pos[:20]:
        frag=text[max(0,i-1800):min(len(text),i+2200)].replace('\n',' ')
        if 'input' in frag.lower() or 'file' in frag.lower() or 'StandaloneOknyx' in frag or 'status' in frag:
            print(f'OFFSET={i}')
            print(frag)
            print('\n---\n')
