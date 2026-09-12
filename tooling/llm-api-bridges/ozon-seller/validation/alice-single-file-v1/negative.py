"""Kill intentional regressions in isolated temporary copies; never mutate the candidate."""
import pathlib,shutil,subprocess,tempfile,sys,hashlib,json,os
here=pathlib.Path(__file__).resolve().parent;dist=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
policy='shared/file_delivery_model_policy.js';worker='shared/file_delivery_port_worker.js';model='shared/bridge_autorun_model.js'
mutants=[
 ('ordered-command-regression',worker,'return sha256Hex(new TextEncoder().encode(canonical(normalized)));','return sha256Hex(new TextEncoder().encode(JSON.stringify(normalized)));','Retained TXT JSON key permutation'),
 ('semantic-command-bypass',worker,'scope.command_key !== await localCommandKey(command)','false','Retained TXT modified offset'),
 ('budget-disabled',policy,'if (completedFiles.size < maximum) return null;','if (true) return null;','manual Alice second original deferred BEFORE fetch'),
 ('lost-inline-text',worker,'if (typeof inlineText === "string") {','if (false) {','manual Alice original + info + HELP'),
 ('scope-bypass',worker,'|| scope.credential_revision !== await deliveryCredentialRevision(settings)', '|| false','Retained TXT changed credentials'),
 ('expiry-bypass',worker,'record.expires_at_ms <= nowMs()', 'false','Retained deadline check independent of background cleanup'),
 ('hash-bypass',worker,'|| await sha256Hex(source) !== record.sha256', '|| false','Retained TXT corrupt hash'),
 ('toast-only-failure',worker,'const fallback = await fallbackBeforeAttachment(found, message.code);','const fallback = null;','Alice pre-attachment error yields'),
 ('http0-file-lost',model,'const localRef = localFileRefFromEntry(entry);','const localRef = null;','Retained TXT survives confirmation'),
 ('premature-prefix-credit',worker,'prefixDelivered = false;', 'prefixDelivered = true;','Deferred complete text must not falsely acknowledge')]
rows=[]
for label,file,before,after,case in mutants:
 with tempfile.TemporaryDirectory(prefix='ozon-single-mutant-') as temp:
  d=pathlib.Path(temp)/'dist';shutil.copytree(dist,d);p=d/file;s=p.read_text(encoding='utf-8');assert before in s,label
  if label!='premature-prefix-credit':assert s.count(before)==1,(label,s.count(before))
  p.write_text(s.replace(before,after),encoding='utf-8')
  r=subprocess.run(['node',str(here/'green.mjs'),str(d)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=90)
  text=r.stdout.decode('utf-8',errors='replace');(out/(label+'.log')).write_bytes(r.stdout)
  assert r.returncode!=0 and 'FAIL '+case in text,(label,'wrong failure',text[-3000:])
  rows.append({'control':label,'status':'EXPECTED_FAIL','caught_by':case,'sha256':hashlib.sha256(r.stdout).hexdigest()});print(label,'EXPECTED_FAIL',flush=True)
(out/'summary.json').write_text(json.dumps({'status':'PASS','controls':rows,'provider_calls':0},indent=2)+'\n',encoding='utf-8')
