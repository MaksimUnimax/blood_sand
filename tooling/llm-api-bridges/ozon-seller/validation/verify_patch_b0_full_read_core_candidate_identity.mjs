import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node verify_patch_b0_full_read_core_candidate_identity.mjs <candidate-dir>');
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`candidate directory not found: ${root}`);

const EXPECTED_FILE_COUNT = 21;
const EXPECTED_TREE_SHA256 = 'd313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe';
const EXPECTED_SHA256 = {
  'manifest.json': 'f170949e9f972ecbc8c685a3cb753151c3363afa7664a3df76e67f413a396fc1',
  'popup.html': 'a36539a6b16e423d1a91fff518af140b37934281ba2d2be8c4c1091ba32d72a3',
  'popup.js': '9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070',
  'service_worker.js': 'b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87',
  'shared/runtime_names.js': 'a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59',
  'shared/ozon_contract.js': 'e7ce6d7c77360529097ac0bcd5981f2dd4dc1856fb279b4d14364fe394ff5992',
  'shared/ozon_guidance.js': '8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508',
  'shared/ozon_operation_registry.js': 'b5b16f7cb11cf92823920f49dd4ba2c66f17e830adb6edad575f1f995c16d673',
  'shared/ozon_entitlements.js': '6bd6f949d7aff29f80ce9e48154a37446dd5f9acc9fcd6528e9d1d4578a37ca5'
};

const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');

function filesRecursive(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesRecursive(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const files = filesRecursive(root);
if (files.length !== EXPECTED_FILE_COUNT) throw new Error(`B0 production file count ${files.length} != ${EXPECTED_FILE_COUNT}`);

for (const [rel, expected] of Object.entries(EXPECTED_SHA256)) {
  const file = path.join(root, ...rel.split('/'));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`missing expected B0 file: ${rel}`);
  const actual = sha256(fs.readFileSync(file));
  if (actual !== expected) throw new Error(`B0 identity mismatch ${rel}: ${actual} != ${expected}`);
}

const lines = files
  .map(file => {
    const rel = path.relative(root, file).split(path.sep).join('/');
    return { rel, line: `${rel}\0${sha256(fs.readFileSync(file))}\n` };
  })
  .sort((a, b) => a.rel.localeCompare(b.rel, 'en'))
  .map(x => x.line)
  .join('');
const tree = sha256(Buffer.from(lines, 'utf8'));
if (tree !== EXPECTED_TREE_SHA256) throw new Error(`B0 tree identity ${tree} != ${EXPECTED_TREE_SHA256}`);

console.log('B0_NODE_PRODUCTION_FILE_COUNT_21_PASS');
console.log('B0_NODE_CHANGED_FILE_IDENTITIES_PASS');
console.log('B0_NODE_TREE_MANIFEST_SHA256_PASS');
console.log(tree);
console.log(root);
