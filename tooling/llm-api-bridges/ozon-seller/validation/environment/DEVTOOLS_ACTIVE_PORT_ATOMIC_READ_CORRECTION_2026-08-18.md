# Ozon full-gate validation-only correction — atomic DevToolsActivePort read

Date: 2026-08-18
Status: `VALIDATION_ONLY_ENVIRONMENT_CORRECTION`

## Authority

Production candidate remains immutable:

- gate input checkpoint: `013aeec19fe44f6b6c15aaa39d0d70388f1d2029`
- frozen artifact SHA-256: `d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`
- repair patch SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`
- expected final worker SHA-256: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- expected final content SHA-256: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Previous full-gate report:
`422be20263dc620c7fa134e3159faa4c71eac1c1`

The previous run completed blocks 01-14 PASS and failed block 15 before browser assertions with Windows/CFT `DevToolsActivePort` environment/file-lock behavior. This document authorizes no production edit.

## Exact validation-only correction

The accepted browser harness source currently does this in two separate operations:

1. wait until `DevToolsActivePort` appears/readable;
2. read the file again to obtain `[port, wsPath]`.

On Windows, the file may transiently be locked between those operations. The validation-only correction must replace that split sequence with ONE bounded helper that repeatedly attempts the complete read/parse operation and returns only when a valid DevTools endpoint is obtained.

Equivalent required semantics:

```js
async function readDevToolsActivePort(portFile, timeout = 10000) {
  const start = Date.now();
  let lastTransient = null;
  while (Date.now() - start < timeout) {
    try {
      const text = fs.readFileSync(portFile, 'utf8').trim();
      const lines = text.split(/\r?\n/);
      const port = String(lines[0] || '').trim();
      const wsPath = String(lines[1] || '').trim();
      if (/^\d+$/.test(port) && wsPath.startsWith('/')) {
        return { port, wsPath };
      }
    } catch (error) {
      const code = String(error?.code || '');
      if (!['ENOENT', 'EBUSY', 'EPERM', 'EACCES'].includes(code)) throw error;
      lastTransient = code;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`DevToolsActivePort timeout${lastTransient ? ` after ${lastTransient}` : ''}: ${stderr.slice(-1200)}`);
}
```

Then use exactly the returned values:

```js
const { port, wsPath } = await readDevToolsActivePort(portFile);
const browser = await puppeteer.connect({ browserWSEndpoint: `ws://127.0.0.1:${port}${wsPath}` });
```

## Boundaries

This is validation fixture/environment code only.

Do NOT:

- edit production files;
- change candidate hashes;
- change Chrome version;
- change Node/Puppeteer versions;
- replace the accepted Chrome-for-Testing route;
- replace `browser.installExtension()` with `--load-extension`;
- increase or weaken browser assertions;
- skip any browser assertion;
- treat an invalid/partial `DevToolsActivePort` file as success;
- ignore non-transient filesystem errors;
- make real Seller/Performance requests.

The existing overall bounded wait remains authoritative. This correction only makes the read-and-parse operation atomic with respect to transient Windows file locking.

## Rerun rule

The next authoritative validation must reconstruct the candidate from scratch and rerun all applicable full-gate blocks 01-16 in ONE consolidated run. Do not resume from block 15 and do not reuse partial PASS state as the authoritative run.
