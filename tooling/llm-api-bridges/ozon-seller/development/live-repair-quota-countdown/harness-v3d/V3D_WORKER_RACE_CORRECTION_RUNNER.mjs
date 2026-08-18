import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_V3C_SHA256 = '92818e7348212f13a06a806ebb5e86776a877171d8344964ffc1dfbd66355d78';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
if (!fs.existsSync(harnessPath) || !fs.existsSync(path.join(candidateDir, 'service_worker.js'))) {
  throw new Error('usage: node V3D_WORKER_RACE_CORRECTION_RUNNER.mjs <exact-v3c-worker-harness.mjs> <exact-v3-candidate-dir>');
}
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const raw = fs.readFileSync(harnessPath);
if (sha256(raw) !== EXPECTED_V3C_SHA256) throw new Error('V3C worker harness SHA-256 mismatch');
const src = raw.toString('utf8');
const oldLine = "const now=Date.now(); const last=now-64800; const due=last+65000;";
const newLine = "const now=Date.now(); const last=now-57000; const due=last+65000;";
const occurrences = src.split(oldLine).length - 1;
if (occurrences !== 1) throw new Error(`expected one race fixture line, found ${occurrences}`);
const corrected = src.replace(oldLine, newLine);
const oldLines = src.split('\n');
const newLines = corrected.split('\n');
const changedLines = oldLines.filter((line, i) => line !== newLines[i]);
if (changedLines.length !== 1) throw new Error(`unexpected transformed line count: ${changedLines.length}`);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ozon-v3d-worker-'));
const correctedPath = path.join(tempDir, 'V3D_WORKER_ACTUAL_PATH_HARNESS.mjs');
fs.writeFileSync(correctedPath, corrected, 'utf8');
console.log(`V3D_WORKER_SOURCE_SHA256=${EXPECTED_V3C_SHA256}`);
console.log(`V3D_WORKER_CORRECTED_SHA256=${sha256(Buffer.from(corrected, 'utf8'))}`);
console.log('V3D_WORKER_RACE_FIX_ONLY=PASS');
const syntax = spawnSync(process.execPath, ['--check', correctedPath], { encoding: 'utf8' });
process.stdout.write(syntax.stdout || ''); process.stderr.write(syntax.stderr || '');
if (syntax.status !== 0) process.exit(syntax.status ?? 1);
const run = spawnSync(process.execPath, [correctedPath, candidateDir], { encoding: 'utf8', timeout: 60000 });
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
process.exit(run.status ?? 1);
