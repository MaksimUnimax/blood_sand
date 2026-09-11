/* Ordered command envelopes + local registry guidance. No network or credentials.
 * Balanced-object scanning adapted from the pinned Ozon command contract.
 * WB adaptation: strict params, atomic syntax admission, mixed HELP/API order.
 */
(() => {
  'use strict';
  const C = globalThis.WBContract;
  if (!C) throw new Error('WBContract must load before WBCommandProtocol');
  const MAX_COMMANDS = 32, MAX_SOURCE_CHARS = 262144;
  const localCodes = new Set(['UNSUPPORTED_OPERATION','OPERATION_BLOCKED','NON_READ_OPERATION_FORBIDDEN','NON_CURRENT_OPERATION']);
  const forbidden = new Set(['url','uri','host','hostname','method','headers','authorization','apikey','clientid','clientsecret','xclientsecret','token','accesstoken','bearer','__proto__','prototype','constructor']);
  const plain = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.prototype.toString.call(v) === '[object Object]';
  const fail = code => { throw Object.assign(new Error(`WB command admission: ${code}.`), {code}); };
  const freeze = v => { if (v && typeof v === 'object' && !Object.isFrozen(v)) { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
  function guard(v, depth = 0, budget = {keys:0}) {
    if (depth > 16) fail('PARAMS_TOO_DEEP');
    if (v === null || ['boolean','string'].includes(typeof v)) return;
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (Array.isArray(v)) { if (v.length > 100000) fail('TOO_MANY_ITEMS'); v.forEach(x=>guard(x,depth+1,budget)); return; }
    if (!plain(v)) fail('INVALID_PARAMS_VALUE');
    for (const [key,x] of Object.entries(v)) {
      if (++budget.keys > 100000) fail('TOO_MANY_KEYS');
      if (forbidden.has(key.toLowerCase().replace(/[^a-z0-9]/g,'')) || ['__proto__','prototype','constructor'].includes(key)) fail('TRANSPORT_INJECTION_REJECTED');
      guard(x,depth+1,budget);
    }
  }
  function balancedEnd(source, start) {
    let depth=0, quoted=false, escaped=false;
    for (let i=start;i<source.length;i++) {
      const ch=source[i];
      if (quoted) { if (escaped) escaped=false; else if (ch==='\\') escaped=true; else if (ch==='"') quoted=false; continue; }
      if (ch==='"') quoted=true;
      else if (ch==='{') depth++;
      else if (ch==='}' && --depth===0) return i+1;
    }
    fail('INVALID_JSON');
  }
  function marker(source,start) {
    const re=/WB_(API|HELP)_V1(?![A-Za-z0-9_])/g; re.lastIndex=start;
    for (let m;(m=re.exec(source));) if (!/[A-Za-z0-9_]/.test(source[m.index-1] || '')) return m;
    return null;
  }
  function hasCommands(text) { return !!marker(String(text || ''),0); }
  function helpCommand(raw) {
    const allowed=raw.operation==='catalog'?['family','offset','limit']:raw.operation==='describe'?['alias']:null;
    if (!allowed) fail('HELP_UNSUPPORTED_OPERATION');
    if (Object.keys(raw.params).some(k=>!allowed.includes(k))) fail('HELP_UNKNOWN_PARAM');
    const p=raw.params;
    if (raw.operation==='describe') {
      if (typeof p.alias!=='string' || !/^[a-z0-9_]{1,120}$/.test(p.alias)) fail('HELP_INVALID_ALIAS');
      return {operation:raw.operation,params:{alias:p.alias}};
    }
    if (p.family!==undefined && (typeof p.family!=='string' || !Object.hasOwn(C.HOSTS,p.family))) fail('HELP_UNKNOWN_FAMILY');
    const offset=p.offset??0, limit=p.limit??25;
    if (!Number.isSafeInteger(offset) || offset<0 || !Number.isSafeInteger(limit) || limit<1 || limit>50) fail('HELP_INVALID_PAGE');
    return {operation:'catalog',params:{...(p.family===undefined?{}:{family:p.family}),offset,limit}};
  }
  function fingerprint(value) {
    let h=2166136261;const s=JSON.stringify(value);
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(16).padStart(8,'0');
  }
  function parse(text) {
    const source=String(text || '');
    if (source.length>MAX_SOURCE_CHARS) fail('COMMAND_SOURCE_TOO_LARGE');
    const entries=[];let cursor=0;
    for (let m;(m=marker(source,cursor));) {
      if (entries.length>=MAX_COMMANDS) fail('TOO_MANY_COMMANDS');
      let start=m.index+m[0].length;
      while(start<source.length && /\s/u.test(source[start])) start++;
      if(source[start]!=='{') fail('MISSING_JSON');
      const end=balancedEnd(source,start);let raw;
      try { raw=JSON.parse(source.slice(start,end)); } catch (_) { fail('INVALID_JSON'); }
      if(!plain(raw))fail('INVALID_JSON_ROOT');
      if(Object.keys(raw).some(k=>k!=='operation' && k!=='params'))fail('UNKNOWN_COMMAND_FIELD');
      if(typeof raw.operation!=='string' || !/^[a-z0-9_]{1,120}$/.test(raw.operation.trim()))fail('INVALID_OPERATION');
      if(!Object.hasOwn(raw,'params') || !plain(raw.params))fail('INVALID_OPERATION_PARAMS');
      guard(raw.params);
      const kind=m[1]==='HELP'?'help':'api';let command=null,code=null;
      const commandText=m[0]+'\n'+source.slice(start,end);
      if(kind==='help') command=helpCommand(raw);
      else {
        try {
          if(!Object.hasOwn(C.OPERATIONS,raw.operation.trim()))fail('UNSUPPORTED_OPERATION');
          command=C.parseCommand(commandText); C.preflightExecution(command); C.buildRequest(command);
        } catch(error) { if(!localCodes.has(error.code))throw error; code=error.code; }
      }
      entries.push({index:entries.length,kind,operation:raw.operation.trim(),command,command_text:commandText,code,marker_index:m.index,end_index:end});
      cursor=end;
    }
    if(!entries.length)fail('NO_COMMAND_ENVELOPES');
    const single=entries.length===1 && entries[0].kind==='api' && !entries[0].code;
    return freeze({entries,operation:entries.length===1?entries[0].operation:`batch:${entries.length}`,fingerprint:single?C.commandFingerprint(entries[0].command):fingerprint(entries.map(e=>[e.kind,e.operation,e.command || e.code]))});
  }
  function card(alias) {
    const m=C.OPERATIONS[alias];
    if(!m || !Object.hasOwn(C.OPERATIONS,alias))return {operation:alias,known:false,execution_enabled:false};
    const pathParams=[...m.path.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(x=>x[1]);
    const enabled=m.execution_enabled===true && m.effect==='READ' && m.current===true;
    const runnable=enabled && !m.body_required && !m.required_query_keys.length && !pathParams.length;
    return {operation:alias,known:true,family:m.host,category:m.category,method:m.method,path:m.path,effect:m.effect,current_in_snapshot:m.current===true,execution_enabled:enabled,blocked_reason:m.blocked_reason||null,privacy:m.privacy,read_kind:m.read_kind,response_mode:m.response_mode,required_path:pathParams,query_keys:[...m.query_keys],required_query:[...m.required_query_keys],body_required:m.body_required,template:runnable?{operation:alias,params:{}}:null,template_runnable:runnable,account_access:'UNVERIFIED_REAL_ACCOUNT'};
  }
  function guidance(command) {
    const c=helpCommand(command);const all=Object.keys(C.OPERATIONS).sort();
    const enabled=all.filter(a=>card(a).execution_enabled).length;
    const common={local:true,physical_request_count:0,registry_total:all.length,registry_enabled:enabled,registry_disabled:all.length-enabled,authority:'PACKAGED_WB_REGISTRY_SNAPSHOT_NOT_LIVE_ACCOUNT_PROOF',no_hidden_calls:true};
    if(c.operation==='describe')return {...common,operation_card:card(c.params.alias)};
    const {family,offset,limit}=c.params;const selected=all.filter(a=>!family || C.OPERATIONS[a].host===family);
    const families=[...new Set(all.map(a=>C.OPERATIONS[a].host))].sort();
    const operations=selected.slice(offset,offset+limit).map(card);
    return {...common,families,total: selected.length,offset,limit,operations,next_offset:offset+operations.length<selected.length?offset+operations.length:null};
  }
  globalThis.WBCommandProtocol=Object.freeze({MAX_COMMANDS,MAX_SOURCE_CHARS,parse,hasCommands,guidance,card});
})();
