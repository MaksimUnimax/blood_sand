import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const [repoArg, blobArg, destArg, expectedSizeArg = '', expectedSha256Arg = ''] = process.argv.slice(2);

function fail(message) {
  console.error(`RESOLVED_GIT_OBJECT_MATERIALIZER_FAIL:${message}`);
  process.exit(1);
}

if (!repoArg || !blobArg || !destArg) {
  fail('usage: node RESOLVED_GIT_OBJECT_MATERIALIZER.mjs <repo-root> <exact-git-blob-sha> <dest> [expected-size] [expected-sha256]');
}

const repo = path.resolve(repoArg);
const dest = path.resolve(destArg);
const blob = String(blobArg).trim().toLowerCase();
const expectedSize = expectedSizeArg === '' ? null : Number(expectedSizeArg);
const expectedSha256 = expectedSha256Arg === '' ? null : String(expectedSha256Arg).trim().toLowerCase();

if (!fs.existsSync(path.join(repo, '.git'))) fail(`repo-not-git-worktree:${repo}`);
if (!/^[0-9a-f]{40}$/.test(blob)) fail(`invalid-blob-sha:${blob}`);
if (expectedSize !== null && (!Number.isSafeInteger(expectedSize) || expectedSize < 0)) fail(`invalid-expected-size:${expectedSizeArg}`);
if (expectedSha256 !== null && !/^[0-9a-f]{64}$/.test(expectedSha256)) fail(`invalid-expected-sha256:${expectedSha256}`);

function git(args) {
  const r = spawnSync('git', ['-C', repo, ...args], {
    encoding: null,
    windowsHide: true,
    maxBuffer: 256 * 1024 * 1024,
    shell: false,
  });
  if (r.error) fail(`git-spawn:${r.error.message}`);
  if (r.status !== 0) {
    const stderr = Buffer.isBuffer(r.stderr) ? r.stderr.toString('utf8') : String(r.stderr || '');
    fail(`git-${args.join('-')}:exit=${r.status}:stderr=${stderr.trim()}`);
  }
  return Buffer.isBuffer(r.stdout) ? r.stdout : Buffer.from(r.stdout || '');
}

const type = git(['cat-file', '-t', blob]).toString('ascii').trim();
if (type !== 'blob') fail(`object-type:${type}`);

// This is the only authority-byte source: raw bytes emitted by Git's object database.
// No connector-decoded text, PowerShell text pipeline, HTTP response body, newline conversion,
// Unicode normalization, JSON round-trip or fs.writeFileSync(string) is permitted here.
const bytes = git(['cat-file', 'blob', blob]);

const computedBlob = createHash('sha1')
  .update(Buffer.from(`blob ${bytes.length}\0`, 'ascii'))
  .update(bytes)
  .digest('hex');
const sha256 = createHash('sha256').update(bytes).digest('hex');

if (computedBlob !== blob) fail(`git-blob-identity:expected=${blob}:computed=${computedBlob}`);
if (expectedSize !== null && bytes.length !== expectedSize) fail(`size:expected=${expectedSize}:actual=${bytes.length}`);
if (expectedSha256 !== null && sha256 !== expectedSha256) fail(`sha256:expected=${expectedSha256}:actual=${sha256}`);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, bytes);
const reread = fs.readFileSync(dest);
const rereadBlob = createHash('sha1')
  .update(Buffer.from(`blob ${reread.length}\0`, 'ascii'))
  .update(reread)
  .digest('hex');
const rereadSha256 = createHash('sha256').update(reread).digest('hex');

if (!reread.equals(bytes)) fail('write-read-byte-drift');
if (rereadBlob !== blob) fail(`reread-git-blob:expected=${blob}:actual=${rereadBlob}`);
if (rereadSha256 !== sha256) fail(`reread-sha256:expected=${sha256}:actual=${rereadSha256}`);

console.log(JSON.stringify({
  result: 'RESOLVED_GIT_OBJECT_MATERIALIZER_PASS',
  repo,
  blob,
  bytes: bytes.length,
  sha256,
  dest,
}));
