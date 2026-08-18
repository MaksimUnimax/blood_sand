import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_SOURCE_GIT_BLOB = '0da73bdd1bb1608074781bb0c594c7875a4fe3ce';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
if (!fs.existsSync(harnessPath) || !fs.existsSync(path.join(candidateDir, 'service_worker.js'))) {
  throw new Error('usage: node V3F_WORKER_STATE_DIAGNOSTIC_RUNNER.mjs <exact-v3c-worker-harness.mjs> <exact-v3-candidate-dir>');
}
const gitBlobSha = (buf) => createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const raw = fs.readFileSync(harnessPath);
const actualBlob = gitBlobSha(raw);
if (actualBlob !== EXPECTED_SOURCE_GIT_BLOB) throw new Error(`worker harness Git blob mismatch: expected ${EXPECTED_SOURCE_GIT_BLOB}, got ${actualBlob}`);
let src = raw.toString('utf8');
const raceOld = "const now=Date.now(); const last=now-64800; const due=last+65000;";
const raceNew = "const now=Date.now(); const last=now-57000; const due=last+65000;";
if (src.split(raceOld).length - 1 !== 1) throw new Error('race fixture anchor mismatch');
src = src.replace(raceOld, raceNew);
const waitOld = "const waiting=await waitFor(async()=>{const x=(await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key3]; return x?.batch?.request_state==='quota_waiting'?x:null;},3000);";
const waitNew = `let waiting;\ntry {\n  waiting=await waitFor(async()=>{const x=(await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key3]; return x?.batch?.request_state==='quota_waiting'?x:null;},3000);\n} catch (error) {\n  const debugManual=(await chrome.storage.local.get(KEYS.MANUAL_OPERATIONS))[KEYS.MANUAL_OPERATIONS]?.[key3] || null;\n  const debugQuota=(await chrome.storage.local.get(KEYS.PROVIDER_QUOTA_STATE))[KEYS.PROVIDER_QUOTA_STATE] || null;\n  const debugCache=(await chrome.storage.local.get(KEYS.PROVIDER_RESULT_CACHE))[KEYS.PROVIDER_RESULT_CACHE] || null;\n  const debugDiagnostics=(await chrome.storage.local.get(KEYS.DIAGNOSTICS))[KEYS.DIAGNOSTICS] || null;\n  console.log('V3F_DEBUG_MANUAL_OPERATION='+JSON.stringify(debugManual));\n  console.log('V3F_DEBUG_QUOTA_STATE='+JSON.stringify(debugQuota));\n  console.log('V3F_DEBUG_CACHE_STATE='+JSON.stringify(debugCache));\n  console.log('V3F_DEBUG_PROVIDER_CALLS='+JSON.stringify(providerCalls));\n  console.log('V3F_DEBUG_DIAGNOSTICS='+JSON.stringify(debugDiagnostics));\n  throw error;\n}`;
if (src.split(waitOld).length - 1 !== 1) throw new Error('guarded-wait anchor mismatch');
src = src.replace(waitOld, waitNew);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ozon-v3f-worker-'));
const diagnosticPath = path.join(tempDir, 'V3F_WORKER_STATE_DIAGNOSTIC_HARNESS.mjs');
fs.writeFileSync(diagnosticPath, src, 'utf8');
console.log(`V3F_WORKER_SOURCE_GIT_BLOB=${actualBlob}`);
console.log(`V3F_WORKER_SOURCE_SHA256=${sha256(raw)}`);
console.log(`V3F_WORKER_DIAGNOSTIC_SHA256=${sha256(Buffer.from(src,'utf8'))}`);
console.log('V3F_WORKER_TEST_ONLY_TRANSFORM=PASS');
const syntax = spawnSync(process.execPath, ['--check', diagnosticPath], { encoding:'utf8' });
process.stdout.write(syntax.stdout || ''); process.stderr.write(syntax.stderr || '');
if (syntax.status !== 0) process.exit(syntax.status ?? 1);
const run = spawnSync(process.execPath, [diagnosticPath, candidateDir], { encoding:'utf8', timeout:90000 });
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
try { fs.rmSync(tempDir,{recursive:true,force:true}); } catch (_) {}
process.exit(run.status ?? 1);
