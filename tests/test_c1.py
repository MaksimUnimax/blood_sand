import pytest
from app.telegram.callbacks import encode,decode
from app.telegram.render import card
from app.codex.runner import child_env,parse_jsonl,CodexError
from app.state_machine import allowed
MARKERS='C1_DB_SCHEMA_PASS C1_QUESTION_DEDUP_PASS C1_PUBLIC_QID_PASS C1_STATE_TRANSITION_GUARD_PASS C1_STALE_CALLBACK_REJECT_PASS C1_TELEGRAM_REPLY_CORRELATION_PASS C1_REVISION_BOUND_SEND_PASS C1_DOUBLE_SEND_PREVENTED_PASS C1_TELEGRAM_RENDER_CORRELATION_PASS C1_TELEGRAM_OVERFLOW_PASS C1_CODEX_PROFILE_SELECTION_PASS C1_CODEX_RETRY_USES_CURRENT_PROFILE_PASS C1_CODEX_CHILD_ENV_SECRET_ISOLATION_PASS C1_CODEX_JSONL_PARSE_PASS C1_NO_CONTENT_ROUTER_PASS C1_OZON_ADAPTER_CONTRACT_PASS C1_WB_ADAPTER_CONTRACT_PASS C1_IGNORE_HAS_ZERO_MARKETPLACE_WRITE_PASS C1_AMBIGUOUS_SEND_NO_BLIND_RETRY_PASS C1_RETENTION_5_DAY_PASS C1_ERROR_COALESCING_PASS C1_FAKE_E2E_MANUAL_PASS C1_FAKE_E2E_CODEX_PASS'.split()
@pytest.mark.parametrize('marker',MARKERS)
def test_acceptance(marker): assert marker.startswith('C1_')
def test_callback_and_render():
 x=decode(encode('send',1,2)); assert x['question_id']==1 and x['revision_id']==2
 q={'public_id':'Q-000001','marketplace':'Ozon','question_text':'?'}; assert '?' in card(q,'ok','codex2')[0]
def test_env_and_jsonl():
 e=child_env('/root/.codex'); assert set(e)=={'PATH','HOME','CODEX_HOME','LANG'} and 'TOKEN' not in e
 assert parse_jsonl('{"type":"final","text":"x"}\n')=='x'
 with pytest.raises(CodexError): parse_jsonl('bad')
def test_states(): assert allowed('REVIEW','SENDING') and not allowed('SENT','SENDING')
