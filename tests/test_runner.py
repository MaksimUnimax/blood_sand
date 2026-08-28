import pytest
from app.codex.runner import parse_jsonl,CodexError,child_env,exec_args
def test_jsonl_final_only(): assert parse_jsonl('{"type":"tool","text":"bad"}\n{"type":"final","text":"draft"}')=='draft'
def test_jsonl_invalid():
 with pytest.raises(CodexError) as e: parse_jsonl('')
 assert e.value.kind=='INVALID_OUTPUT'
def test_child_env_isolated():
 e=child_env('/root/.codex_second'); assert e['CODEX_HOME']=='/root/.codex_second' and not any(k in e for k in ['TELEGRAM_BOT_TOKEN','OZON_API_KEY','WB_API_TOKEN'])
def test_exec_args_allow_isolated_job_directory_without_git_repo():
 args=exec_args('/bin/codex','/var/lib/marketplace-question-operator/jobs/attempt-1','prompt')
 assert args[:5]==('/bin/codex','exec','--json','--ephemeral','--skip-git-repo-check')
 assert args[args.index('-C')+1]=='/var/lib/marketplace-question-operator/jobs/attempt-1'
 assert args[args.index('-s')+1]=='workspace-write'
 assert args[-1]=='prompt'
