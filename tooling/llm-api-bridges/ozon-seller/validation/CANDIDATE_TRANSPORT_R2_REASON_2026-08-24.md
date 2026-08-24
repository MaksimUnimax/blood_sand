# Patch A browser candidate transport R2

The first GitHub binary handoff was rejected before browser testing because the connector upload truncated the 136504-byte ZIP to 10818 bytes.

Correct local candidate identity:
- SHA-256: d5e25219c7010495328c8310e0932d468b305921fd1349177fda49ffcb7439b4
- Git blob SHA of the original ZIP bytes: 7292fbbc4133ddad046da050c11d67adf9419183
- Size: 136504 bytes

R2 transports the exact ZIP as ordered base64 text chunks. Concatenating parts in lexical order and base64-decoding must reproduce the exact candidate bytes and the SHA-256 above. This is transport reconstruction only, not a rebuild or production-code modification.
