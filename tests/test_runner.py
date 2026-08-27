import pytest
from app.codex.runner import parse_jsonl,CodexError,child_env
def test_jsonl_final_only(): assert parse_jsonl('{"type":"tool","text":"bad"}\n{"type":"final","text":"draft"}')=='draft'
def test_jsonl_invalid():
 with pytest.raises(CodexError) as e: parse_jsonl('')
 assert e.value.kind=='INVALID_OUTPUT'
def test_child_env_isolated():
 e=child_env('/root/.codex_second'); assert e['CODEX_HOME']=='/root/.codex_second' and not any(k in e for k in ['TELEGRAM_BOT_TOKEN','OZON_API_KEY','WB_API_TOKEN'])
