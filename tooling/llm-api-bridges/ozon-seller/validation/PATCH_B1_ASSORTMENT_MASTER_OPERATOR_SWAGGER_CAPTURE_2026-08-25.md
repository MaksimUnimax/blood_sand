# Patch B1 — operator capture of exact Assortment Master contracts

Date: 2026-08-25
Status: evidence acquisition only; production implementation remains blocked until captured evidence is inspected.

## Why this exists

The accepted repository authority proves current Product Master paths/fragments but intentionally leaves full request/response contracts incomplete. Node/Undici cannot retrieve the fixed official Swagger because of redirect-loop behavior, and the independent Codex environment has no persistent Chrome.

This procedure uses the operator's real Chrome and the installed extension service-worker DevTools only to read the fixed Ozon-owned documentation artifact. It does not call Seller API business endpoints and does not access Seller credentials.

## Hard source boundary

The only network source permitted by this capture is:

`https://docs.ozon.ru/api/seller/swagger.json`

Targets:

- `/v3/product/list`
- `/v3/product/info/list`
- `/v4/product/info/attributes`

Do not replace the source with a mirror, SDK, generated client or model reconstruction.

## Operator procedure

1. Open `chrome://extensions` in the same real Chrome profile where the tested Ozon Bridge extension is installed.
2. Enable Developer mode if needed.
3. Find the Ozon Bridge extension and open its service-worker inspector (`Service worker` / `Inspect views`).
4. In the service-worker DevTools **Console**, paste the script below as one block and execute it.
5. The script does not read `chrome.storage`, Client-Id, Api-Key or any Seller credential.
6. On success it prints `B1_OPERATOR_SWAGGER_CAPTURE_PASS` and invokes DevTools `copy(...)` with a bounded JSON evidence package. Paste that copied JSON back into the ChatGPT/Ozon development conversation (or save it to a text/JSON file and attach it).
7. On failure, copy the complete `B1_OPERATOR_SWAGGER_CAPTURE_FAILED` console output instead. Do not alter the URL or substitute another source.

## Console script

```js
(async () => {
  const SOURCE = 'https://docs.ozon.ru/api/seller/swagger.json';
  const TARGETS = [
    '/v3/product/list',
    '/v3/product/info/list',
    '/v4/product/info/attributes'
  ];
  const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

  const sha256 = async bytes => {
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const decodeRefPart = part => part.replace(/~1/g, '/').replace(/~0/g, '~');
  const resolveLocalRef = (doc, ref) => {
    if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
    let cur = doc;
    for (const raw of ref.slice(2).split('/')) {
      const key = decodeRefPart(raw);
      if (!cur || typeof cur !== 'object' || !(key in cur)) return undefined;
      cur = cur[key];
    }
    return cur;
  };
  const collectRefs = (value, out = new Set()) => {
    if (!value || typeof value !== 'object') return out;
    if (Array.isArray(value)) {
      for (const item of value) collectRefs(item, out);
      return out;
    }
    if (typeof value.$ref === 'string') out.add(value.$ref);
    for (const nested of Object.values(value)) collectRefs(nested, out);
    return out;
  };
  const closure = (doc, root) => {
    const pending = [...collectRefs(root)];
    const seen = new Set();
    const resolved = {};
    const unresolved = [];
    while (pending.length) {
      const ref = pending.shift();
      if (seen.has(ref)) continue;
      seen.add(ref);
      const value = resolveLocalRef(doc, ref);
      if (value === undefined) {
        unresolved.push(ref);
        continue;
      }
      resolved[ref] = value;
      for (const nested of collectRefs(value)) if (!seen.has(nested)) pending.push(nested);
    }
    return { resolved, unresolved };
  };

  try {
    const response = await fetch(SOURCE, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
      headers: { Accept: 'application/json' }
    });
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    if (!response.ok) throw new Error(`HTTP ${response.status}; final_url=${response.url}; body_prefix=${JSON.stringify(text.slice(0, 300))}`);

    let doc;
    try { doc = JSON.parse(text); }
    catch (error) { throw new Error(`JSON parse failed: ${error.message}; body_prefix=${JSON.stringify(text.slice(0, 300))}`); }

    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('Swagger root is not an object');
    if (!(typeof doc.openapi === 'string' || typeof doc.swagger === 'string')) throw new Error('No openapi/swagger marker');
    if (!doc.paths || typeof doc.paths !== 'object' || Array.isArray(doc.paths)) throw new Error('paths is missing/invalid');
    if (Object.keys(doc.paths).length < 100) throw new Error(`Suspiciously small path inventory: ${Object.keys(doc.paths).length}`);

    const final = new URL(response.url || SOURCE);
    if (final.protocol !== 'https:' || final.hostname !== 'docs.ozon.ru' || final.pathname !== '/api/seller/swagger.json') {
      throw new Error(`Unexpected final source: ${final.href}`);
    }

    const targets = {};
    for (const path of TARGETS) {
      const pathItem = doc.paths[path];
      if (!pathItem) throw new Error(`Missing target path: ${path}`);
      const operations = {};
      for (const [name, operation] of Object.entries(pathItem)) {
        if (!METHODS.has(name.toLowerCase())) continue;
        const refs = closure(doc, operation);
        operations[name.toUpperCase()] = {
          operation,
          referenced_components: refs.resolved,
          unresolved_refs: refs.unresolved
        };
      }
      if (!Object.keys(operations).length) throw new Error(`No HTTP operation on target path: ${path}`);
      targets[path] = {
        path_level_parameters: pathItem.parameters || null,
        operations
      };
    }

    const evidence = {
      evidence_schema: 'B1_ASSORTMENT_MASTER_OPERATOR_SWAGGER_CAPTURE_V1',
      requested_url: SOURCE,
      final_url: response.url || SOURCE,
      http_status: response.status,
      captured_at_utc: new Date().toISOString(),
      byte_length: bytes.byteLength,
      sha256: await sha256(bytes),
      openapi: doc.openapi || null,
      swagger: doc.swagger || null,
      path_count: Object.keys(doc.paths).length,
      servers: doc.servers || null,
      host: doc.host || null,
      basePath: doc.basePath || null,
      targets
    };

    const payload = JSON.stringify(evidence, null, 2);
    console.log('B1_OPERATOR_SWAGGER_CAPTURE_PASS');
    console.log('requested_url', evidence.requested_url);
    console.log('final_url', evidence.final_url);
    console.log('http_status', evidence.http_status);
    console.log('byte_length', evidence.byte_length);
    console.log('sha256', evidence.sha256);
    console.log('path_count', evidence.path_count);
    console.log('target_methods', Object.fromEntries(Object.entries(targets).map(([p, v]) => [p, Object.keys(v.operations)])));
    copy(payload);
    return evidence;
  } catch (error) {
    console.error('B1_OPERATOR_SWAGGER_CAPTURE_FAILED', error && error.stack ? error.stack : error);
    throw error;
  }
})();
```

## Evidence rule

Only `B1_OPERATOR_SWAGGER_CAPTURE_PASS` plus the copied evidence package can close these contract gaps. A redirect loop, HTML challenge, missing target path, unresolved required `$ref`, parse error or unexpected final host/path remains an explicit evidence acquisition failure. No B1 contract field may be guessed in response.

## Business-request count

This procedure must produce:

- real Seller API business requests: `0`;
- real Performance API requests: `0`;
- credential reads: `0`.
