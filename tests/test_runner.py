import pytest
from app.codex.runner import parse_jsonl,CodexError,child_env,exec_args

def test_jsonl_current_item_completed_agent_message():
 data='\n'.join([
  '{"type":"thread.started","thread_id":"t"}',
  '{"type":"turn.started"}',
  '{"type":"item.completed","item":{"id":"item_0","type":"reasoning","text":"hidden"}}',
  '{"type":"item.completed","item":{"id":"item_1","type":"agent_message","text":"draft"}}',
  '{"type":"turn.completed","usage":{"input_tokens":1,"cached_input_tokens":0,"cache_write_input_tokens":0,"output_tokens":1,"reasoning_output_tokens":0}}',
 ])
 assert parse_jsonl(data)=='draft'

def test_jsonl_legacy_final_only(): assert parse_jsonl('{"type":"tool","text":"bad"}\n{"type":"final","text":"draft"}')=='draft'

def test_jsonl_turn_failed_surfaces_error():
 with pytest.raises(CodexError) as e: parse_jsonl('{"type":"turn.failed","error":{"message":"boom"}}')
 assert e.value.kind=='TURN_FAILED' and e.value.msg=='boom'

def test_jsonl_invalid():
 with pytest.raises(CodexError) as e: parse_jsonl('')
 assert e.value.kind=='INVALID_OUTPUT'

def test_jsonl_no_agent_message_reports_event_shape():
 with pytest.raises(CodexError) as e: parse_jsonl('{"type":"thread.started"}\n{"type":"item.completed","item":{"type":"reasoning","text":"x"}}\n{"type":"turn.completed"}')
 assert e.value.kind=='INVALID_OUTPUT'
 assert 'item.completed' in e.value.msg and 'reasoning' in e.value.msg

def test_child_env_isolated():
 e=child_env('/root/.codex_second'); assert e['CODEX_HOME']=='/root/.codex_second' and not any(k in e for k in ['TELEGRAM_BOT_TOKEN','OZON_API_KEY','WB_API_TOKEN'])

def test_exec_args_allow_isolated_job_directory_without_git_repo():
 args=exec_args('/bin/codex','/var/lib/marketplace-question-operator/jobs/attempt-1','prompt')
 assert args[:5]==('/bin/codex','exec','--json','--ephemeral','--skip-git-repo-check')
 assert args[args.index('-C')+1]=='/var/lib/marketplace-question-operator/jobs/attempt-1'
 assert args[args.index('-s')+1]=='workspace-write'
 assert args[-1]=='prompt'
