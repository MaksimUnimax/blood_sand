import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_SOURCE_GIT_BLOB = '0da73bdd1bb1608074781bb0c594c7875a4fe3ce';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
if (!fs.existsSync(harnessPath) || !fs.existsSync(path.join(candidateDir, 'service_worker.js'))) {
  throw new Error('usage: node V3E_WORKER_GIT_BLOB_RUNNER.mjs <exact-v3c-worker-harness.mjs> <exact-v3-candidate-dir>');
}
const gitBlobSha = (buf) => createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const raw = fs.readFileSync(harnessPath);
const actualBlob = gitBlobSha(raw);
if (actualBlob !== EXPECTED_SOURCE_GIT_BLOB) throw new Error(`worker harness Git blob mismatch: expected ${EXPECTED_SOURCE_GIT_BLOB}, got ${actualBlob}`);
const src = raw.toString('utf8');
const oldLine = "const now=Date.now(); const last=now-64800; const due=last+65000;";
const newLine = "const now=Date.now(); const last=now-57000; const due=last+65000;";
const occurrences = src.split(oldLine).length - 1;
if (occurrences !== 1) throw new Error(`expected one race fixture line, found ${occurrences}`);
const corrected = src.replace(oldLine, newLine);
const changed = src.split('\n').reduce((n, line, i) => n + (line !== corrected.split('\n')[i] ? 1 : 0), 0);
if (changed !== 1) throw new Error(`unexpected transformed line count: ${changed}`);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ozon-v3e-worker-'));
const correctedPath = path.join(tempDir, 'V3E_WORKER_ACTUAL_PATH_HARNESS.mjs');
fs.writeFileSync(correctedPath, corrected, 'utf8');
console.log(`V3E_WORKER_SOURCE_GIT_BLOB=${actualBlob}`);
console.log(`V3E_WORKER_SOURCE_SHA256=${sha256(raw)}`);
console.log(`V3E_WORKER_CORRECTED_SHA256=${sha256(Buffer.from(corrected, 'utf8'))}`);
console.log('V3E_WORKER_RACE_FIX_ONLY=PASS');
const syntax = spawnSync(process.execPath, ['--check', correctedPath], { encoding: 'utf8' });
process.stdout.write(syntax.stdout || ''); process.stderr.write(syntax.stderr || '');
if (syntax.status !== 0) process.exit(syntax.status ?? 1);
const run = spawnSync(process.execPath, [correctedPath, candidateDir], { encoding: 'utf8', timeout: 90000 });
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
process.exit(run.status ?? 1);
